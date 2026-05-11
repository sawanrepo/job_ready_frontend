import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/FileUpload';
import { ATSResultDisplay } from '@/components/ATSResultDisplay';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { apiClient, ATSCheckResponse } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useUsage } from '@/hooks/useUsage';
import Navbar from '@/components/Navbar';
import { validateJobDescription } from '@/utils/validation';



const ATSCheck = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ATSCheckResponse | null>(null);
  const navigate = useNavigate();
  const { usage, isLoading: usageLoading, formatResetTime, triggerPaymentFlow, fetchUsage } = useUsage();
  
  const validation = validateJobDescription(jobDescription);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "Missing Resume",
        description: "Please upload your resume.",
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


    if (usage && usage.ats_checks_left_today === 0) {
      toast({
        variant: "destructive",
        title: "No checks remaining",
        description: "You have used all your daily ATS checks. Please wait for reset or purchase additional checks.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.atsCheck(selectedFile, jobDescription);
      setResult(response);
      // Refresh usage data after successful check
      fetchUsage();
      toast({
        title: "ATS analysis complete!",
        description: "Your resume has been analyzed successfully.",
      });
    } catch (error: any) {
      const isCompatibilityError = error.message?.includes("not compatible with our ATS checker") || 
                                  error.message?.includes("image-based") ||
                                  error.message?.includes("No extractable text");
      
      const isTooLongError = error.message?.includes("too long") || 
                            error.message?.includes("1 or 2 page");

      toast({
        variant: "destructive",
        title: isCompatibilityError ? "Compatibility Issue" : isTooLongError ? "PDF Too Long" : "Analysis failed",
        description: isCompatibilityError 
          ? "The uploaded PDF is not compatible with our ATS checker. Either the uploaded PDF is image-based or doesn't have text that is valid for a general ATS check. Please use a text-based (Lex-based) resume for better results."
          : isTooLongError
          ? "PDF is too long to be a valid resume. Please upload a resume of 1 or 2 pages."
          : (error instanceof Error ? error.message : "Something went wrong"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canRunAnalysis = usage && usage.ats_checks_left_today > 0;
  const hasUsageData = usage && !usageLoading;


  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12">

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 font-poppins">
            Analyze Your Resume
          </h2>
          <p className="text-xl text-muted-foreground">
            Upload your resume and job description to get detailed ATS compatibility feedback
          </p>

          {/* Usage Information */}
          {usage && !usageLoading && (
            <div className="mt-6 p-4 bg-white/50 rounded-lg border border-primary/20">
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {usage.ats_checks_left_today} checks available
                    {usage.purchased_ats_credits > 0 && (
                      <span className="text-xs text-primary ml-2">
                        ({usage.ats_checks_left_today - usage.purchased_ats_credits} free + {usage.purchased_ats_credits} purchased)
                      </span>
                    )}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  Next reset: {formatResetTime(usage.next_reset_times.ats_check)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Resume Upload */}
          <Card className="gradient-card border-0">
            <CardHeader>
              <CardTitle className="font-poppins">Upload Your Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
              />
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="gradient-card border-0">
            <CardHeader>
              <CardTitle className="font-poppins">Job Description</CardTitle>
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
          {hasUsageData && canRunAnalysis ? (
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !selectedFile || !validation.isValid}

              className="gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-3"
              size="lg"
            >
              {isLoading ? 'Analyzing...' : 'Run ATS Check'}
            </Button>
          ) : hasUsageData && !canRunAnalysis ? (
            <div className="space-y-3">
              <Button
                disabled
                className="px-8 py-3 opacity-50"
                size="lg"
              >
                Run ATS Check (0 checks left)
              </Button>
              <div>
                <Button
                  onClick={() => navigate('/shop')}
                  variant="outline"
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Buy More Checks in Shop
                </Button>

              </div>
            </div>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !selectedFile || !jobDescription.trim() || usageLoading}
              className="gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-3"
              size="lg"
            >
              {usageLoading ? 'Loading...' : isLoading ? 'Analyzing...' : 'Run ATS Check'}
            </Button>
          )}
        </div>

        {/* Results */}
        <ATSResultDisplay result={result} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default ATSCheck;