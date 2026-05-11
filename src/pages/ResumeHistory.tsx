import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, FileSearch, Download, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ATSResultDisplay } from '@/components/ATSResultDisplay';
import { apiClient } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const RESUME_API_URL = `${import.meta.env.VITE_API_URL}/resume`;

interface ATSResultData {
    ats_score: number;
    keyword_match_percentage: number;
    matched_skills: string[];
    missing_skills: string[];
    job_title_match: string;
    improvement_suggestions: string[];
}

interface TailorResultData {
    filename: string | null;
    created_at: string | null;
}

interface ResumeHistoryResponse {
    ats: {
        result: ATSResultData | null;
        created_at: string | null;
    };
    tailor: {
        filename: string | null;
        created_at: string | null;
    };
}

const ResumeHistory: React.FC = () => {
    const [history, setHistory] = useState<ResumeHistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(`${RESUME_API_URL}/history/latest`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch resume history');
                }
                const data = await response.json();
                setHistory(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const handleDownload = async (filename: string) => {
        try {
            const blob = await apiClient.downloadResume(filename);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            toast({
                title: "Download started",
                description: "Your tailored resume is being downloaded.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Download failed",
                description: "Could not download the resume. It might have been deleted from the server.",
            });
        }
    };

    if (loading) {
        return <div className="flex justify-center p-10 min-h-screen items-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 space-y-4 min-h-screen">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <div className="text-destructive text-center">Error: {error}</div>
                <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
            </div>
        );
    }

    const noHistory = !history?.ats.result && !history?.tailor.filename;

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-secondary/30 py-10">
            <div className="container mx-auto max-w-6xl space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold font-poppins text-gradient">Resume History</h1>
                        <p className="text-xl text-muted-foreground mt-2">
                            Access your latest resume analysis and tailored files
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </Button>
                </div>

                {noHistory ? (
                    <Card className="p-16 text-center border-dashed border-2 bg-transparent shadow-none">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <FileSearch className="h-12 w-12 text-primary opacity-50" />
                            </div>
                            <h2 className="text-2xl font-semibold">No history found</h2>
                            <p className="text-muted-foreground max-w-md">
                                You haven't checked any resume for ATS or tailored one yet.
                            </p>
                            <div className="flex gap-4 mt-6">
                                <Button onClick={() => navigate('/ats-check')}>ATS Check</Button>
                                <Button variant="secondary" onClick={() => navigate('/tailor-resume')}>Tailor Resume</Button>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        {/* ATS History Card */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold flex items-center gap-2">
                                <FileSearch className="text-blue-500" /> Latest ATS Check
                            </h2>
                            {history?.ats.result ? (
                                <Card className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                    <CardHeader className="bg-blue-50/50 border-b">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-lg">ATS Performance Summary</CardTitle>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {formatDate(history.ats.created_at)}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="flex justify-around mb-8">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-blue-600">{history.ats.result.ats_score}%</div>
                                                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">ATS Score</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-purple-600">{history.ats.result.keyword_match_percentage}%</div>
                                                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Keyword Match</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span>Job Title Match: <strong>{history.ats.result.job_title_match}</strong></span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Matched Skills</h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {history.ats.result.matched_skills.slice(0, 5).map((skill, i) => (
                                                            <Badge key={i} variant="secondary" className="text-[10px] bg-green-100 text-green-700 border-0">{skill}</Badge>
                                                        ))}
                                                        {history.ats.result.matched_skills.length > 5 && <span className="text-[10px] text-muted-foreground">+{history.ats.result.matched_skills.length - 5} more</span>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Missing Skills</h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {history.ats.result.missing_skills.slice(0, 5).map((skill, i) => (
                                                            <Badge key={i} variant="secondary" className="text-[10px] bg-red-100 text-red-700 border-0">{skill}</Badge>
                                                        ))}
                                                        {history.ats.result.missing_skills.length > 5 && <span className="text-[10px] text-muted-foreground">+{history.ats.result.missing_skills.length - 5} more</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <Button 
                                                variant="outline" 
                                                className="w-full text-xs" 
                                                onClick={() => navigate('/ats-check')}
                                            >
                                                Run New Check
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="p-8 text-center border-dashed flex flex-col items-center justify-center text-muted-foreground min-h-[300px]">
                                    <FileSearch className="h-8 w-8 mb-4 opacity-50" />
                                    <p>No ATS history found</p>
                                    <Button variant="link" onClick={() => navigate('/ats-check')}>Start one</Button>
                                </Card>
                            )}
                        </div>

                        {/* Tailored Resume History Card */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold flex items-center gap-2">
                                <Download className="text-green-500" /> Latest Tailored Resume
                            </h2>
                            {history?.tailor.filename ? (
                                <Card className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                    <CardHeader className="bg-green-50/50 border-b">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-lg">Downloadable Resume</CardTitle>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {formatDate(history.tailor.created_at)}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="p-6 border rounded-xl bg-gray-50/50 flex flex-col items-center text-center space-y-4">
                                            <div className="p-4 bg-white rounded-full shadow-sm">
                                                <FileSearch className="h-8 w-8 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg truncate max-w-[250px]">{history.tailor.filename}</h3>
                                                <p className="text-sm text-muted-foreground">Successfully tailored for your target job</p>
                                            </div>
                                            <Button 
                                                className="w-full gradient-primary"
                                                onClick={() => history.tailor.filename && handleDownload(history.tailor.filename)}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Download PDF
                                            </Button>
                                        </div>
                                        <div className="mt-6">
                                            <Button 
                                                variant="ghost" 
                                                className="w-full text-xs text-muted-foreground"
                                                onClick={() => navigate('/tailor-resume')}
                                            >
                                                Tailor Another Resume
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="p-8 text-center border-dashed flex flex-col items-center justify-center text-muted-foreground min-h-[300px]">
                                    <Download className="h-8 w-8 mb-4 opacity-50" />
                                    <p>No tailored resume history</p>
                                    <Button variant="link" onClick={() => navigate('/tailor-resume')}>Start one</Button>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeHistory;
