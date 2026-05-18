import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, Loader2, Sparkles } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { toast } from '@/hooks/use-toast';
import { useUsage } from '@/hooks/useUsage';
import Navbar from '@/components/Navbar';
import { validateJobDescription } from '@/utils/validation';



const INTERVIEW_API_URL = `${import.meta.env.VITE_API_URL}/interview`;

const InterviewSetup: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const navigate = useNavigate();
    const [activeSessions, setActiveSessions] = useState<any[]>([]);
    
    useEffect(() => {
        fetchActiveSessions();
    }, []);

    const fetchActiveSessions = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/interview/active-sessions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setActiveSessions(data.filter((s: any) => s.type === 'video'));
            }
        } catch (err) {
            console.error("Failed to fetch active sessions", err);
        }
    };

    const { usage, isLoading: usageLoading, formatResetTime, triggerPaymentFlow, fetchUsage } = useUsage();
    
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


        if (usage && usage.mock_interviews_left === 0) {
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

    const canStartInterview = usage && (usage.mock_interviews_left || 0) > 0;

    const hasUsageData = usage && !usageLoading;

    return (
        <div className="min-h-screen bg-secondary/30">

            <Navbar />
            <main className="max-w-4xl mx-auto px-4 py-12">

                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4 font-poppins flex items-center justify-center gap-2">
                        Practice with AI <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs px-2.5 py-1 rounded-full font-sans uppercase tracking-wider font-semibold border border-purple-300 shadow-sm animate-pulse">Beta</span>
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
                                        {usage.mock_interviews_left} mocks left
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
                
                {activeSessions.length > 0 && (
                    <Card className="mb-12 border-primary/30 bg-primary/5 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-xl font-poppins text-primary">Resume Unfinished Interview?</CardTitle>
                                <CardDescription>You have an active session from {new Date(activeSessions[0].created_at).toLocaleString()}</CardDescription>
                            </div>
                            <Button 
                                onClick={() => navigate(`/interview/session/${activeSessions[0].id}`)}
                                className="gradient-primary"
                            >
                                Resume (Question {activeSessions[0].question_number})
                            </Button>
                        </CardHeader>
                    </Card>
                )}


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

                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-5 text-left max-w-2xl mx-auto mb-8 shadow-sm">
                    <div className="flex gap-3">
                        <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-semibold text-amber-800 font-poppins flex items-center gap-1.5">
                                Practice Video Interview — Trial Phase Notice
                            </h4>
                            <p className="text-xs text-amber-700/90 mt-1 leading-relaxed">
                                Please note that our AI-led video mock interviews are currently in a **Trial Phase**. Full identity verification and secure anti-cheating frameworks are scheduled for our upcoming major release.
                            </p>
                            <p className="text-xs text-amber-700/90 mt-2 leading-relaxed">
                                Since this is a simulated practice environment, **we strongly encourage you to conduct the interview honestly and under actual professional constraints**. Cheating or taking external assistance will only lead to inaccurate performance evaluations, misleading analytical reports, and hinder your genuine preparation progress.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-8 space-y-4">
                    {hasUsageData && canStartInterview ? (
                        <Button
                            onClick={onSubmit}
                            disabled={isLoading || !selectedFile || !validation.isValid}

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
                                    onClick={() => navigate('/shop')}
                                    variant="outline"
                                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                                    size="lg"
                                >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Buy More Mock Interviews in Shop
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
