import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';

const INTERVIEW_API_URL = 'http://localhost:8000/interview'; // Should be in env

interface StartFormValues {
    job_description: string;
}

const InterviewSetup: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<StartFormValues>();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const navigate = useNavigate();

    const onSubmit = async (data: StartFormValues) => {
        if (!selectedFile) {
            alert("Please upload your resume PDF.");
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('resume_pdf', selectedFile);
            formData.append('job_description', data.job_description);

            const response = await fetch(`${INTERVIEW_API_URL}/start`, {
                method: 'POST',
                body: formData, // Fetch automatically sets multipart/form-data with boundary
            });

            if (!response.ok) throw new Error('Failed to start interview');

            const result = await response.json();
            navigate(`/interview/session/${result.session_id}`, { state: { initialData: result } });
        } catch (error) {
            console.error(error);
            alert("Failed to start interview. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <Card className="backdrop-blur-sm bg-white/80 shadow-strong border-0">
                <CardHeader>
                    <CardTitle className="text-3xl font-poppins text-gradient">Mock Interview Setup</CardTitle>
                    <CardDescription className="text-lg">
                        Upload your resume and provide the job description to start your AI-led mock interview.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Step 1: Upload Resume (PDF)</Label>
                            <FileUpload
                                onFileSelect={setSelectedFile}
                                selectedFile={selectedFile}
                            />
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="job_description" className="text-base font-semibold">Step 2: Job Description</Label>
                            <Textarea
                                id="job_description"
                                placeholder="Paste the job requirements or full description here..."
                                className="min-h-[150px] bg-secondary/50 border-muted focus:border-primary transition-colors"
                                {...register("job_description", { required: "Job Description is required" })}
                            />
                            {errors.job_description && <span className="text-red-500 text-sm font-medium">{errors.job_description.message}</span>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-poppins gradient-primary hover:shadow-glow transition-all duration-300"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Analyzing Profile...
                                </>
                            ) : (
                                "Start Interview"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default InterviewSetup;
