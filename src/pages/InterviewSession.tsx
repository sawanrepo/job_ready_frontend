import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mic, Square, Send } from 'lucide-react';
import { InterviewResponse } from '@/types/interview';

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

    // Initialize Camera
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
        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startRecording = () => {
        if (!streamRef.current) return;

        chunksRef.current = [];
        setVideoUrl(null);

        const mediaRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
        };

        mediaRecorder.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const submitResponse = async () => {
        if (chunksRef.current.length === 0 || !sessionId) return;

        setIsProcessing(true);
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const formData = new FormData();
        formData.append('video', blob, 'response.webm');

        try {
            const response = await fetch(`${INTERVIEW_API_URL}/${sessionId}/response`, {
                method: 'POST',
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
                            <div className="flex gap-2 w-full">
                                <Button onClick={startRecording} variant="outline" className="flex-1">
                                    Retake
                                </Button>
                                <Button onClick={submitResponse} disabled={isProcessing} className="flex-1">
                                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Submit
                                </Button>
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
