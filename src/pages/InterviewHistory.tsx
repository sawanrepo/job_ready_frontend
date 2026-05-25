import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, Video, Mic, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { apiWrapper } from '@/lib/apiWrapper';
import { AdsterraResponsiveBanner } from '@/components/AdsterraAd';

interface InterviewResultData {
    final_verdict: string;
    communication_score: number;
    technical_knowledge_score: number;
    problem_solving_score: number;
    confidence_score: number;
    feedback_summary: string;
    strengths: string[];
    weaknesses: string[];
    improvement_suggestions: string;
    question_answer_pairs?: {
        question: string;
        answer_text: string;
        status?: string;
    }[];
}

interface HistoryResponse {
    video: InterviewResultData | null;
    audio: InterviewResultData | null;
    video_meta?: {
        session_id?: string | null;
        created_at: string | null;
        display_label?: string;
    };
    audio_meta?: {
        session_id?: string | null;
        created_at: string | null;
        display_label?: string;
    };
}

const formatDateTime = (value?: string | null) => {
    if (!value) return 'Date unavailable';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';

    return date.toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const InterviewHistory: React.FC = () => {
    const [history, setHistory] = useState<HistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await apiWrapper.get('/interview/history/latest');
                if (!response.ok) {
                    throw new Error('Failed to fetch interview history');
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

    const noHistory = !history?.audio && !history?.video;

    return (
        <div className="min-h-screen bg-secondary/30">
            <Navbar />
            <div className="container mx-auto max-w-6xl space-y-8 py-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold font-poppins text-gradient">Interview History</h1>
                        <p className="text-xl text-muted-foreground mt-2">
                            Review your latest performance
                        </p>
                    </div>
                </div>


                {noHistory ? (
                    <Card className="p-16 text-center border-dashed border-2 bg-transparent shadow-none">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <Video className="h-12 w-12 text-primary opacity-50" />
                            </div>
                            <h2 className="text-2xl font-semibold">No interviews found</h2>
                            <p className="text-muted-foreground max-w-md">
                                You haven't given any audio or video interviews yet. Start an interview from the dashboard to see your performance analysis here.
                            </p>
                            <div className="flex gap-4 mt-6">
                                <Button onClick={() => navigate('/interview')}>Start Video Interview</Button>
                                <Button variant="secondary" onClick={() => navigate('/audio-interview')}>Start Audio Interview</Button>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Audio Interview Result */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold flex items-center gap-2">
                                <Mic className="text-orange-500" /> Latest Audio Interview
                            </h2>
                            {history.audio ? (
                                <ResultCard
                                    result={history.audio}
                                    type="Audio"
                                    createdAt={history.audio_meta?.created_at}
                                    sessionId={history.audio_meta?.session_id}
                                    onViewReport={(sessionId) => navigate(`/interview/results/${sessionId}`)}
                                />
                            ) : (
                                <Card className="p-8 text-center border-dashed flex flex-col items-center h-full justify-center text-muted-foreground">
                                    <Mic className="h-8 w-8 mb-4 opacity-50" />
                                    <p>No audio interview history</p>
                                    <Button variant="link" onClick={() => navigate('/audio-interview')}>Start one</Button>
                                </Card>
                            )}
                        </div>

                        {/* Video Interview Result */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold flex items-center gap-2">
                                <Video className="text-red-500" /> Latest Video Interview
                            </h2>
                            {history.video ? (
                                <ResultCard
                                    result={history.video}
                                    type="Video"
                                    createdAt={history.video_meta?.created_at}
                                    sessionId={history.video_meta?.session_id}
                                    onViewReport={(sessionId) => navigate(`/interview/results/${sessionId}`)}
                                />
                            ) : (
                                <Card className="p-8 text-center border-dashed flex flex-col items-center h-full justify-center text-muted-foreground">
                                    <Video className="h-8 w-8 mb-4 opacity-50" />
                                    <p>No video interview history</p>
                                    <Button variant="link" onClick={() => navigate('/interview')}>Start one</Button>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <AdsterraResponsiveBanner className="max-w-6xl" />
        </div>
    );
};

const ResultCard = ({
    result,
    type,
    createdAt,
    sessionId,
    onViewReport,
}: {
    result: InterviewResultData;
    type: string;
    createdAt?: string | null;
    sessionId?: string | null;
    onViewReport: (sessionId: string) => void;
}) => {
    const isReady = result.final_verdict === "Ready";
    return (
        <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">Verdict</CardTitle>
                        <CardDescription className="mt-1">Based on your {type.toLowerCase()} responses</CardDescription>
                        <div className="mt-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Latest interview: {formatDateTime(createdAt)}</span>
                        </div>
                    </div>
                    <Badge variant={isReady ? "default" : "destructive"} className="text-sm px-3 py-1">
                        {result.final_verdict}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <ScoreBar label="Communication" score={result.communication_score} />
                    <ScoreBar label="Technical" score={result.technical_knowledge_score} />
                    <ScoreBar label="Problem Solving" score={result.problem_solving_score} />
                    <ScoreBar label="Confidence" score={result.confidence_score} />
                </div>
                
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Feedback Summary</h4>
                    <p className="text-sm leading-relaxed">{result.feedback_summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-green-600 flex items-center"><CheckCircle className="h-4 w-4 mr-1" /> Strengths</h4>
                        <ul className="text-xs list-disc pl-4 space-y-1 text-muted-foreground">
                            {result.strengths.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" /> Weaknesses</h4>
                        <ul className="text-xs list-disc pl-4 space-y-1 text-muted-foreground">
                            {result.weaknesses.slice(0, 3).map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                    </div>
                </div>

                {sessionId && (
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => onViewReport(sessionId)}
                    >
                        View Full Report
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

const ScoreBar = ({ label, score }: { label: string, score: number }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-xs font-medium">
            <span>{label}</span>
            <span>{score}/10</span>
        </div>
        <Progress value={score * 10} className="h-1.5" />
    </div>
);

export default InterviewHistory;
