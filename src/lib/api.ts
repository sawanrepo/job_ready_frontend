import { apiWrapper } from './apiWrapper';

export interface ATSCheckResponse {
  ats_score: number;
  keyword_match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  job_title_match: string;
  experience_alignment: string;
  education_alignment: string;
  resume_format_compliance: string[];
  action_verbs_count: number;
  red_flags: string[];
  improvement_suggestions: string[];
  feedback?: string;
  suggestions?: string[];
  // Legacy fields for backward compatibility
  score?: number;
}

export interface TailorResumeResponse {
  tailored_resume: string;
  filename: string;
  download_url: string;
}

export const apiClient = {
  async atsCheck(resumeFile: File, jobDescription: string): Promise<ATSCheckResponse> {
    const formData = new FormData();
    formData.append('resume_pdf', resumeFile);
    formData.append('job_description', jobDescription);

    const response = await apiWrapper.post('/resume/ats-check', formData);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'ATS check failed');
    }

    return response.json();
  },

  async tailorResume(resumeFile: File, jobDescription: string): Promise<TailorResumeResponse> {
    const formData = new FormData();
    formData.append('resume_pdf', resumeFile);
    formData.append('job_description', jobDescription);

    const response = await apiWrapper.post('/resume/tailor-resume', formData);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Resume tailoring failed');
    }

    return response.json();
  },

  async downloadResume(filename: string): Promise<Blob> {
    const response = await apiWrapper.get(`/resume/download/${filename}`);

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  },
};