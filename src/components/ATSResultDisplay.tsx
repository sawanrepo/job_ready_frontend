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
      <Card className="gradient-card border-0">
        <CardHeader>
          <CardTitle className="font-poppins text-2xl">Analyzing Resume...</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton />
        </CardContent>
      </Card>
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

  return (
    <Card className="gradient-card border-0">
      <CardHeader>
        <CardTitle className="font-poppins text-2xl">Analysis Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Main Score and Keyword Match */}
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-1 flex justify-center">
            <CircularProgress value={score} />
          </div>
          <div className="md:col-span-2 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Keyword Match</span>
                <span className="text-sm text-muted-foreground">{keywordMatch}%</span>
              </div>
              <Progress value={keywordMatch} className="h-3" />
            </div>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Action Verbs: <strong>{actionVerbsCount}</strong></span>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Matched Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.length > 0 ? (
                matchedSkills.map((skill, index) => (
                  <Badge key={index} variant="default" className="bg-green-100 text-green-800 border-green-200">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No matched skills identified</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Missing Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {missingSkills.length > 0 ? (
                missingSkills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="border-red-200 text-red-700">
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
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-white/50 border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Job Title Match
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">{jobTitleMatch || 'No information available'}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">{experienceAlignment || 'No information available'}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">{educationAlignment || 'No information available'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Issues and Feedback Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Format Issues */}
          {formatIssues.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Format Issues
              </h4>
              <div className="space-y-2">
                {formatIssues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-2 bg-white/30 p-3 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Red Flags */}
          {redFlags.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Red Flags
              </h4>
              <div className="space-y-2">
                {redFlags.map((flag, index) => (
                  <div key={index} className="flex items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-100">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-700">{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Improvement Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Improvement Suggestions
            </h4>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                  <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-yellow-800">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legacy Feedback (fallback) */}
        {result.feedback && (
          <div>
            <h4 className="text-lg font-semibold mb-3">Detailed Feedback</h4>
            <p className="text-muted-foreground leading-relaxed bg-white/30 p-4 rounded-lg">
              {result.feedback}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};