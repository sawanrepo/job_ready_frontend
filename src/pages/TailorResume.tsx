import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/FileUpload';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, CreditCard, ExternalLink, Eye, Loader2 } from 'lucide-react';
import { apiClient, TailorResumeResponse } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useUsage } from '@/hooks/useUsage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const TailorResume = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TailorResumeResponse | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { usage, isLoading: usageLoading, formatResetTime, triggerPaymentFlow, fetchUsage } = useUsage();

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !jobDescription.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please upload a resume and provide a job description.",
      });
      return;
    }

    if (usage && usage.resume_tailoring_left_this_week === 0) {
      toast({
        variant: "destructive",
        title: "No tailorings remaining",
        description: "You have used all your weekly resume tailorings. Please wait for reset or purchase additional tailorings.",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiClient.tailorResume(selectedFile, jobDescription);
      setResult(response);
      
      // Generate preview URL
      if (response.filename) {
        try {
          const blob = await apiClient.downloadResume(response.filename);
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        } catch (error) {
          console.error("Failed to generate preview URL:", error);
        }
      }

      // Refresh usage data after successful tailoring
      fetchUsage();
      toast({
        title: "Resume tailored successfully!",
        description: "Your tailored resume is ready for preview and download.",
      });
    } catch (error: any) {

      const isCompatibilityError = error.message?.includes("not compatible with our ATS checker") || 
                                  error.message?.includes("image-based") ||
                                  error.message?.includes("No extractable text");
      
      const isTooLongError = error.message?.includes("too long") || 
                            error.message?.includes("1 or 2 page");

      toast({
        variant: "destructive",
        title: isCompatibilityError ? "Compatibility Issue" : isTooLongError ? "PDF Too Long" : "Tailoring failed",
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

  const canRunTailoring = usage && usage.resume_tailoring_left_this_week > 0;
  const hasUsageData = usage && !usageLoading;

  const handleDownload = async () => {
    if (!result) return;
    
    try {
      const blob = await apiClient.downloadResume(result.filename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = result.filename;
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
        description: "Could not download the resume. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-white shadow-soft border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gradient font-poppins">Resume Tailoring</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 font-poppins">
            Tailor Your Resume
          </h2>
          <p className="text-xl text-muted-foreground">
            Create a job-specific resume using AI-powered optimization
          </p>
          
          {/* Usage Information */}
          {usage && !usageLoading && (
            <div className="mt-6 p-4 bg-white/50 rounded-lg border border-primary/20">
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {usage.resume_tailoring_left_this_week} tailorings available
                    {usage.purchased_tailor_credits > 0 && (
                      <span className="text-xs text-primary ml-2">
                        ({usage.resume_tailoring_left_this_week - usage.purchased_tailor_credits} free + {usage.purchased_tailor_credits} purchased)
                      </span>
                    )}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  Next reset: {formatResetTime(usage.next_reset_times.resume_tailoring)}
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
              <CardTitle className="font-poppins">Target Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste the job description you want to tailor your resume for..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[200px] resize-none"
              />
            </CardContent>
          </Card>
        </div>

        <div className="text-center mb-8 space-y-4">
          {hasUsageData && canRunTailoring ? (
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !selectedFile || !jobDescription.trim()}
              className="gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-3"
              size="lg"
            >
              {isLoading ? 'Tailoring Resume...' : 'Tailor Resume'}
            </Button>
          ) : hasUsageData && !canRunTailoring ? (
            <div className="space-y-3">
              <Button
                disabled
                className="px-8 py-3 opacity-50"
                size="lg"
              >
                Tailor Resume (0 tailorings left)
              </Button>
              <div>
                <Button
                  onClick={() => triggerPaymentFlow('one_time')}
                  variant="outline"
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ₹20 to get 1 extra tailoring
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
              {usageLoading ? 'Loading...' : isLoading ? 'Tailoring Resume...' : 'Tailor Resume'}
            </Button>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Tabs defaultValue="preview" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="bg-white/50 border border-primary/10">
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Live Preview
                  </TabsTrigger>
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Overview
                  </TabsTrigger>
                </TabsList>

                <Button
                  onClick={handleDownload}
                  className="gradient-primary hover:shadow-glow transition-all duration-300"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>

              <TabsContent value="preview" className="mt-0">
                <Card className="gradient-card border-0 overflow-hidden">
                  <CardContent className="p-0">
                    {previewUrl ? (
                      <div className="aspect-[1/1.4] w-full bg-white">
                        <iframe
                          src={`${previewUrl}#toolbar=0&navpanes=0`}
                          className="w-full h-full border-0"
                          title="Resume Preview"
                        />
                      </div>
                    ) : (
                      <div className="h-96 flex flex-col items-center justify-center bg-white p-12 text-center">
                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground">Preparing your preview...</p>
                      </div>
                    )}
                  </CardContent>
                  {previewUrl && (
                    <div className="bg-white border-t p-3 flex justify-center">
                      <a 
                        href={previewUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open in New Tab
                      </a>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="overview" className="mt-0">
                <Card className="gradient-card border-0">
                  <CardHeader>
                    <CardTitle className="font-poppins text-2xl flex items-center">
                      <FileText className="h-6 w-6 mr-2 text-primary" />
                      Tailored Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 bg-white/50 rounded-lg">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">{result.filename}</h3>
                          <p className="text-muted-foreground">
                            Your resume has been optimized for this specific job opportunity
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-white p-6 rounded-lg border border-primary/10">
                        <h4 className="font-semibold mb-4">Content Summary</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Name:</span>
                            <span className="ml-2 font-medium">{result.tailored_content?.name}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Role:</span>
                            <span className="ml-2 font-medium">{result.tailored_content?.tagline}</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="text-muted-foreground">Summary:</span>
                          <p className="mt-1 text-sm leading-relaxed">{result.tailored_content?.summary}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

      </main>
    </div>
  );
};

export default TailorResume;