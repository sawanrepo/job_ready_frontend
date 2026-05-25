import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Mic, Radio, Send, Square } from 'lucide-react';
import { InterviewResponse } from '@/types/interview';
import { toast } from '@/hooks/use-toast';
import { apiWrapper } from '@/lib/apiWrapper';
import { AdsterraResponsiveBanner } from '@/components/AdsterraAd';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const QUESTION_SECONDS = 120;
const LIVE_ANSWER_SECONDS = 110;

const buildLiveSocketUrl = (sessionId: string, token: string) => {
    const wsBase = API_BASE_URL.replace(/\/$/, '').replace(/^http/, 'ws');
    return `${wsBase}/interview/${sessionId}/live?token=${encodeURIComponent(token)}`;
};

const refreshAccessTokenForLiveSocket = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        throw new Error("Your login session expired. Please login again.");
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    return data.access_token as string;
};

const pcm16FromFloat32 = (input: Float32Array, inputSampleRate: number, outputSampleRate = 16000) => {
    const ratio = inputSampleRate / outputSampleRate;
    const outputLength = Math.max(1, Math.round(input.length / ratio));
    const result = new Int16Array(outputLength);

    let inputOffset = 0;
    for (let outputOffset = 0; outputOffset < outputLength; outputOffset++) {
        const nextInputOffset = Math.min(input.length, Math.round((outputOffset + 1) * ratio));
        let sum = 0;
        let count = 0;

        for (let i = inputOffset; i < nextInputOffset; i++) {
            sum += input[i];
            count++;
        }

        const sample = Math.max(-1, Math.min(1, count ? sum / count : 0));
        result[outputOffset] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        inputOffset = nextInputOffset;
    }

    return result.buffer;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

const InterviewSession: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [questionData, setQuestionData] = useState<InterviewResponse | null>(location.state?.initialData || null);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [liveStatus, setLiveStatus] = useState('');
    const [warnings, setWarnings] = useState(location.state?.initialData?.warnings_count || 0);
    const [isMalpractice, setIsMalpractice] = useState(false);
    const [hasStartedSession, setHasStartedSession] = useState(false);
    const [hasAgreedToRules, setHasAgreedToRules] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(document.fullscreenElement !== null);
    const [recordingTimeLeft, setRecordingTimeLeft] = useState(QUESTION_SECONDS);
    const [currentRecordingTime, setCurrentRecordingTime] = useState(0);
    const [isQuestionExpired, setIsQuestionExpired] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const videoFrameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const attachStreamToVideo = async (stream: MediaStream) => {
        const video = videoRef.current;
        if (!video) return;

        if (video.srcObject !== stream) {
            video.srcObject = stream;
        }

        try {
            await video.play();
        } catch (err) {
            console.error("Video preview play failed:", err);
        }
    };

    const cleanupLiveTransport = () => {
        if (videoFrameIntervalRef.current) {
            clearInterval(videoFrameIntervalRef.current);
            videoFrameIntervalRef.current = null;
        }

        if (audioProcessorRef.current) {
            audioProcessorRef.current.disconnect();
            audioProcessorRef.current.onaudioprocess = null;
            audioProcessorRef.current = null;
        }

        if (audioSourceRef.current) {
            audioSourceRef.current.disconnect();
            audioSourceRef.current = null;
        }

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => { });
        }
        audioContextRef.current = null;
    };

    const closeLiveSocket = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.close(1000);
        }
        wsRef.current = null;
    };

    const cleanupLiveSession = () => {
        cleanupLiveTransport();
        closeLiveSocket();
    };

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                streamRef.current = stream;
                await attachStreamToVideo(stream);
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Camera/Microphone access is required for the interview.");
            }
        };

        const fetchSession = async () => {
            if (questionData) {
                if (questionData.warnings_count !== undefined) {
                    setWarnings(questionData.warnings_count);
                }
                if (questionData.is_active === false) {
                    setIsMalpractice(true);
                }
                return;
            }

            try {
                const response = location.state?.resumeGraceRequested
                    ? await apiWrapper.post(`/interview/${sessionId}/resume-grace`)
                    : await apiWrapper.get(`/interview/session/${sessionId}`);

                if (!response.ok) throw new Error("Session not found");

                const data = await response.json();
                setQuestionData(data);
                setWarnings(data.warnings_count || 0);
                if (location.state?.resumeGraceRequested) {
                    navigate(location.pathname, { replace: true, state: { ...location.state, resumeGraceRequested: false } });
                }
                if (data.is_active === false) {
                    setIsMalpractice(true);
                }
            } catch (err) {
                console.error("Failed to fetch session:", err);
                alert("Failed to resume interview session.");
                navigate('/interview/setup');
            }
        };

        startCamera();
        fetchSession();

        const enterFullScreen = async () => {
            try {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                }
            } catch (err) {
                console.error("Fullscreen request failed", err);
            }
        };
        enterFullScreen();

        return () => {
            cleanupLiveSession();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
        };
    }, [sessionId, navigate]);

    useEffect(() => {
        if (!hasStartedSession) return;
        const stream = streamRef.current;
        if (stream && stream.getTracks().every(t => t.readyState === 'live')) {
            attachStreamToVideo(stream);
        }
    }, [hasStartedSession, questionData]);

    const reenterFullscreen = async () => {
        try {
            await document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Fullscreen Required",
                description: "Please click the button to re-enter fullscreen mode."
            });
        }
    };

    const applyInterviewResponse = (result: InterviewResponse) => {
        cleanupLiveTransport();
        wsRef.current = null;
        setIsRecording(false);
        setIsProcessing(false);
        setLiveStatus('');

        if (result.interview_ended) {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
            navigate(`/interview/results/${sessionId}`);
        } else {
            setQuestionData(result);
            setRecordingTimeLeft(QUESTION_SECONDS);
            setCurrentRecordingTime(0);
            setIsQuestionExpired(false);
        }
    };

    const skipQuestion = async (reason: string) => {
        if (!sessionId || isProcessing) return;

        cleanupLiveSession();
        setIsRecording(false);
        setIsProcessing(true);
        const formData = new FormData();
        formData.append('reason', reason);

        try {
            const response = await apiWrapper.post(`/interview/${sessionId}/skip`, formData);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || "Could not move to the next question.");
            }
            const result: InterviewResponse = await response.json();
            applyInterviewResponse(result);
        } catch (error) {
            console.error(error);
            toast({
                title: "Question Skip Failed",
                description: error instanceof Error ? error.message : "Could not move to the next question. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const stopRecording = () => {
        if (!isRecording) return;

        cleanupLiveTransport();
        setIsRecording(false);
        setIsProcessing(true);
        setLiveStatus("Generating next question from your live answer...");

        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'finish_answer' }));
        } else {
            setIsProcessing(false);
            setLiveStatus('');
            toast({
                variant: "destructive",
                title: "Live Connection Lost",
                description: "Could not send your answer. Please try this question again."
            });
        }
    };

    useEffect(() => {
        if (!hasStartedSession || isMalpractice || isProcessing) return;

        const handleWarning = async (reason: string) => {
            try {
                const response = await apiWrapper.post(`/interview/${sessionId}/warning`);

                if (!response.ok) throw new Error("Failed to report warning");

                const data = await response.json();
                setWarnings(data.warnings_count);

                if (data.warnings_count >= 5 || data.is_active === false) {
                    setIsMalpractice(true);
                    cleanupLiveSession();
                    toast({
                        variant: "destructive",
                        title: "Interview Terminated",
                        description: "Security infraction threshold reached. Session terminated."
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "Security Warning!",
                        description: `${reason} detected! Warning ${data.warnings_count}/5`
                    });
                }
            } catch (err) {
                console.error("Failed to report warning:", err);
            }
        };

        const onVisibilityChange = () => {
            if (document.hidden) {
                handleWarning("Tab change");
            }
        };

        const onFullscreenChange = () => {
            const isFull = document.fullscreenElement !== null;
            setIsFullscreen(isFull);
            if (!isFull && !isMalpractice && hasStartedSession) {
                handleWarning("Exit full screen");
                if (isRecording) stopRecording();
            }
        };

        const onCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            toast({
                title: "Action Prohibited",
                description: "Copying is disabled during the interview."
            });
        };

        document.addEventListener("visibilitychange", onVisibilityChange);
        document.addEventListener("fullscreenchange", onFullscreenChange);
        document.addEventListener("copy", onCopy as any);

        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            document.removeEventListener("fullscreenchange", onFullscreenChange);
            document.removeEventListener("copy", onCopy as any);
        };
    }, [sessionId, isMalpractice, hasStartedSession, isRecording, isProcessing]);

    useEffect(() => {
        if (isMalpractice || isProcessing || !hasStartedSession || !isFullscreen) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            return;
        }

        timerIntervalRef.current = setInterval(() => {
            setRecordingTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerIntervalRef.current!);
                    if (isRecording) {
                        stopRecording();
                    } else {
                        setIsQuestionExpired(true);
                        toast({
                            variant: "destructive",
                            title: "Time Limit Reached",
                            description: "No answer was recorded. Moving to the next question."
                        });
                        skipQuestion("Candidate failed to answer this question within the live answer time limit.");
                    }
                    return 0;
                }
                return prev - 1;
            });

            if (isRecording) {
                setCurrentRecordingTime(prev => {
                    if (prev >= LIVE_ANSWER_SECONDS - 1) {
                        stopRecording();
                        toast({
                            title: "Live Answer Captured",
                            description: "Maximum live answer time reached. Generating the next question."
                        });
                        return LIVE_ANSWER_SECONDS;
                    }
                    return prev + 1;
                });
            }
        }, 1000);

        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [questionData, isMalpractice, isProcessing, isRecording, hasStartedSession, isFullscreen]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const ensureStream = async () => {
        if (streamRef.current && streamRef.current.getTracks().every(t => t.readyState === 'live')) {
            await attachStreamToVideo(streamRef.current);
            return streamRef.current;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            await attachStreamToVideo(stream);
            return stream;
        } catch (err) {
            console.error("Failed to re-initialize camera:", err);
            toast({
                variant: "destructive",
                title: "Camera Error",
                description: "Could not access camera and microphone. Please check permissions."
            });
            return null;
        }
    };

    const sendVideoFrame = () => {
        const ws = wsRef.current;
        const video = videoRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN || !video || video.readyState < 2) return;

        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
            if (!blob || ws.readyState !== WebSocket.OPEN) return;
            const data = arrayBufferToBase64(await blob.arrayBuffer());
            ws.send(JSON.stringify({
                type: 'video_frame',
                mime_type: 'image/jpeg',
                data,
            }));
        }, 'image/jpeg', 0.55);
    };

    const startLiveMediaStreaming = async (stream: MediaStream, ws: WebSocket) => {
        const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextCtor();
        await audioContext.resume();

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (event) => {
            if (ws.readyState !== WebSocket.OPEN) return;

            const output = event.outputBuffer.getChannelData(0);
            output.fill(0);

            const input = event.inputBuffer.getChannelData(0);
            const pcm = pcm16FromFloat32(input, audioContext.sampleRate);
            if (pcm.byteLength > 0) {
                ws.send(pcm);
            }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);

        audioContextRef.current = audioContext;
        audioSourceRef.current = source;
        audioProcessorRef.current = processor;

        sendVideoFrame();
        videoFrameIntervalRef.current = setInterval(sendVideoFrame, 1000);
    };

    const openLiveSocket = async () => {
        if (!sessionId) {
            throw new Error("Session not found");
        }

        const token = await refreshAccessTokenForLiveSocket();

        return new Promise<WebSocket>((resolve, reject) => {
            let settled = false;

            const fail = (error: Error) => {
                if (!settled) {
                    settled = true;
                    reject(error);
                }
            };

            const succeed = (ws: WebSocket) => {
                if (!settled) {
                    settled = true;
                    resolve(ws);
                }
            };

            const ws = new WebSocket(buildLiveSocketUrl(sessionId, token));
            ws.binaryType = 'arraybuffer';
            wsRef.current = ws;

            ws.onopen = () => {
                ws.send(JSON.stringify({ type: 'start_answer' }));
            };

            ws.onmessage = (event) => {
                if (typeof event.data !== 'string') return;
                const message = JSON.parse(event.data);

                if (message.type === 'listening') {
                    setLiveStatus(message.message || 'AI is listening. Answer clearly and finish when done.');
                    succeed(ws);
                    return;
                }

                if (message.type === 'ready' || message.type === 'processing') {
                    setLiveStatus(message.message || 'Live interview is processing...');
                    return;
                }

                if (message.type === 'question') {
                    applyInterviewResponse(message.data as InterviewResponse);
                    return;
                }

                if (message.type === 'error') {
                    const errorMessage = message.message || "Could not process this live answer.";
                    cleanupLiveTransport();
                    wsRef.current = null;
                    setIsRecording(false);
                    setIsProcessing(false);
                    setLiveStatus('');

                    if (!settled) {
                        fail(new Error(errorMessage));
                        return;
                    }

                    toast({
                        variant: "destructive",
                        title: "Live Interview Error",
                        description: errorMessage
                    });
                }
            };

            ws.onerror = () => {
                fail(new Error("Could not connect to the live interview model."));
            };

            ws.onclose = (event) => {
                if (!settled && event.code !== 1000) {
                    fail(new Error("Live interview connection closed before it was ready."));
                }

                if (event.code !== 1000 && (isRecording || isProcessing)) {
                    cleanupLiveTransport();
                    setIsRecording(false);
                    setIsProcessing(false);
                    setLiveStatus('');
                }
            };
        });
    };

    const startRecording = async () => {
        if (isQuestionExpired) {
            toast({
                variant: "destructive",
                title: "Time Limit Reached",
                description: "This question's time has expired."
            });
            return;
        }

        if (!document.fullscreenElement) {
            await reenterFullscreen();
            return;
        }

        setIsRecording(true);
        setCurrentRecordingTime(0);
        setLiveStatus("Connecting to AI Live...");

        try {
            const stream = await ensureStream();
            if (!stream) {
                setIsRecording(false);
                setLiveStatus('');
                return;
            }

            const ws = await openLiveSocket();
            await startLiveMediaStreaming(stream, ws);
            setLiveStatus("AI is listening. Answer clearly and finish when done.");
        } catch (err) {
            console.error("Live interview start failed:", err);
            cleanupLiveSession();
            setIsRecording(false);
            setLiveStatus('');
            toast({
                variant: "destructive",
                title: "Live Interview Failed",
                description: err instanceof Error ? err.message : "Could not start the live interview. Please try again."
            });
        }
    };

    if (isMalpractice) {
        return (
            <div className="min-h-screen bg-secondary/30 flex flex-col items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-strong border-t-4 border-t-red-600">
                    <CardContent className="p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                            <Square className="w-10 h-10 text-red-600 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground font-poppins">Interview Discarded</h2>
                        <p className="text-muted-foreground font-medium">
                            This interview has been discarded due to malpractice.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            No results will be generated for this session. Please maintain focus in your next attempt.
                        </p>
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white shadow-glow-sm" onClick={() => navigate('/dashboard')}>
                            Return to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!hasStartedSession) {
        return (
            <div className="min-h-screen bg-secondary/30 flex flex-col items-center justify-center p-4">
                <Card className="w-full max-w-xl shadow-strong">
                    <CardHeader className="text-center border-b pb-6">
                        <CardTitle className="text-3xl font-bold text-gradient font-poppins">Interview Rules & Guidelines</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-bold flex items-center gap-2 text-primary">
                                    <Radio className="w-5 h-5" /> Live Video Rules
                                </h3>
                                <ul className="text-sm text-muted-foreground space-y-3">
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold">&bull;</span>
                                        <span>Your camera and microphone stream live while you answer.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold">&bull;</span>
                                        <span>You get up to <strong>2 minutes</strong> per question.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold">&bull;</span>
                                        <span>Click <strong>Finish Answer</strong> when you are done speaking.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold">&bull;</span>
                                        <span>Ensure you are in a quiet, well-lit environment.</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold flex items-center gap-2 text-red-500">
                                    <Square className="w-5 h-5" /> Anti-Cheating Policy
                                </h3>
                                <ul className="text-sm text-muted-foreground space-y-3">
                                    <li className="flex gap-2">
                                        <span className="text-red-500 font-bold">&bull;</span>
                                        <span>The interview must be conducted in <strong>Full Screen</strong> mode.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-red-500 font-bold">&bull;</span>
                                        <span><strong>Do not switch tabs</strong> or minimize the browser window.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-red-500 font-bold">&bull;</span>
                                        <span>Exiting full screen counts as a <strong>Warning</strong> and pauses the session.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-red-500 font-bold">&bull;</span>
                                        <span><strong>5 Warnings</strong> will result in immediate termination.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-secondary/50 p-4 rounded-lg border border-dashed border-primary/30 mt-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-primary text-primary focus:ring-primary cursor-pointer"
                                    checked={hasAgreedToRules}
                                    onChange={(e) => setHasAgreedToRules(e.target.checked)}
                                />
                                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                    I have read and understand the rules, and I wish to proceed.
                                </span>
                            </label>
                        </div>

                        <Button
                            className="w-full gradient-primary py-7 text-xl font-bold shadow-glow-sm"
                            disabled={!hasAgreedToRules || !questionData}
                            onClick={async () => {
                                try {
                                    await document.documentElement.requestFullscreen();
                                    setIsFullscreen(true);
                                    setHasStartedSession(true);
                                } catch (err) {
                                    setIsFullscreen(false);
                                    toast({
                                        variant: "destructive",
                                        title: "Fullscreen Required",
                                        description: "Please allow fullscreen mode to start the interview."
                                    });
                                }
                            }}
                        >
                            {!questionData ? (
                                <>
                                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                    Preparing Your Questions...
                                </>
                            ) : (
                                "Start Live Interview"
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isFullscreen) {
        return (
            <div className="min-h-screen bg-secondary/30 flex flex-col items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-strong border-t-4 border-t-orange-500">
                    <CardContent className="p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="w-10 h-10 text-orange-600 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground font-poppins">Interview Paused</h2>
                        <p className="text-muted-foreground">
                            Full-screen mode is mandatory for this interview. Please return to full-screen to resume.
                        </p>
                        <Button className="w-full gradient-primary" onClick={reenterFullscreen}>
                            Resume Interview
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!questionData) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle>Question {questionData.question_number} / {questionData.total_questions}</CardTitle>
                            <div className="flex items-center gap-2">
                                <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${warnings >= 4 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                    Warnings: {warnings}/5
                                </div>
                                {recordingTimeLeft < 30 && (
                                    <div className="flex items-center gap-2 text-red-500 font-mono font-bold animate-pulse">
                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                        {formatTime(recordingTimeLeft)}
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-lg font-medium">{questionData.question}</p>
                            <div className="flex flex-col gap-1 border-t pt-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Time Remaining:</span>
                                    <span className={`font-mono font-bold ${recordingTimeLeft < 30 ? 'text-red-500 text-base animate-pulse' : 'text-primary'}`}>
                                        {formatTime(recordingTimeLeft)}
                                    </span>
                                </div>
                                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${recordingTimeLeft < 30 ? 'bg-red-500 animate-pulse' : 'bg-primary'}`}
                                        style={{ width: `${(recordingTimeLeft / QUESTION_SECONDS) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-[11px] text-muted-foreground text-center mt-1">
                                    Live answer streams to Gemini while you speak.
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-3">
                        {!isRecording && !isProcessing && (
                            <Button onClick={startRecording} className="w-full bg-red-600 hover:bg-red-700">
                                <Mic className="mr-2 h-4 w-4" /> Start Answer
                            </Button>
                        )}

                        {isRecording && (
                            <Button onClick={stopRecording} variant="destructive" className="w-full">
                                <Send className="mr-2 h-4 w-4" /> Finish Answer
                            </Button>
                        )}

                        {isProcessing && (
                            <Button disabled className="w-full">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analysing Live Answer
                            </Button>
                        )}

                        {liveStatus && (
                            <p className="text-sm text-muted-foreground text-center animate-pulse font-medium">
                                {liveStatus}
                            </p>
                        )}
                    </div>
                </div>

                <Card className="overflow-hidden">
                    <CardContent className="p-0 relative aspect-video bg-black">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />

                        {isRecording && (
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-md animate-pulse z-20">
                                <span className="flex h-2 w-2 rounded-full bg-white animate-ping"></span>
                                LIVE: {formatTime(Math.max(0, LIVE_ANSWER_SECONDS - currentRecordingTime))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <AdsterraResponsiveBanner className="mt-8 px-0" />
        </div>
    );
};

export default InterviewSession;
