import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { InterviewResult } from '@/types/interview';
import { Loader2, CheckCircle, AlertCircle, MessageSquareText } from 'lucide-react';
import { apiWrapper } from '@/lib/apiWrapper';
import { LearnCta } from '@/components/LearnCta';
import { LEARN_LINKS } from '@/lib/learnLinks';
import { AdsterraResponsiveBanner } from '@/components/AdsterraAd';

const InterviewResults: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [result, setResult] = useState<InterviewResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        let pollTimer: ReturnType<typeof setTimeout> | null = null;
        let pollAttempts = 0;

        if (location.state?.resultData) {
            setResult(location.state.resultData);
            setLoading(false);
            return;
        }

        const fetchResult = async () => {
            try {
                // Try the unified interview results endpoint first
                let response = await apiWrapper.get(`/interview/${sessionId}/result`);
                
                // If not found, it might be under the audio-specific endpoint.
                // A 400 from the video endpoint usually means the video session is incomplete.
                if (response.status === 404) {
                    response = await apiWrapper.get(`/interview/audio/${sessionId}/result`);
                }

                if (response.status === 202) {
                    pollAttempts += 1;
                    if (pollAttempts > 36) {
                        throw new Error("Interview is still processing. Please try again shortly.");
                    }
                    pollTimer = setTimeout(fetchResult, 5000);
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.detail || 'Failed to fetch results. The session might have expired or doesn\'t exist.');
                }
                
                const data = await response.json();
                setResult(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        if (sessionId) fetchResult();
        return () => {
            if (pollTimer) clearTimeout(pollTimer);
        };
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
                    <ul className="list-disc pl-5 space-y-2">
                        {result.improvement_suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </CardContent>

            </Card>

            {result.question_answer_pairs && result.question_answer_pairs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquareText className="h-5 w-5 text-primary" />
                            Your Answers
                        </CardTitle>
                        <CardDescription>
                            These are the questions and the transcribed answers used for your report.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {result.question_answer_pairs.map((item, index) => (
                            <div key={index} className="rounded-lg border bg-muted/20 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                    Question {index + 1}
                                </p>
                                <p className="mt-2 font-medium leading-relaxed">{item.question}</p>
                                <div className="mt-4 rounded-md bg-background p-4 text-sm leading-relaxed text-muted-foreground">
                                    {item.answer_text || 'No answer transcript available.'}
                                </div>
                            </div>
                        ))}
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                            Note: If a transcribed answer above does not match what you said, use it as a signal to improve clarity, pronunciation, and spoken English. Real hiring platforms can transcribe speech even less accurately, so clear delivery matters.
                        </div>
                    </CardContent>
                </Card>
            )}

            <LearnCta
                description="Preparing for interviews? Read our interview preparation guides."
                actionText="Explore Guides"
                href={LEARN_LINKS.interviews}
            />

            <AdsterraResponsiveBanner className="px-0" />
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
