import { ATSCheckResponse } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  User,
  GraduationCap,
  FileText,
  TrendingUp,
  Hash
} from 'lucide-react';
import { LearnCta } from '@/components/LearnCta';
import { LEARN_LINKS } from '@/lib/learnLinks';

import ReactMarkdown from 'react-markdown';

interface ATSResultDisplayProps {
  result: ATSCheckResponse | null;
  isLoading: boolean;
}

const CircularProgress = ({ value, size = 120 }: { value: number; size?: number }) => {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return 'stroke-green-500';
    if (score >= 60) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={`transition-all duration-1000 ${getColor(value)}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground">Score</div>
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1 flex justify-center">
        <Skeleton className="w-32 h-32 rounded-full" />
      </div>
      <div className="md:col-span-2 space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  </div>
);


export const ATSResultDisplay = ({ result, isLoading }: ATSResultDisplayProps) => {
  if (isLoading) {
    return (
      <div className="relative">
        <Card className="glass-morphism border-primary/20 shadow-glow">
          <CardHeader>
            <CardTitle className="font-poppins text-2xl text-gradient">Analyzing Resume...</CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  // Support both new and legacy response formats
  const score = result.ats_score ?? result.score ?? 0;
  const keywordMatch = result.keyword_match_percentage ?? 0;
  const matchedSkills = result.matched_skills ?? [];
  const missingSkills = result.missing_skills ?? [];
  const jobTitleMatch = result.job_title_match ?? '';
  const experienceAlignment = result.experience_alignment ?? '';
  const educationAlignment = result.education_alignment ?? '';
  const formatIssues = result.resume_format_compliance ?? [];
  const redFlags = result.red_flags ?? [];
  const suggestions = result.improvement_suggestions ?? result.suggestions ?? [];
  const actionVerbsCount = result.action_verbs_count ?? 0;
  const resultNote = result.result_note;

  return (
    <div className="relative">
      <Card className="glass-morphism border-primary/20 shadow-glow animate-fade-in">
        <CardHeader>
          <CardTitle className="font-poppins text-3xl text-gradient">Analysis Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {resultNote && (
            <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
              <p className="font-medium leading-relaxed">{resultNote}</p>
            </div>
          )}

          {/* Main Score and Keyword Match */}
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-1 flex justify-center animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <CircularProgress value={score} />
                <div className="absolute -inset-4 bg-primary/10 rounded-full animate-pulse-slow" />
              </div>
            </div>
            <div className="md:col-span-2 space-y-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="glass-morphism p-4 rounded-lg border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Keyword Match</span>
                  <span className="text-sm font-bold text-primary">{keywordMatch}%</span>
                </div>
                <Progress value={keywordMatch} className="h-3 bg-muted/30" />
              </div>
              <div className="flex items-center gap-2 glass-morphism p-3 rounded-lg border border-primary/10">
                <Hash className="h-5 w-5 text-primary animate-pulse-slow" />
                <span className="text-sm font-medium">Action Verbs: <strong className="text-primary">{actionVerbsCount}</strong></span>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="glass-morphism p-6 rounded-xl border border-success/20 shadow-soft">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success animate-pulse-slow" />
                <span className="text-gradient">Matched Skills</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {matchedSkills.length > 0 ? (
                  matchedSkills.map((skill, index) => (
                    <Badge key={index} className="bg-success/10 text-success border-success/30 hover-scale animate-fade-in" style={{ animationDelay: `${0.1 * index}s` }}>
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No matched skills identified</p>
                )}
              </div>
            </div>
            <div className="glass-morphism p-6 rounded-xl border border-destructive/20 shadow-soft">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive animate-pulse-slow" />
                <span className="text-gradient">Missing Skills</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {missingSkills.length > 0 ? (
                  missingSkills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="border-destructive/30 text-destructive hover-scale animate-fade-in" style={{ animationDelay: `${0.1 * index}s` }}>
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No missing skills identified</p>
                )}
              </div>
            </div>
          </div>

          {/* Alignment Cards */}
          <div className="grid md:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <Card className="glass-morphism border-primary/20 shadow-soft hover-scale">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-primary animate-pulse-slow" />
                  <span className="text-gradient">Job Title Match</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-foreground font-medium">
                  <ReactMarkdown>{jobTitleMatch || 'No information available'}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism border-primary/20 shadow-soft hover-scale">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary animate-pulse-slow" />
                  <span className="text-gradient">Experience</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-foreground font-medium">
                  <ReactMarkdown>{experienceAlignment || 'No information available'}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-morphism border-primary/20 shadow-soft hover-scale">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary animate-pulse-slow" />
                  <span className="text-gradient">Education</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-foreground font-medium">
                  <ReactMarkdown>{educationAlignment || 'No information available'}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Issues and Feedback Sections */}
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '1s' }}>
            {/* Format Issues */}
            {formatIssues.length > 0 && (
              <div className="glass-morphism p-6 rounded-xl border border-primary/20 shadow-soft">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary animate-pulse-slow" />
                  <span className="text-gradient">Format Issues</span>
                </h4>
                <div className="space-y-3">
                  {formatIssues.map((issue, index) => (
                    <div key={index} className="flex items-start gap-3 glass-morphism p-4 rounded-lg border border-primary/10 animate-fade-in hover-scale" style={{ animationDelay: `${0.1 * index}s` }}>
                      <AlertTriangle className="h-4 w-4 text-primary mt-1 flex-shrink-0 animate-pulse-slow" />
                      <span className="text-sm text-foreground font-medium">
                        <ReactMarkdown>{issue}</ReactMarkdown>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Red Flags */}
            {redFlags.length > 0 && (
              <div className="glass-morphism p-6 rounded-xl border border-destructive/20 shadow-soft">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive animate-pulse-slow" />
                  <span className="text-gradient">Red Flags</span>
                </h4>
                <div className="space-y-3">
                  {redFlags.map((flag, index) => (
                    <div key={index} className="flex items-start gap-3 glass-morphism p-4 rounded-lg border border-destructive/20 animate-fade-in hover-scale" style={{ animationDelay: `${0.1 * index}s` }}>
                      <XCircle className="h-4 w-4 text-destructive mt-1 flex-shrink-0 animate-pulse-slow" />
                      <span className="text-sm text-destructive font-medium">
                        <ReactMarkdown>{flag}</ReactMarkdown>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Improvement Suggestions */}
          {suggestions.length > 0 && (
            <div className="glass-morphism p-6 rounded-xl border border-warning/20 shadow-soft animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-warning animate-pulse-slow" />
                <span className="text-gradient">Improvement Suggestions</span>
              </h4>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 glass-morphism p-4 rounded-lg border border-warning/20 animate-fade-in hover-scale" style={{ animationDelay: `${0.1 * index}s` }}>
                    <Lightbulb className="h-4 w-4 text-warning mt-1 flex-shrink-0 animate-pulse-slow" />
                    <span className="text-sm text-foreground font-medium">
                      <ReactMarkdown>{suggestion}</ReactMarkdown>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legacy Feedback (fallback) */}
          {result.feedback && (
            <div className="glass-morphism p-6 rounded-xl border border-primary/20 shadow-soft animate-fade-in" style={{ animationDelay: '1.4s' }}>
              <h4 className="text-lg font-semibold mb-4 text-gradient">Detailed Feedback</h4>
              <div className="text-foreground leading-relaxed font-medium">
                <ReactMarkdown>{result.feedback}</ReactMarkdown>
              </div>
            </div>
          )}

          <LearnCta
            className="animate-fade-in"
            description="Learn how ATS scores work and how to improve your resume."
            actionText="Learn More"
            href={LEARN_LINKS.ats}
          />
        </CardContent>
      </Card>
    </div>
  );
};
