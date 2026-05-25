import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileUpload } from '@/components/FileUpload';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, CreditCard, ExternalLink, Eye, Loader2, Sparkles, Check, Search, Wand2, ArrowRight, Plus, Trash2, User as UserIcon, Briefcase, Projector, AlertTriangle } from 'lucide-react';
import { apiClient, TailorResumeResponse, TailoredContent, ExperienceItem, ProjectItem } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useUsage } from '@/hooks/useUsage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/components/Navbar';
import { validateJobDescription } from '@/utils/validation';
import { LearnCta } from '@/components/LearnCta';
import { LEARN_LINKS } from '@/lib/learnLinks';

const TailorResume = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [result, setResult] = useState<TailorResumeResponse | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [proposedContent, setProposedContent] = useState<TailoredContent | null>(null);
  const [editedContent, setEditedContent] = useState<TailoredContent | null>(null);
  const [skillsSearch, setSkillsSearch] = useState('');
  const [showLimitedInputDialog, setShowLimitedInputDialog] = useState(false);

  const navigate = useNavigate();
  const { usage, isLoading: usageLoading, formatResetTime, triggerPaymentFlow, fetchUsage } = useUsage();
  
  const validation = validateJobDescription(jobDescription, { allowShortTarget: true });

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Prevent accidental page refresh/unload in Step 2
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (step === 2) {
        e.preventDefault();
        e.returnValue = "Your tailoring credit has been deducted. Leaving now will discard your customized draft.";
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [step]);

  const runTailoring = async () => {
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
      const response = await apiClient.proposeTailorResume(selectedFile, jobDescription);
      setProposedContent(response);
      setEditedContent(response);

      // Refresh credit usage immediately so UI reflects the deduction
      fetchUsage();

      setStep(2);
      toast({
        title: "Resume parsed successfully!",
        description: "Review and customize the skills and content of your tailored resume.",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFile && validation.isValid && validation.isLimitedInput) {
      setShowLimitedInputDialog(true);
      return;
    }

    await runTailoring();
  };

  const handleGenerate = async () => {
    if (!editedContent) return;

    setIsCompiling(true);
    try {
      const response = await apiClient.generateTailorResume(editedContent);
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

      fetchUsage();
      setStep(3);
      toast({
        title: "Resume tailored successfully!",
        description: "Your tailored resume is ready for preview and download.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Resume tailoring failed",
        description: error.message || "Something went wrong during PDF generation. Please try again.",
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const toggleSkill = (category: string, skill: string) => {
    if (!editedContent) return;
    setEditedContent(prev => {
      if (!prev) return null;
      const currentList = prev.skills?.[category] || [];
      const updatedList = currentList.includes(skill)
        ? currentList.filter(s => s !== skill)
        : [...currentList, skill];
      return {
        ...prev,
        skills: {
          ...prev.skills,
          [category]: updatedList
        }
      };
    });
  };

  const toggleCategoryAll = (category: string, allSkills: string[]) => {
    if (!editedContent) return;
    setEditedContent(prev => {
      if (!prev) return null;
      const currentList = prev.skills?.[category] || [];
      const isAllSelected = currentList.length === allSkills.length;
      return {
        ...prev,
        skills: {
          ...prev.skills,
          [category]: isAllSelected ? [] : [...allSkills]
        }
      };
    });
  };

  const updateTextField = (field: keyof TailoredContent, value: string) => {
    setEditedContent(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const updateExperienceField = (index: number, field: keyof ExperienceItem, value: any) => {
    setEditedContent(prev => {
      if (!prev || !prev.experience) return null;
      const updatedExp = [...prev.experience];
      updatedExp[index] = { ...updatedExp[index], [field]: value };
      return { ...prev, experience: updatedExp };
    });
  };

  const updateExperienceBullet = (expIndex: number, bulletIndex: number, value: string) => {
    setEditedContent(prev => {
      if (!prev || !prev.experience) return null;
      const updatedExp = [...prev.experience];
      const updatedDetails = [...(updatedExp[expIndex].details || [])];
      updatedDetails[bulletIndex] = value;
      updatedExp[expIndex] = { ...updatedExp[expIndex], details: updatedDetails };
      return { ...prev, experience: updatedExp };
    });
  };

  const addExperienceBullet = (expIndex: number) => {
    setEditedContent(prev => {
      if (!prev || !prev.experience) return null;
      const updatedExp = [...prev.experience];
      const updatedDetails = [...(updatedExp[expIndex].details || []), ""];
      updatedExp[expIndex] = { ...updatedExp[expIndex], details: updatedDetails };
      return { ...prev, experience: updatedExp };
    });
  };

  const removeExperienceBullet = (expIndex: number, bulletIndex: number) => {
    setEditedContent(prev => {
      if (!prev || !prev.experience) return null;
      const updatedExp = [...prev.experience];
      const updatedDetails = (updatedExp[expIndex].details || []).filter((_, i) => i !== bulletIndex);
      updatedExp[expIndex] = { ...updatedExp[expIndex], details: updatedDetails };
      return { ...prev, experience: updatedExp };
    });
  };

  const updateProjectField = (index: number, field: keyof ProjectItem, value: any) => {
    setEditedContent(prev => {
      if (!prev || !prev.projects) return null;
      const updatedProj = [...prev.projects];
      updatedProj[index] = { ...updatedProj[index], [field]: value };
      return { ...prev, projects: updatedProj };
    });
  };

  const updateProjectBullet = (projIndex: number, bulletIndex: number, value: string) => {
    setEditedContent(prev => {
      if (!prev || !prev.projects) return null;
      const updatedProj = [...prev.projects];
      const updatedDetails = [...(updatedProj[projIndex].details || [])];
      updatedDetails[bulletIndex] = value;
      updatedProj[projIndex] = { ...updatedProj[projIndex], details: updatedDetails };
      return { ...prev, projects: updatedProj };
    });
  };

  const addProjectBullet = (projIndex: number) => {
    setEditedContent(prev => {
      if (!prev || !prev.projects) return null;
      const updatedProj = [...prev.projects];
      const updatedDetails = [...(updatedProj[projIndex].details || []), ""];
      updatedProj[projIndex] = { ...updatedProj[projIndex], details: updatedDetails };
      return { ...prev, projects: updatedProj };
    });
  };
  const removeProjectBullet = (projIndex: number, bulletIndex: number) => {
    setEditedContent(prev => {
      if (!prev || !prev.projects) return null;
      const updatedProj = [...prev.projects];
      const updatedDetails = (updatedProj[projIndex].details || []).filter((_, i) => i !== bulletIndex);
      updatedProj[projIndex] = { ...updatedProj[projIndex], details: updatedDetails };
      return { ...prev, projects: updatedProj };
    });
  };

  const addExperienceRecord = () => {
    setEditedContent(prev => {
      if (!prev) return null;
      const newExp: ExperienceItem = {
        company: "New Company",
        role: "Job Title",
        duration: "Start - End Date",
        details: ["Describe a key achievement or responsibility here."]
      };
      return {
        ...prev,
        experience: [...(prev.experience || []), newExp]
      };
    });
  };

  const removeExperienceRecord = (index: number) => {
    setEditedContent(prev => {
      if (!prev || !prev.experience) return null;
      const updated = prev.experience.filter((_, i) => i !== index);
      return {
        ...prev,
        experience: updated
      };
    });
  };

  const addProjectRecord = () => {
    setEditedContent(prev => {
      if (!prev) return null;
      const newProj: ProjectItem = {
        title: "New Project",
        tech_stack: "Technologies Used",
        details: ["Describe the project's purpose and your achievements here."]
      };
      return {
        ...prev,
        projects: [...(prev.projects || []), newProj]
      };
    });
  };

  const removeProjectRecord = (index: number) => {
    setEditedContent(prev => {
      if (!prev || !prev.projects) return null;
      const updated = prev.projects.filter((_, i) => i !== index);
      return {
        ...prev,
        projects: updated
      };
    });
  };

  const handleExitToDashboard = () => {
    if (window.confirm("Are you sure you want to leave? Your tailoring credit has already been deducted. Leaving before generating your PDF will discard your current customizations.")) {
      navigate('/dashboard');
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

  const originalExpCount = proposedContent?.experience?.length || 0;
  const originalProjCount = proposedContent?.projects?.length || 0;

  const maxExperiences = Math.min(10, Math.max(6, originalExpCount + 2));
  const maxProjects = Math.min(10, Math.max(6, originalProjCount + 2));

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12">

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 font-poppins text-primary">
            Tailor Your Resume
          </h2>
          <p className="text-xl text-muted-foreground">
            Create a job-specific resume using AI-powered optimization
          </p>
          
          {/* Usage Information */}
          {usage && !usageLoading && step === 1 && (
            <div className="mt-6 max-w-2xl mx-auto p-4 bg-white/50 rounded-lg border border-primary/20">
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

        {/* Progress Stepper */}
        <div className="max-w-md mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Upload & Info' },
              { num: 2, label: 'Skills Review' },
              { num: 3, label: 'Download PDF' }
            ].map((s, index) => (
              <div key={s.num} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    step === s.num
                      ? 'gradient-primary text-white ring-4 ring-primary/20 shadow-glow'
                      : step > s.num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white border border-slate-200 text-muted-foreground'
                  }`}>
                    {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`text-xs mt-2 font-medium transition-colors whitespace-nowrap ${
                    step === s.num ? 'text-primary font-semibold' : 'text-muted-foreground'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`flex-1 h-0.5 mx-4 transition-colors duration-500 ${
                    step > s.num ? 'bg-emerald-500' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Upload & Job Description */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Resume Upload */}
              <Card className="gradient-card border-0 shadow-sm">
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
              <Card className="gradient-card border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-poppins">Target Job Description or Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Textarea
                      placeholder="Paste the job description. For best results, use the full job description from LinkedIn, Internshala, Naukri, or the platform where you are applying. You can also just enter the job role (e.g. 'Software Engineer') for a general ATS compatibility check, but a full JD will give you more specific feedback."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className={`min-h-[200px] resize-none ${!validation.isValid && jobDescription.length > 0 ? 'border-destructive' : ''}`}
                    />
                    <div className="absolute bottom-3 right-3 text-xs font-medium bg-white/80 px-2 py-1 rounded border">
                      <span className={!validation.isValid && jobDescription.length > 0 ? 'text-destructive' : 'text-muted-foreground'}>
                        Words: {validation.wordCount}
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
              {hasUsageData && canRunTailoring ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !selectedFile || !validation.isValid}
                  className="gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-3"
                  size="lg"
                >
                  {isLoading ? 'Analyzing Resume...' : 'Analyze & Suggest Skills'}
                </Button>
              ) : hasUsageData && !canRunTailoring ? (
                <div className="space-y-3">
                  <Button
                    disabled
                    className="px-8 py-3 opacity-50"
                    size="lg"
                  >
                    Analyze & Suggest Skills (0 tailorings left)
                  </Button>
                  <div>
                    <Button
                      onClick={() => navigate('/shop')}
                      variant="outline"
                      className="border-orange-500 text-orange-600 hover:bg-orange-50"
                      size="lg"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Buy More Tailorings in Shop
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
                  {usageLoading ? 'Loading...' : isLoading ? 'Analyzing Resume...' : 'Analyze & Suggest Skills'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Choose & Edit Content */}
        {step === 2 && proposedContent && editedContent && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl border border-primary/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold font-poppins flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  Customize AI Suggestions
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You can edit the skills, details, achievements, and descriptions generated by the AI before compiling the final PDF.
                </p>
              </div>
            </div>

            {proposedContent.result_note && (
              <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
                <p className="font-medium leading-relaxed">{proposedContent.result_note}</p>
              </div>
            )}

            <Tabs defaultValue="skills" className="w-full">
              <TabsList className="bg-white border border-primary/10 p-1 w-full grid grid-cols-4 md:w-auto md:inline-flex mb-6">
                <TabsTrigger value="skills" className="flex items-center gap-2 text-xs md:text-sm">
                  <Sparkles className="h-4 w-4" />
                  Skills Selection
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2 text-xs md:text-sm">
                  <UserIcon className="h-4 w-4" />
                  Profile Summary
                </TabsTrigger>
                <TabsTrigger value="experience" className="flex items-center gap-2 text-xs md:text-sm">
                  <Briefcase className="h-4 w-4" />
                  Work Experience
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center gap-2 text-xs md:text-sm">
                  <Projector className="h-4 w-4" />
                  Projects & Certs
                </TabsTrigger>
              </TabsList>

              {/* Skills Tab */}
              <TabsContent value="skills" className="space-y-6 mt-0">
                <div className="flex justify-end mb-4">
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder="Search skills..."
                      value={skillsSearch}
                      onChange={(e) => setSkillsSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 w-full text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white/80"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  {Object.entries(proposedContent.skills || {}).map(([category, skills]) => {
                    const matchingSkills = skillsSearch.trim()
                      ? skills.filter(s => s.toLowerCase().includes(skillsSearch.toLowerCase()))
                      : skills;

                    if (matchingSkills.length === 0 && skillsSearch.trim()) return null;

                    const currentSelected = editedContent.skills?.[category] || [];
                    const isAllChecked = matchingSkills.length > 0 && matchingSkills.every(s => currentSelected.includes(s));

                    return (
                      <Card key={category} className="gradient-card border-0 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="bg-white/50 border-b border-primary/5 py-4 px-6 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CardTitle className="font-poppins text-lg font-semibold text-primary">
                              {category}
                            </CardTitle>
                            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary font-semibold rounded-full">
                              {currentSelected.length} / {skills.length} selected
                            </span>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCategoryAll(category, skills)}
                            className="text-xs hover:text-primary transition-colors text-muted-foreground"
                          >
                            {isAllChecked ? "Deselect All" : "Select All"}
                          </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {matchingSkills.map(skill => {
                              const isChecked = currentSelected.includes(skill);
                              return (
                                <div
                                  key={skill}
                                  onClick={() => toggleSkill(category, skill)}
                                  className={`group flex items-center justify-between p-3.5 rounded-lg border-2 cursor-pointer transition-all duration-300 select-none ${
                                    isChecked
                                      ? 'bg-primary/5 border-primary shadow-sm text-primary font-medium'
                                      : 'bg-white border-muted/60 text-muted-foreground hover:border-primary/45 hover:bg-primary/5'
                                  }`}
                                >
                                  <span className="text-sm truncate mr-2">{skill}</span>
                                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                    isChecked
                                      ? 'bg-primary border-primary text-white'
                                      : 'border-muted-foreground/30 group-hover:border-primary/50'
                                  }`}>
                                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Profile Summary Tab */}
              <TabsContent value="profile" className="mt-0">
                <Card className="gradient-card border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-poppins text-lg">Contact & Summary Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <input
                          type="text"
                          value={editedContent.name || ''}
                          onChange={(e) => updateTextField('name', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Professional Tagline / Role</label>
                        <input
                          type="text"
                          value={editedContent.tagline || ''}
                          onChange={(e) => updateTextField('tagline', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Professional Summary</label>
                      <Textarea
                        value={editedContent.summary || ''}
                        onChange={(e) => updateTextField('summary', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg min-h-[150px] focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white resize-none"
                        placeholder="Provide a compelling overview of your skills and accomplishments..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Work Experience Tab */}
              <TabsContent value="experience" className="space-y-6 mt-0">
                <div className="flex items-center justify-between p-4 bg-white/70 backdrop-blur rounded-xl border border-slate-100 shadow-sm">
                  <h4 className="text-sm font-semibold text-slate-700">Add or Remove Full Positions</h4>
                  <Button
                    onClick={addExperienceRecord}
                    disabled={(editedContent.experience || []).length >= maxExperiences}
                    className="gradient-primary hover:shadow-glow flex items-center gap-1.5 text-xs px-3.5 py-1.5"
                    size="sm"
                  >
                    <Plus className="h-3.5 w-3.5" /> 
                    {(editedContent.experience || []).length >= maxExperiences 
                      ? `Max Reached (${maxExperiences})` 
                      : 'Add New Position'
                    }
                  </Button>
                </div>
                {(editedContent.experience || []).map((exp, expIdx) => (
                  <Card key={expIdx} className="gradient-card border-0 shadow-sm overflow-hidden">
                    <CardHeader className="bg-white/40 border-b border-slate-100 py-3 px-6 flex flex-row items-center justify-between">
                      <CardTitle className="font-poppins text-md font-semibold text-primary">
                        Experience {expIdx + 1}: {exp.company || 'Unnamed Company'}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperienceRecord(expIdx)}
                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1 h-8 px-2 rounded-md"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Experience
                      </Button>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Job Title / Role</label>
                          <input
                            type="text"
                            value={exp.role || ''}
                            onChange={(e) => updateExperienceField(expIdx, 'role', e.target.value)}
                            className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Company Name</label>
                          <input
                            type="text"
                            value={exp.company || ''}
                            onChange={(e) => updateExperienceField(expIdx, 'company', e.target.value)}
                            className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Duration</label>
                          <input
                            type="text"
                            value={exp.duration || ''}
                            onChange={(e) => updateExperienceField(expIdx, 'duration', e.target.value)}
                            className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-muted-foreground">Achievements / Bullet Points</label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addExperienceBullet(expIdx)}
                            className="text-xs text-primary hover:text-primary-dark flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> Add Bullet
                          </Button>
                        </div>

                        <div className="space-y-2.5">
                          {(exp.details || []).map((bullet, bulletIdx) => (
                            <div key={bulletIdx} className="flex items-start gap-2">
                              <Textarea
                                value={bullet}
                                onChange={(e) => updateExperienceBullet(expIdx, bulletIdx, e.target.value)}
                                className="w-full min-h-[50px] text-xs px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white resize-none"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeExperienceBullet(expIdx, bulletIdx)}
                                className="border-red-200 text-red-500 hover:bg-red-50 shrink-0 h-9 w-9 mt-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              {/* Projects & Certs Tab */}
              <TabsContent value="projects" className="space-y-6 mt-0">
                <div className="flex items-center justify-between p-4 bg-white/70 backdrop-blur rounded-xl border border-slate-100 shadow-sm">
                  <h4 className="text-sm font-semibold text-slate-700">Add or Remove Projects</h4>
                  <Button
                    onClick={addProjectRecord}
                    disabled={(editedContent.projects || []).length >= maxProjects}
                    className="gradient-primary hover:shadow-glow flex items-center gap-1.5 text-xs px-3.5 py-1.5"
                    size="sm"
                  >
                    <Plus className="h-3.5 w-3.5" /> 
                    {(editedContent.projects || []).length >= maxProjects 
                      ? `Max Reached (${maxProjects})` 
                      : 'Add New Project'
                    }
                  </Button>
                </div>
                {(editedContent.projects || []).map((proj, projIdx) => (
                  <Card key={projIdx} className="gradient-card border-0 shadow-sm overflow-hidden">
                    <CardHeader className="bg-white/40 border-b border-slate-100 py-3 px-6 flex flex-row items-center justify-between">
                      <CardTitle className="font-poppins text-md font-semibold text-primary">
                        Project {projIdx + 1}: {proj.title || 'Unnamed Project'}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProjectRecord(projIdx)}
                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1 h-8 px-2 rounded-md"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Project
                      </Button>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Project Title</label>
                          <input
                            type="text"
                            value={proj.title || ''}
                            onChange={(e) => updateProjectField(projIdx, 'title', e.target.value)}
                            className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">Tech Stack / Tools</label>
                          <input
                            type="text"
                            value={proj.tech_stack || ''}
                            onChange={(e) => updateProjectField(projIdx, 'tech_stack', e.target.value)}
                            className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-muted-foreground">Project Details / Accomplishments</label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addProjectBullet(projIdx)}
                            className="text-xs text-primary hover:text-primary-dark flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" /> Add Bullet
                          </Button>
                        </div>

                        <div className="space-y-2.5">
                          {(proj.details || []).map((bullet, bulletIdx) => (
                            <div key={bulletIdx} className="flex items-start gap-2">
                              <Textarea
                                value={bullet}
                                onChange={(e) => updateProjectBullet(projIdx, bulletIdx, e.target.value)}
                                className="w-full min-h-[50px] text-xs px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white resize-none"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeProjectBullet(projIdx, bulletIdx)}
                                className="border-red-200 text-red-500 hover:bg-red-50 shrink-0 h-9 w-9 mt-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleExitToDashboard}
                className="px-6 border-primary/20 hover:bg-primary/5 text-primary flex items-center gap-2"
                size="lg"
              >
                <ArrowLeft className="w-4 h-4" />
                Exit to Dashboard
              </Button>

              <Button
                onClick={handleGenerate}
                disabled={isCompiling || Object.values(editedContent.skills || {}).flat().length === 0}
                className="gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-3 flex items-center gap-2"
                size="lg"
              >
                {isCompiling ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Resume...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate Tailored Resume
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: PDF Preview & Download */}
        {step === 3 && result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {result.result_note && (
              <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
                <p className="font-medium leading-relaxed">{result.result_note}</p>
              </div>
            )}

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

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="border-primary/20 hover:bg-primary/5 text-primary text-sm"
                    size="sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Edit Skills
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className="gradient-primary hover:shadow-glow transition-all duration-300"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
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

            <LearnCta
              description="Learn how to tailor your resume for each job description before your next application."
              actionText="Explore Guides"
              href={LEARN_LINKS.resumeTailoring}
            />

            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStep(1);
                  setSelectedFile(null);
                  setJobDescription('');
                  setResult(null);
                  setProposedContent(null);
                  setEditedContent(null);
                }}
                className="border-primary/20 hover:bg-primary/5 text-primary"
              >
                Tailor Another Resume
              </Button>
            </div>
          </div>
        )}

      </main>

      <AlertDialog open={showLimitedInputDialog} onOpenChange={setShowLimitedInputDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Use a full JD for better accuracy</AlertDialogTitle>
            <AlertDialogDescription>
              For better resume tailoring accuracy, paste the full job description from LinkedIn, Internshala, Naukri, or the platform where you are applying. Role-only tailoring gives a more general resume update.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>I'll Paste JD</AlertDialogCancel>
            <AlertDialogAction onClick={() => void runTailoring()}>
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TailorResume;
