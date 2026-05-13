import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mic, Square, Send } from 'lucide-react';
import { InterviewResponse } from '@/types/interview';
import { toast } from '@/hooks/use-toast';

const INTERVIEW_API_URL = `${import.meta.env.VITE_API_URL}/interview`;

const InterviewSession: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    // State
    const [questionData, setQuestionData] = useState<InterviewResponse | null>(location.state?.initialData || null);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);

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
            if (questionData) return; // Already have data

            try {
                const token = localStorage.getItem('access_token');
                // We need an endpoint to get current session status
                const response = await fetch(`${INTERVIEW_API_URL}/session/${sessionId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!response.ok) throw new Error("Session not found");
                
                const data = await response.json();
                setQuestionData(data);
            } catch (err) {
                console.error("Failed to fetch session:", err);
                alert("Failed to resume interview session.");
                navigate('/interview/setup');
            }
        };

        startCamera();
        fetchSession();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [sessionId, questionData, navigate]);


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
        // 1. Immediate UI feedback
        setIsRecording(true);
        setVideoUrl(null);
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
            };

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
    };


    const submitResponse = async () => {
        if (chunksRef.current.length === 0 || !sessionId) return;

        setIsProcessing(true);
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const formData = new FormData();
        formData.append('video', blob, 'response.webm');

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${INTERVIEW_API_URL}/${sessionId}/response`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });


            if (!response.ok) throw new Error("Failed to submit response");

            const result: InterviewResponse = await response.json();

            if (result.interview_ended) {
                navigate(`/interview/results/${sessionId}`);
            } else {
                setQuestionData(result);
                chunksRef.current = [];
                setVideoUrl(null);
            }
        } catch (error) {
            console.error(error);
            alert("Error submitting response. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (!questionData) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Question Section */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Question {questionData.question_number} / {questionData.total_questions}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-medium">{questionData.question}</p>
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
                            <div className="absolute top-4 right-4 animate-pulse">
                                <span className="flex h-3 w-3 rounded-full bg-red-600"></span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InterviewSession;
