import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/FileUpload';
import { ATSResultDisplay } from '@/components/ATSResultDisplay';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { apiClient, ATSCheckResponse } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const ATSCheck = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ATSCheckResponse | null>(null);
  const navigate = useNavigate();

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

    setIsLoading(true);
    
    try {
      const response = await apiClient.atsCheck(selectedFile, jobDescription);
      setResult(response);
      toast({
        title: "ATS analysis complete!",
        description: "Your resume has been analyzed successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-bold text-gradient font-poppins">ATS Resume Check</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 font-poppins">
            Analyze Your Resume
          </h2>
          <p className="text-xl text-muted-foreground">
            Upload your resume and job description to get detailed ATS compatibility feedback
          </p>
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
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[200px] resize-none"
              />
            </CardContent>
          </Card>
        </div>

        <div className="text-center mb-8">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !selectedFile || !jobDescription.trim()}
            className="gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-3"
            size="lg"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Resume'}
          </Button>
        </div>

        {/* Results */}
        <ATSResultDisplay result={result} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default ATSCheck;