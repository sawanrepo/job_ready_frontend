import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { toast } from '@/hooks/use-toast';
import { useUsage } from '@/hooks/useUsage';
import Navbar from '@/components/Navbar';
import { validateJobDescription } from '@/utils/validation';



const INTERVIEW_API_URL = `${import.meta.env.VITE_API_URL}/interview/audio`;

const AudioInterviewSetup: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const navigate = useNavigate();
    const { usage, isLoading: usageLoading, triggerPaymentFlow, fetchUsage } = useUsage();
    
    const validation = validateJobDescription(jobDescription);


    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            toast({
                variant: "destructive",
                title: "Resume missing",
                description: "Please upload your resume PDF.",
            });
            return;
        }

        if (!validation.isValid) {
            toast({
                variant: "destructive",
                title: "Invalid Job Description",
                description: validation.error,
            });
            return;
        }


        if (usage && usage.audio_interviews_left === 0) {
            toast({
                variant: "destructive",
                title: "No audio interviews remaining",
                description: "You have used all your audio interviews. Please purchase one.",
            });
            return;
        }


        setIsLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const formData = new FormData();
            formData.append('resume_pdf', selectedFile);
            formData.append('job_description', jobDescription);

            const response = await fetch(`${INTERVIEW_API_URL}/start`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to start interview');
            }

            const result = await response.json();
            fetchUsage(); // Refresh usage after starting
            navigate(`/audio-interview/session/${result.session_id}`, { state: { initialData: result } });
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to start interview. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const canStartInterview = usage && (usage.audio_interviews_left || 0) > 0;

    const hasUsageData = usage && !usageLoading;

    return (
        <div className="min-h-screen bg-secondary/30">

            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-12">

                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4 font-poppins">
                        Rapid Fire Interview
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Upload your resume and job description. You'll answer 10 questions using only your microphone.
                    </p>

                    {/* Usage Information */}
                    {usage && !usageLoading && (
                        <div className="mt-6 p-4 bg-white/50 rounded-lg border border-primary/20 inline-block mx-auto">
                            <div className="flex items-center justify-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                        {usage.audio_interviews_left} audio interviews left
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    <Card className="gradient-card border-0">
                        <CardHeader>
                            <CardTitle className="font-poppins">Step 1: Upload Resume (PDF)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FileUpload
                                onFileSelect={setSelectedFile}
                                selectedFile={selectedFile}
                            />
                        </CardContent>
                    </Card>

                    <Card className="gradient-card border-0">
                        <CardHeader>
                            <CardTitle className="font-poppins">Step 2: Job Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                <Textarea
                                    placeholder="Paste the job description here..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    className={`min-h-[200px] resize-none ${!validation.isValid && jobDescription.length > 0 ? 'border-destructive' : ''}`}
                                />
                                <div className="absolute bottom-3 right-3 text-xs font-medium bg-white/80 px-2 py-1 rounded border">
                                    <span className={!validation.isValid && jobDescription.length > 0 ? 'text-destructive' : 'text-muted-foreground'}>
                                        Words: {validation.wordCount} {validation.isValid ? '' : '/ min 30'}
                                    </span>
                                </div>
                            </div>
                            {!validation.isValid && jobDescription.length > 0 && (
                                <p className="text-xs text-destructive mt-2 ml-1">
                                    {validation.error}
                                </p>
                            )}

                        </CardContent>
                    </Card>
                </div>

                <div className="text-center mb-8 space-y-4">
                    {hasUsageData && canStartInterview ? (
                        <Button
                            onClick={onSubmit}
                            disabled={isLoading || !selectedFile || !validation.isValid}

                            className="gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-3"
                            size="lg"
                        >
                            {isLoading ? 'Generating Questions...' : 'Start Interview'}
                        </Button>
                    ) : (hasUsageData && !canStartInterview) ? (
                        <div className="space-y-3 flex flex-col items-center">
                            <Button
                                disabled
                                className="px-8 py-3 opacity-50"
                                size="lg"
                            >
                                Start Interview (0 left)
                            </Button>
                            <div>
                                <Button
                                    onClick={() => navigate('/shop')}
                                    variant="outline"
                                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                                    size="lg"
                                >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Buy More Interviews in Shop
                                </Button>
                            </div>

                        </div>
                    ) : (
                        <Button
                            onClick={onSubmit}
                            disabled={isLoading || !selectedFile || !jobDescription.trim() || usageLoading}
                            className="gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-3"
                            size="lg"
                        >
                            {usageLoading ? 'Loading...' : isLoading ? 'Generating Questions...' : 'Start Interview'}
                        </Button>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AudioInterviewSetup;
