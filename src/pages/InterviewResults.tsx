import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { InterviewResult } from '@/types/interview';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const INTERVIEW_API_URL = `${import.meta.env.VITE_API_URL}/interview`;

const InterviewResults: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [result, setResult] = useState<InterviewResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.resultData) {
            setResult(location.state.resultData);
            setLoading(false);
            return;
        }

        const fetchResult = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(`${INTERVIEW_API_URL}/${sessionId}/result`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch results');
                const data = await response.json();
                setResult(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        if (sessionId) fetchResult();
    }, [sessionId, location.state]);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-10 w-10" /></div>;
    if (error) return <div className="text-red-500 text-center p-10">Error: {error}</div>;
    if (!result) return null;

    return (
        <div className="container mx-auto py-10 max-w-4xl space-y-8">
            <div className="flex justify-start">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </Button>
            </div>
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Interview Evaluation</h1>
                <p className="text-xl text-muted-foreground">
                    Verdict: <Badge variant={result.final_verdict === "Ready" ? "default" : "destructive"}>{result.final_verdict}</Badge>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Scores</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ScoreBar label="Communication" score={result.communication_score} />
                        <ScoreBar label="Technical Knowledge" score={result.technical_knowledge_score} />
                        <ScoreBar label="Problem Solving" score={result.problem_solving_score} />
                        <ScoreBar label="Confidence" score={result.confidence_score} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Feedback Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm leading-relaxed">{result.feedback_summary}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-green-600 flex items-center"><CheckCircle className="mr-2 h-5 w-5" /> Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-2">
                            {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-red-600 flex items-center"><AlertCircle className="mr-2 h-5 w-5" /> Weaknesses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-2">
                            {result.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Improvement Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-line">{result.improvement_suggestions}</p>
                </CardContent>
            </Card>
        </div>
    );
};

const ScoreBar = ({ label, score }: { label: string, score: number }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-sm font-medium">
            <span>{label}</span>
            <span>{score}/10</span>
        </div>
        <Progress value={score * 10} className="h-2" />
    </div>
);

export default InterviewResults;
