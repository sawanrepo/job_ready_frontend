import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Loader2, CheckCircle2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const INTERVIEW_API_URL = `${import.meta.env.VITE_API_URL}/interview/audio`;

interface AudioInterviewSessionProps { }

const AudioInterviewSession: React.FC<AudioInterviewSessionProps> = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const initialData = location.state?.initialData;
    const questions: string[] = initialData?.questions || [];
    const totalQuestions = initialData?.totalQuestions || 10;
    const initialIndex = initialData?.current_question_index || 0;

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialIndex);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
    const [currentBlob, setCurrentBlob] = useState<Blob | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const currentChunksRef = useRef<BlobPart[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const fetchSession = async () => {
            if (initialData && questions.length) {
                // If we have history, ensure we are at the right index
                if (initialIndex !== currentQuestionIndex) {
                    setCurrentQuestionIndex(initialIndex);
                }
                return;
            }

            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(`${INTERVIEW_API_URL}/session/${sessionId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error("Session not found");

                const data = await response.json();
                // We'll just manually navigate to ourselves with the new state to 'refresh' properly
                navigate(`/audio-interview/session/${sessionId}`, { state: { initialData: data }, replace: true });
            } catch (err) {
                console.error("Failed to fetch audio session:", err);
                toast({
                    variant: "destructive",
                    title: "Session Error",
                    description: "Failed to resume interview session."
                });
                navigate('/interview/audio/setup');
            }
        };

        fetchSession();

        // Request microphone access
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
            if (currentAudioUrl) {
                URL.revokeObjectURL(currentAudioUrl);
            }
        };
    }, [initialData, navigate, questions.length, sessionId, initialIndex]);


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
        setIsRecording(true);
        if (currentAudioUrl) {
            URL.revokeObjectURL(currentAudioUrl);
            setCurrentAudioUrl(null);
            setCurrentBlob(null);
        }
        currentChunksRef.current = [];

        try {
            const stream = await ensureStream();
            if (!stream) {
                setIsRecording(false);
                return;
            }

            let mimeType = 'audio/webm';
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                mimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4';
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
    };

    const handleNextQuestion = async () => {
        if (!currentBlob) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('audio', currentBlob, 'answer.webm');
            formData.append('question_index', currentQuestionIndex.toString());

            const token = localStorage.getItem('access_token');
            const response = await fetch(`${INTERVIEW_API_URL}/${sessionId}/answer`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) throw new Error("Failed to upload answer");

            if (currentQuestionIndex < totalQuestions - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setCurrentAudioUrl(null);
                setCurrentBlob(null);
                currentChunksRef.current = [];
            } else {
                await submitInterview();
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: "Failed to save your answer. Please try again."
            });
        } finally {
            setIsUploading(false);
        }
    };

    const submitInterview = async () => {
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${INTERVIEW_API_URL}/${sessionId}/result`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Failed to submit interview");
            }

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
                            Our AI is reviewing your transcripts and generating your performance report. This may take a minute.
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
                                <div className={`relative flex items-center justify-center w-32 h-32 rounded-full border-4 transition-all duration-300 ${isRecording ? 'border-red-500 bg-red-50' : currentAudioUrl ? 'border-green-500 bg-green-50' : 'border-primary bg-primary/5'}`}>
                                    {isRecording && (
                                        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
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
