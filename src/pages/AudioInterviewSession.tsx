import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const INTERVIEW_API_URL = `${import.meta.env.VITE_API_URL}/interview/audio`;

interface AudioInterviewSessionProps {}

const AudioInterviewSession: React.FC<AudioInterviewSessionProps> = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const initialData = location.state?.initialData;
    const questions: string[] = initialData?.questions || [];
    const totalQuestions = initialData?.totalQuestions || 10;

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (!initialData || !questions.length) {
            toast({
                variant: "destructive",
                title: "Session Error",
                description: "No questions found. Please start a new interview.",
            });
            navigate('/dashboard');
        }

        // Request microphone access up front
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(stream => {
                streamRef.current = stream;
            })
            .catch(err => {
                console.error("Microphone access denied:", err);
                toast({
                    variant: "destructive",
                    title: "Microphone required",
                    description: "Please allow microphone access to record your answers.",
                });
            });

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [initialData, navigate, questions.length]);

    const startRecording = () => {
        if (!streamRef.current) {
            toast({ variant: "destructive", title: "Error", description: "Microphone not initialized." });
            return;
        }

        if (!mediaRecorderRef.current) {
            const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };
        }

        if (mediaRecorderRef.current.state === "inactive") {
            mediaRecorderRef.current.start();
        } else if (mediaRecorderRef.current.state === "paused") {
            mediaRecorderRef.current.resume();
        }
        setIsRecording(true);
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.pause();
            setIsRecording(false);
        }
    };

    const finalizeRecording = () => {
        return new Promise<void>((resolve) => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.onstop = () => {
                    setIsRecording(false);
                    resolve();
                };
                mediaRecorderRef.current.stop();
            } else {
                resolve();
            }
        });
    };

    const handleNextQuestion = async () => {
        if (isRecording) {
            pauseRecording();
        }

        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            await finalizeRecording();
            await submitInterview();
        }
    };

    const submitInterview = async () => {
        setIsProcessing(true);
        try {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            
            const formData = new FormData();
            formData.append('audio', audioBlob, `session_${sessionId}.webm`);

            const token = localStorage.getItem('access_token');
            const response = await fetch(`${INTERVIEW_API_URL}/${sessionId}/result`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to submit audio answers");
            }

            const resultData = await response.json();
            navigate(`/interview/results/${sessionId}`, { state: { resultData } });

        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error submitting answers",
                description: error.message || "Failed to analyze interview.",
            });
            setIsProcessing(false);
        }
    };

    if (!questions.length) return null;

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    return (
        <div className="min-h-screen bg-secondary/30 flex flex-col">
            <header className="bg-white shadow-soft border-b p-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gradient font-poppins">Rapid Fire Audio Interview</h1>
                    <div className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
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
                            Our AI is listening to your complete interview and evaluating your responses. This usually takes a minute or two.
                        </p>
                    </div>
                ) : (
                    <Card className="w-full shadow-strong border-0 gradient-card overflow-hidden">
                        <CardContent className="p-8 md:p-12">
                            <div className="text-center mb-10">
                                <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-foreground font-poppins leading-relaxed">
                                    {currentQuestion}
                                </h2>
                            </div>

                            <div className="flex flex-col items-center justify-center space-y-8">
                                <div className={`relative flex items-center justify-center w-32 h-32 rounded-full border-4 transition-all duration-300 ${isRecording ? 'border-red-500 bg-red-50' : 'border-primary bg-primary/5'}`}>
                                    {isRecording && (
                                        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                                    )}
                                    <Mic className={`w-12 h-12 ${isRecording ? 'text-red-500' : 'text-primary'}`} />
                                </div>
                                
                                <div className="flex gap-4">
                                    {!isRecording ? (
                                        <Button 
                                            size="lg" 
                                            onClick={startRecording}
                                            className="gradient-primary px-8"
                                        >
                                            <Mic className="w-4 h-4 mr-2" />
                                            Start Answering
                                        </Button>
                                    ) : (
                                        <Button 
                                            size="lg" 
                                            variant="destructive"
                                            onClick={pauseRecording}
                                            className="px-8 shadow-glow-sm"
                                        >
                                            <Square className="w-4 h-4 mr-2" />
                                            Pause Recording
                                        </Button>
                                    )}
                                </div>

                                <div className="pt-8 border-t w-full flex justify-center">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={handleNextQuestion}
                                        disabled={isRecording}
                                        className="w-full md:w-auto min-w-[200px]"
                                    >
                                        {isLastQuestion ? (
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
