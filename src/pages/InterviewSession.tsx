import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mic, Square, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { InterviewResponse } from '@/types/interview';
import { toast } from '@/hooks/use-toast';
import { apiWrapper } from '@/lib/apiWrapper';

const InterviewSession: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    // State
    const [questionData, setQuestionData] = useState<InterviewResponse | null>(location.state?.initialData || null);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const [warnings, setWarnings] = useState(location.state?.initialData?.warnings_count || 0);
    const [isMalpractice, setIsMalpractice] = useState(false);
    const [hasStartedSession, setHasStartedSession] = useState(false);
    const [hasAgreedToRules, setHasAgreedToRules] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(document.fullscreenElement !== null);

    const [recordingTimeLeft, setRecordingTimeLeft] = useState(180); // 3 minutes total
    const [currentRecordingTime, setCurrentRecordingTime] = useState(0); // Time spent in current recording
    const [hasRetaken, setHasRetaken] = useState(false);

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const autoSubmitAfterStopRef = useRef(false);

    // Initialize Camera & Fetch Session if missing
    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
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
                const response = await apiWrapper.get(`/interview/session/${sessionId}`);
                
                if (!response.ok) throw new Error("Session not found");
                
                const data = await response.json();
                setQuestionData(data);
                setWarnings(data.warnings_count || 0);
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

        // Security: Full Screen initial check
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
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
        };
    }, [sessionId, questionData, navigate]);

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

    // Anti-Cheating Listeners
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

    // Handle timer - starts per question
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
                        autoSubmitAfterStopRef.current = true;
                        stopRecording();
                    } else {
                        // If they aren't recording yet, auto-submit whatever is in chunksRef
                        if (chunksRef.current.length > 0) {
                            submitResponse();
                        } else {
                            toast({
                                variant: "destructive",
                                title: "Time Limit Reached",
                                description: "You did not submit an answer in time. Moving to the next question."
                            });
                            // Force next question by skipping or handling empty submit
                            chunksRef.current = [new Blob([], { type: 'video/webm' })];
                            submitResponse();
                        }
                    }
                    return 0;
                }
                return prev - 1;
            });

            if (isRecording) {
                setCurrentRecordingTime(prev => {
                    if (prev >= 149) { // 2:30 min max limit (150s)
                        stopRecording();
                        toast({
                            title: "Recording Limit",
                            description: "Maximum recording time of 2 minutes and 30 seconds reached."
                        });
                        return 150;
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
            return streamRef.current;
        }
        
        // Re-initialize if stream is dead or tracks stopped
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            return stream;
        } catch (err) {
            console.error("Failed to re-initialize camera:", err);
            toast({
                variant: "destructive",
                title: "Camera Error",
                description: "Could not access camera for retake. Please check permissions."
            });
            return null;
        }
    };

    const startRecording = async () => {
        if (videoUrl) {
            if (hasRetaken) {
                toast({
                    variant: "destructive",
                    title: "Limit Reached",
                    description: "Only one retake is allowed per question."
                });
                return;
            }
            // Retake logic: add 60 seconds to total question timer (capped at 180s)
            setRecordingTimeLeft(prev => Math.min(180, prev + 60));
            setHasRetaken(true);
            URL.revokeObjectURL(videoUrl);
            setVideoUrl(null);
        }

        // 1. Immediate UI feedback
        setIsRecording(true);
        chunksRef.current = [];

        try {
            const stream = await ensureStream();
            if (!stream) {
                setIsRecording(false);
                return;
            }

            // Detect supported MIME type
            let mimeType = 'video/webm;codecs=vp9';
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                mimeType = 'video/webm;codecs=vp9';
            } else if (MediaRecorder.isTypeSupported('video/webm')) {
                mimeType = 'video/webm';
            } else if (MediaRecorder.isTypeSupported('video/mp4')) {
                mimeType = 'video/mp4';
            }

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                setVideoUrl(url);
                setIsRecording(false);
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

                if (autoSubmitAfterStopRef.current) {
                    autoSubmitAfterStopRef.current = false;
                    submitResponseDirect(blob);
                }
            };

            setCurrentRecordingTime(0); // Reset current recording duration
            mediaRecorder.start(200); // Collect data periodically for better stability
        } catch (err) {
            console.error("MediaRecorder start failed:", err);
            toast({
                variant: "destructive",
                title: "Recording Failed",
                description: "Could not start the camera recorder. Please refresh and try again."
            });
            setIsRecording(false);
        }
    };


    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };


    const submitResponseDirect = async (blobToSubmit: Blob) => {
        if (!sessionId) return;

        setIsProcessing(true);
        const formData = new FormData();
        formData.append('video', blobToSubmit, 'response.webm');
        formData.append('retaken', hasRetaken ? 'true' : 'false');

        try {
            const response = await apiWrapper.post(`/interview/${sessionId}/response`, formData);


            if (!response.ok) {
                let errorMessage = "Failed to submit response";
                try {
                    const errorData = await response.json();
                    if (errorData?.detail) {
                        errorMessage = errorData.detail;
                    }
                } catch (e) {
                    // Response is not JSON (e.g., Nginx HTML error pages)
                    if (response.status === 413) {
                        errorMessage = "The video file is too large (exceeds 50-60 MB). Please keep your recording under 2 minutes 30 seconds.";
                    } else if (response.status === 502 || response.status === 504) {
                        errorMessage = "The server is temporarily busy or took too long to process the video. Please try again.";
                    }
                }
                throw new Error(errorMessage);
            }

            const result: InterviewResponse = await response.json();

            if (result.interview_ended) {
                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => { });
                }
                navigate(`/interview/results/${sessionId}`);
            } else {
                setQuestionData(result);
                chunksRef.current = [];
                setVideoUrl(null);
                setRecordingTimeLeft(180); // Reset timer to 3 mins
                setHasRetaken(false); // Reset retake flag
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Upload Failed",
                description: error instanceof Error ? error.message : "Error submitting response. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };


    const submitResponse = async () => {
        if (chunksRef.current.length === 0 || !sessionId) return;
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        await submitResponseDirect(blob);
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
                            This interview has been discarded due to malpractice (detected multiple tab switches or exiting full screen).
                        </p>
                        <p className="text-sm text-muted-foreground">
                            No results will be generated for this session. Please maintain focus in your next attempt.
                        </p>
                        <Button 
                            className="w-full bg-red-600 hover:bg-red-700 text-white shadow-glow-sm" 
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
                                    <Mic className="w-5 h-5" /> Video & Timer Rules
                                </h3>
                                <ul className="text-sm text-muted-foreground space-y-3">
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        <span>You have exactly <strong>3 minutes (180s)</strong> total to read and answer each question.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        <span>Maximum single video recording duration is <strong>2 minutes 30 seconds (150s)</strong>.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold">•</span>
                                        <span>You get <strong>one retake</strong> per question, adding <strong>1 minute</strong> to your remaining time (max 3 minutes total).</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary font-bold">•</span>
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
                                        <span className="text-red-500 font-bold">•</span>
                                        <span>The interview must be conducted in <strong>Full Screen</strong> mode.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-red-500 font-bold">•</span>
                                        <span><strong>Do not switch tabs</strong> or minimize the browser window.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-red-500 font-bold">•</span>
                                        <span>Exiting full screen counts as a <strong>Warning</strong> and pauses the session.</span>
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
                            disabled={!hasAgreedToRules || !questionData}
                            onClick={async () => {
                                try {
                                    await document.documentElement.requestFullscreen();
                                    setIsFullscreen(true);
                                    setHasStartedSession(true);
                                } catch (err) {
                                    setHasStartedSession(true);
                                }
                            }}
                        >
                            {!questionData ? (
                                <>
                                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                    Preparing Your Questions...
                                </>
                            ) : (
                                "Start Interview Now"
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

    if (!questionData) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Question Section */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle>Question {questionData.question_number} / {questionData.total_questions}</CardTitle>
                            {recordingTimeLeft < 30 && (
                                <div className="flex items-center gap-2 text-red-500 font-mono font-bold animate-pulse">
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                    {formatTime(recordingTimeLeft)}
                                </div>
                            )}
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
                                        style={{ width: `${(recordingTimeLeft / 180) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-[11px] text-muted-foreground text-center mt-1">
                                    Total question time: 3 mins. Answer will auto-submit when time runs out.
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        {!isRecording && !videoUrl && (
                            <Button onClick={startRecording} className="w-full bg-red-600 hover:bg-red-700">
                                <Mic className="mr-2 h-4 w-4" /> Start Recording
                            </Button>
                        )}

                        {isRecording && (
                            <Button onClick={stopRecording} variant="destructive" className="w-full">
                                <Square className="mr-2 h-4 w-4" /> Stop Recording
                            </Button>
                        )}

                        {videoUrl && (
                            <div className="flex flex-col w-full">
                                <div className="flex gap-2 w-full">
                                    <Button onClick={startRecording} variant="outline" className="flex-1">
                                        Retake
                                    </Button>
                                    <Button onClick={submitResponse} disabled={isProcessing} className="flex-1">
                                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                        Submit
                                    </Button>
                                </div>
                                {isProcessing && (
                                    <p className="text-sm text-muted-foreground text-center mt-2 animate-pulse font-medium">
                                        your answer is being evaluated this may take upto a min or 2 . please wait .
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Video Section */}
                <Card className="overflow-hidden">
                    <CardContent className="p-0 relative aspect-video bg-black">
                        {/* Live Preview */}
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className={`w-full h-full object-cover ${videoUrl ? 'hidden' : 'block'}`}
                        />

                        {/* Playback Preview */}
                        {videoUrl && (
                            <video
                                src={videoUrl}
                                controls
                                className="w-full h-full object-cover"
                            />
                        )}

                        {isRecording && (
                            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-md animate-pulse z-20">
                                <span className="flex h-2 w-2 rounded-full bg-white animate-ping"></span>
                                REC: {formatTime(150 - currentRecordingTime)}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InterviewSession;
