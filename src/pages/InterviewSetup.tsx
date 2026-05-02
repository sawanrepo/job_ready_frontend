import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { toast } from '@/hooks/use-toast';
import { useUsage } from '@/hooks/useUsage';

const INTERVIEW_API_URL = `${import.meta.env.VITE_API_URL}/interview`;

const InterviewSetup: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const navigate = useNavigate();
    const { usage, isLoading: usageLoading, formatResetTime, triggerPaymentFlow, fetchUsage } = useUsage();

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

        if (!jobDescription.trim()) {
            toast({
                variant: "destructive",
                title: "Job description missing",
                description: "Please provide a job description.",
            });
            return;
        }

        if (usage && usage.mock_interviews_left_this_month === 0) {
            toast({
                variant: "destructive",
                title: "No mocks remaining",
                description: "You have used all your mock interviews. Please purchase an extra mock.",
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
            navigate(`/interview/session/${result.session_id}`, { state: { initialData: result } });
        } catch (error: any) {
            console.error(error);
            const isCompatibilityError = error.message?.includes("not compatible with our ATS checker") || 
                                        error.message?.includes("image-based") ||
                                        error.message?.includes("No extractable text");
            
            const isTooLongError = error.message?.includes("too long") || 
                                  error.message?.includes("1 or 2 page");

            toast({
                variant: "destructive",
                title: isCompatibilityError ? "Compatibility Issue" : isTooLongError ? "PDF Too Long" : "Error",
                description: isCompatibilityError 
                    ? "The uploaded PDF is not compatible with our ATS checker. Either the uploaded PDF is image-based or doesn't have text that is valid for a general ATS check. Please use a text-based (Lex-based) resume for better results."
                    : isTooLongError
                    ? "PDF is too long to be a valid resume. Please upload a resume of 1 or 2 pages."
                    : (error.message || "Failed to start interview. Please try again."),
            });
        } finally {
            setIsLoading(false);
        }
    };

    const canStartInterview = usage && usage.mock_interviews_left_this_month > 0;
    const hasUsageData = usage && !usageLoading;

    return (
        <div className="min-h-screen bg-secondary/30">
            <header className="bg-white shadow-soft border-b">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <h1 className="text-2xl font-bold text-gradient font-poppins">Mock Interview Setup</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4 font-poppins">
                        Practice with AI
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Upload your resume and provide the job description to start your 8-question AI-led mock interview
                    </p>

                    {/* Usage Information */}
                    {usage && !usageLoading && (
                        <div className="mt-6 p-4 bg-white/50 rounded-lg border border-primary/20 inline-block mx-auto">
                            <div className="flex items-center justify-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                        {usage.mock_interviews_left_this_month} mocks left this month
                                    </span>
                                </div>
                                <div className="text-muted-foreground">
                                    Next reset: {formatResetTime(usage.next_reset_times.mock_interview)}
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
                            <Textarea
                                placeholder="Paste the job description here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="min-h-[200px] resize-none"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center mb-8 space-y-4">
                    {hasUsageData && canStartInterview ? (
                        <Button
                            onClick={onSubmit}
                            disabled={isLoading || !selectedFile || !jobDescription.trim()}
                            className="gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-3"
                            size="lg"
                        >
                            {isLoading ? 'Analyzing Profile...' : 'Start Interview'}
                        </Button>
                    ) : (hasUsageData && !canStartInterview) ? (
                        <div className="space-y-3">
                            <Button
                                disabled
                                className="px-8 py-3 opacity-50"
                                size="lg"
                            >
                                Start Interview (0 mocks left)
                            </Button>
                            <div>
                                <Button
                                    onClick={() => triggerPaymentFlow('mock_interview_one_time')}
                                    variant="outline"
                                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                                    size="lg"
                                >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Pay ₹50 to get 1 extra mock interview
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
                            {usageLoading ? 'Loading...' : isLoading ? 'Analyzing Profile...' : 'Start Interview'}
                        </Button>
                    )}
                </div>
            </main>
        </div>
    );
};

export default InterviewSetup;
