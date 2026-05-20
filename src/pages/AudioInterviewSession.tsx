import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Square, Loader2, CheckCircle2, Save, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiWrapper } from '@/lib/apiWrapper';

const UNSUPPORTED_AUDIO_FORMAT_MESSAGE = "Your browser cannot record a supported audio format. Please switch to the latest Google Chrome or Microsoft Edge and try again.";

interface AudioInterviewSessionProps { }

const AudioInterviewSession: React.FC<AudioInterviewSessionProps> = () => {
    const { sessionId: paramSessionId } = useParams<{ sessionId: string }>();
    const [sessionId, setSessionId] = useState<string | null>(paramSessionId === 'new' ? null : paramSessionId || null);
    const location = useLocation();
    const navigate = useNavigate();

    const initialData = location.state?.initialData;
    const [questions, setQuestions] = useState<string[]>(initialData?.questions || []);
    const [totalQuestions, setTotalQuestions] = useState(initialData?.total_questions || 10);
    const initialIndex = initialData?.current_question_index || 0;

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialIndex);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
    const [currentBlob, setCurrentBlob] = useState<Blob | null>(null);
    const [recordingTimeLeft, setRecordingTimeLeft] = useState(150); // 2:30 min total
    const [currentRecordingTime, setCurrentRecordingTime] = useState(0); // Time spent in current recording
    const [warnings, setWarnings] = useState(initialData?.warnings_count || 0);
    const [isMalpractice, setIsMalpractice] = useState(false);
    const [hasStartedSession, setHasStartedSession] = useState(false);
    const [hasRetaken, setHasRetaken] = useState(false);
    const [hasAgreedToRules, setHasAgreedToRules] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(document.fullscreenElement !== null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const currentChunksRef = useRef<BlobPart[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const resultPollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const resultPollAttemptsRef = useRef(0);
    const autoSubmitAfterStopRef = useRef(false);

    const getAudioFilename = (blob: Blob) => {
        const mimeType = blob.type.split(';')[0];
        if (mimeType === 'audio/mp4' || mimeType === 'audio/aac' || mimeType === 'audio/x-m4a') {
            return 'answer.m4a';
        }
        if (mimeType === 'audio/mpeg' || mimeType === 'audio/mp3') {
            return 'answer.mp3';
        }
        if (mimeType === 'audio/wav' || mimeType === 'audio/x-wav') {
            return 'answer.wav';
        }
        if (mimeType === 'audio/ogg') {
            return 'answer.ogg';
        }
        if (mimeType === 'audio/webm') {
            return 'answer.webm';
        }
        throw new Error(UNSUPPORTED_AUDIO_FORMAT_MESSAGE);
    };

    useEffect(() => {
        const fetchSession = async () => {
            // Handle new session creation
            if (location.state?.isNew && !sessionId) {
                try {
                    const formData = new FormData();
                    formData.append('resume_pdf', location.state.resumeFile);
                    formData.append('job_description', location.state.jobDescription);

                    const response = await apiWrapper.post('/interview/audio/start', formData);

                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.detail || "Failed to start interview");
                    }

                    const data = await response.json();
                    setSessionId(data.session_id);
                    setQuestions(data.questions);
                    setTotalQuestions(data.total_questions);
                    // Update URL and state to reflect that we are no longer "new"
                    navigate(`/audio-interview/session/${data.session_id}`, { 
                        replace: true, 
                        state: { ...location.state, isNew: false, initialData: data } 
                    });
                } catch (err: any) {
                    console.error("Failed to start new interview:", err);
                    toast({
                        variant: "destructive",
                        title: "Setup Error",
                        description: err.message || "Failed to generate questions."
                    });
                    navigate('/audio-interview');
                }
                return;
            }

            if (initialData && questions.length) {
                if (initialIndex !== currentQuestionIndex) {
                    setCurrentQuestionIndex(initialIndex);
                }
                if (initialData.warnings_count !== undefined) {
                    setWarnings(initialData.warnings_count);
                }
                return;
            }
            if (!sessionId) return;

            try {
                const response = await apiWrapper.get(`/interview/audio/session/${sessionId}`);
                if (!response.ok) throw new Error("Session not found");
                const data = await response.json();
                if (!data.is_active) {
                    setIsMalpractice(true);
                }
                setWarnings(data.warnings_count || 0);
                setQuestions(data.questions);
                setTotalQuestions(data.total_questions);
                setCurrentQuestionIndex(data.current_question_index);
            } catch (err) {
                console.error("Failed to fetch audio session:", err);
                toast({
                    variant: "destructive",
                    title: "Session Error",
                    description: "Failed to resume interview session."
                });
                navigate('/audio-interview');
            }
        };

        fetchSession();

        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(stream => {
                streamRef.current = stream;
            })
            .catch(err => {
                console.error("Microphone access denied:", err);
            });

        // Security: Full Screen
        const enterFullScreen = async () => {
            try {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                }
            } catch (err) {
                console.error("Fullscreen request failed", err);
            }
        };

        // We try to enter fullscreen. If it fails (requires user gesture), we'll try again on first click.
        enterFullScreen();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (currentAudioUrl) {
                URL.revokeObjectURL(currentAudioUrl);
            }
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            if (resultPollTimeoutRef.current) clearTimeout(resultPollTimeoutRef.current);
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
        };
    }, [initialData, navigate, questions.length, sessionId, initialIndex]);

    // Anti-Cheating Listeners
    useEffect(() => {
        if (isMalpractice || isProcessing) return;

        const handleWarning = async (reason: string) => {
            try {
                const response = await apiWrapper.post(`/interview/audio/${sessionId}/warning`);
                const data = await response.json();
                setWarnings(data.warnings_count);
                
                if (data.warnings_count >= 5 || !data.is_active) {
                    setIsMalpractice(true);
                    toast({
                        variant: "destructive",
                        title: "Interview Terminated",
                        description: "Tried to malpractice. Interview ended."
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "Warning!",
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

    // Handle timer - starts per question
    useEffect(() => {
        if (isMalpractice || isProcessing || isUploading || !hasStartedSession || !isFullscreen) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            return;
        }

        timerIntervalRef.current = setInterval(() => {
            setRecordingTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerIntervalRef.current!);
                    if (isRecording) {
                        autoSubmitAfterStopRef.current = true;
                        stopRecording();
                    } else if (currentBlob) {
                        handleNextQuestion();
                    } else {
                        skipCurrentQuestion("Candidate failed to answer this question within the time limit.");
                    }
                    return 0;
                }
                return prev - 1;
            });

            if (isRecording) {
                setCurrentRecordingTime(prev => {
                    if (prev >= 119) { // 2 minutes limit
                        stopRecording();
                        toast({
                            title: "Recording Limit",
                            description: "Maximum recording time of 2 minutes reached."
                        });
                        return 120;
                    }
                    return prev + 1;
                });
            }
        }, 1000);

        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [currentQuestionIndex, currentBlob, isMalpractice, isProcessing, isUploading, isRecording, hasStartedSession, isFullscreen]);


    const ensureStream = async () => {
        if (streamRef.current && streamRef.current.getTracks().every(t => t.readyState === 'live')) {
            return streamRef.current;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            streamRef.current = stream;
            return stream;
        } catch (err) {
            console.error("Failed to re-initialize microphone:", err);
            return null;
        }
    };

    const startRecording = async () => {
        if (!document.fullscreenElement) {
            await reenterFullscreen();
            return;
        }

        if (currentAudioUrl) {
            if (hasRetaken) {
                toast({
                    variant: "destructive",
                    title: "Limit Reached",
                    description: "Only one retake is allowed per question."
                });
                return;
            }
            // Retake logic: add 60 seconds to total question timer (capped at 150s)
            setRecordingTimeLeft(prev => Math.min(150, prev + 60));
            setHasRetaken(true);
            URL.revokeObjectURL(currentAudioUrl);
            setCurrentAudioUrl(null);
            setCurrentBlob(null);
        }
        
        setIsRecording(true);
        setCurrentRecordingTime(0); // Reset current recording timer
        currentChunksRef.current = [];

        try {
            const stream = await ensureStream();
            if (!stream) {
                setIsRecording(false);
                return;
            }

            let mimeType = '';
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                mimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/webm')) {
                mimeType = 'audio/webm';
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4';
            }
            if (!mimeType) {
                toast({
                    variant: "destructive",
                    title: "Unsupported Browser",
                    description: UNSUPPORTED_AUDIO_FORMAT_MESSAGE
                });
                setIsRecording(false);
                return;
            }

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    currentChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(currentChunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                setCurrentBlob(blob);
                setCurrentAudioUrl(url);
                setIsRecording(false);
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

                if (autoSubmitAfterStopRef.current) {
                    autoSubmitAfterStopRef.current = false;
                    handleNextQuestionWithBlob(blob);
                }
            };

            mediaRecorder.start(200);
        } catch (err) {
            console.error("MediaRecorder start failed:", err);
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };

    const advanceAfterAnswer = async () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setCurrentAudioUrl(null);
            setCurrentBlob(null);
            setRecordingTimeLeft(150);
            setHasRetaken(false);
            currentChunksRef.current = [];
        } else {
            await submitInterview();
        }
    };

    const handleNextQuestionWithBlob = async (blob: Blob | null) => {
        if (!blob || !sessionId) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Recording or session missing. Please try again."
            });
            return;
        }
        if (blob.size === 0) {
            await skipCurrentQuestion("Candidate failed to answer this question within the time limit.");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('audio', blob, getAudioFilename(blob));
            formData.append('question_index', currentQuestionIndex.toString());
            formData.append('retaken', hasRetaken ? 'true' : 'false');

            const response = await apiWrapper.post(`/interview/audio/${sessionId}/answer`, formData);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || "Failed to upload answer");
            }

            await advanceAfterAnswer();
        } catch (error: any) {
            console.error("Answer submission error:", error);
            toast({
                variant: "destructive",
                title: error.message === UNSUPPORTED_AUDIO_FORMAT_MESSAGE ? "Unsupported Browser" : "Upload Failed",
                description: error.message || "Failed to save your answer. Please try again."
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleNextQuestion = async () => {
        await handleNextQuestionWithBlob(currentBlob);
    };

    const skipCurrentQuestion = async (reason: string) => {
        if (!sessionId || isUploading) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('question_index', currentQuestionIndex.toString());
            formData.append('reason', reason);

            const response = await apiWrapper.post(`/interview/audio/${sessionId}/skip`, formData);
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || "Could not move to the next question.");
            }

            toast({
                variant: "destructive",
                title: "Time Limit Reached",
                description: "No answer was recorded. Moving to the next question."
            });
            await advanceAfterAnswer();
        } catch (error: any) {
            console.error("Question skip error:", error);
            toast({
                variant: "destructive",
                title: "Question Skip Failed",
                description: error.message || "Could not move to the next question. Please try again."
            });
        } finally {
            setIsUploading(false);
        }
    };

    const submitInterview = async () => {
        setIsProcessing(true);
        // Automatically exit fullscreen when analysis starts
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { });
        }
        try {
            const response = await apiWrapper.post(`/interview/audio/${sessionId}/result`);

            if (response.status === 202) {
                resultPollAttemptsRef.current += 1;
                if (resultPollAttemptsRef.current > 36) {
                    throw new Error("Interview is still processing. Please try again shortly.");
                }
                resultPollTimeoutRef.current = setTimeout(() => {
                    submitInterview();
                }, 5000);
                return;
            }

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to submit interview");
            }

            resultPollAttemptsRef.current = 0;
            const resultData = await response.json();
            navigate(`/interview/results/${sessionId}`, { state: { resultData } });

        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to analyze interview.",
            });
            setIsProcessing(false);
        }
    };

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

    if (isMalpractice) {
        return (
            <div className="min-h-screen bg-secondary/30 flex flex-col items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-strong border-t-4 border-t-red-600">
                    <CardContent className="p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <Square className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground font-poppins">Interview Discarded</h2>
                        <p className="text-muted-foreground font-medium">
                            This interview has been discarded due to malpractice (detected multiple tab switches or exiting full screen).
                        </p>
                        <p className="text-sm text-muted-foreground">
                            No results will be generated for this session. Please maintain focus in your next attempt.
                        </p>
                        <Button 
                            className="w-full bg-red-600 hover:bg-red-700 text-white" 
                            onClick={() => navigate('/dashboard')}
                        >
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
                                    <Mic className="w-5 h-5" /> Recording Rules
                                </h3>
                                <ul className="text-sm text-muted-foreground space-y-3">
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        <span>Total time per question: <strong>2:30 minutes</strong> (Read + Answer).</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        <span>Max recording length: <strong>2 minutes</strong>.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        <span>You can <strong>Retake</strong> an answer only <strong>once</strong> per question.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        <span>Retaking adds <strong>1 extra minute</strong> to your remaining time.</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold flex items-center gap-2 text-red-500">
                                    <Square className="w-5 h-5" /> Anti-Cheating Policy
                                </h3>
                                <ul className="text-sm text-muted-foreground space-y-3">
                                    <li className="flex gap-2">
                                        <span className="text-red-500 font-bold">•</span>
                                        <span>The interview must be conducted in <strong>Full Screen</strong> mode.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-red-500 font-bold">•</span>
                                        <span><strong>Do not switch tabs</strong> or minimize the browser.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-red-500 font-bold">•</span>
                                        <span>Exiting full screen counts as a <strong>Warning</strong> and pauses the interview.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-red-500 font-bold">•</span>
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
                            disabled={!hasAgreedToRules || !questions.length}
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
                            {!questions.length ? (
                                <>
                                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                    Preparing Your Questions...
                                </>
                            ) : (
                                "Start Interview Now"
                            )}
                        </Button>
                        {!questions.length && (
                            <p className="text-xs text-center text-muted-foreground animate-pulse">
                                Hang tight! Our AI is tailoring questions based on your profile...
                            </p>
                        )}
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
                            <AlertCircle className="w-10 h-10 text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground font-poppins">Interview Paused</h2>
                        <p className="text-muted-foreground">
                            Full-screen mode is mandatory for this interview. Please return to full-screen to resume.
                        </p>
                        <Button 
                            className="w-full gradient-primary" 
                            onClick={reenterFullscreen}
                        >
                            Resume Interview (Re-enter Full Screen)
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!questions.length) return null;

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-secondary/30 flex flex-col">
            <header className="bg-white shadow-soft border-b p-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gradient font-poppins">Rapid Fire Audio Interview</h1>
                    <div className="flex items-center gap-4">
                        <div className={`text-sm font-bold px-3 py-1 rounded-full ${warnings >= 4 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                            Warnings: {warnings}/5
                        </div>
                        {recordingTimeLeft < 30 && (
                            <div className="flex items-center gap-2 text-red-500 font-mono font-bold animate-pulse">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                {formatTime(recordingTimeLeft)}
                            </div>
                        )}
                        <div className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                            Question {currentQuestionIndex + 1} of {totalQuestions}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col justify-center items-center">
                {isProcessing ? (
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                            <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
                        </div>
                        <h2 className="text-2xl font-bold font-poppins text-center">Analyzing Your Answers...</h2>
                        <p className="text-muted-foreground text-center max-w-md">
                            Our AI is reviewing your transcripts and generating your performance report. This may take a minute.
                        </p>
                    </div>
                ) : (
                    <Card className="w-full shadow-strong border-0 gradient-card overflow-hidden">
                        <CardContent className="p-8 md:p-12">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-foreground font-poppins leading-relaxed select-none">
                                    {currentQuestion}
                                </h2>
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-sm text-muted-foreground font-medium">Time Remaining: <span className={recordingTimeLeft < 30 ? 'text-red-500 font-bold' : ''}>{formatTime(recordingTimeLeft)}</span></p>
                                    <p className="text-xs text-muted-foreground">Read question & record your answer before time runs out.</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center space-y-8">
                                <div className={`relative flex items-center justify-center w-32 h-32 rounded-full border-4 transition-all duration-300 ${isRecording ? 'border-red-500 bg-red-50' : currentAudioUrl ? 'border-green-500 bg-green-50' : 'border-primary bg-primary/5'}`}>
                                    {isRecording && (
                                        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                                    )}
                                    {isRecording && (
                                        <span className="absolute -top-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                                            {formatTime(recordingTimeLeft)}
                                        </span>
                                    )}
                                    {currentAudioUrl && !isRecording ? (
                                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                                    ) : (
                                        <Mic className={`w-12 h-12 ${isRecording ? 'text-red-500' : 'text-primary'}`} />
                                    )}
                                </div>

                                {currentAudioUrl && !isRecording && (
                                    <div className="w-full max-w-sm space-y-4">
                                        <div className="flex flex-col items-center space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground">Review your answer:</p>
                                            <audio controls src={currentAudioUrl} className="w-full h-10" />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    {!isRecording ? (
                                        <Button
                                            size="lg"
                                            onClick={startRecording}
                                            disabled={isUploading}
                                            className={`${currentAudioUrl ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'gradient-primary'} px-8`}
                                        >
                                            <Mic className="w-4 h-4 mr-2" />
                                            {currentAudioUrl ? 'Retake Answer' : 'Start Answering'}
                                        </Button>
                                    ) : (
                                        <Button
                                            size="lg"
                                            variant="destructive"
                                            onClick={stopRecording}
                                            className="px-8 shadow-glow-sm"
                                        >
                                            <Square className="w-4 h-4 mr-2" />
                                            Stop Recording
                                        </Button>
                                    )}
                                </div>

                                <div className="pt-8 border-t w-full flex justify-center">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={handleNextQuestion}
                                        disabled={isRecording || !currentAudioUrl || isUploading}
                                        className="w-full md:w-auto min-w-[200px] border-primary text-primary hover:bg-primary/5"
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving Answer...
                                            </>
                                        ) : isLastQuestion ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Finish & Submit
                                            </>
                                        ) : (
                                            "Next Question"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
};

export default AudioInterviewSession;
