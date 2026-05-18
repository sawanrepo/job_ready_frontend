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

export interface PersonalInfo {
  location?: string;
  phone?: string;
  email?: string;
  github?: string;
  github_url?: string;
  linkedin?: string;
  linkedin_url?: string;
  portfolio?: string;
  portfolio_url?: string;
}

export interface ExperienceItem {
  role?: string;
  company?: string;
  duration?: string;
  details?: string[];
}

export interface ProjectItem {
  title?: string;
  tech_stack?: string;
  details?: string[];
}

export interface EducationItem {
  degree?: string;
  institution?: string;
  grade?: string;
  start_date?: string;
  end_date?: string;
}

export interface CertificationItem {
  title?: string;
  link?: string;
  date?: string;
}

export interface TailoredContent {
  name?: string;
  tagline?: string;
  personal_info?: PersonalInfo;
  summary?: string;
  skills?: Record<string, string[]>;
  experience?: ExperienceItem[];
  projects?: ProjectItem[];
  education?: EducationItem[];
  certifications?: CertificationItem[];
  is_resume?: boolean;
  error_message?: string | null;
}

export interface TailorResumeResponse {
  tailored_content: TailoredContent;
  filename: string;
  pdf_url: string;
}


export interface UsageResponse {
  ats_checks_left_today: number;
  resume_tailoring_left_this_week: number;
  purchased_ats_credits: number;
  purchased_tailor_credits: number;
  mock_interviews_left: number;
  audio_interviews_left: number;
  next_reset_times: {
    ats_check: string;
    resume_tailoring: string;
  };
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

  async proposeTailorResume(resumeFile: File, jobDescription: string): Promise<TailoredContent> {
    const formData = new FormData();
    formData.append('resume_pdf', resumeFile);
    formData.append('job_description', jobDescription);

    const response = await apiWrapper.post('/resume/tailor-resume/propose', formData);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Resume tailoring analysis failed');
    }

    return response.json();
  },

  async generateTailorResume(tailoredContent: TailoredContent): Promise<TailorResumeResponse> {
    const response = await apiWrapper.post('/resume/tailor-resume/generate', tailoredContent);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Resume tailoring generation failed');
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

  async getUsage(): Promise<UsageResponse> {
    const response = await apiWrapper.get('/resume/usage');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch usage data');
    }

    return response.json();
  },

  async createOrder(plan: string): Promise<any> {
    const response = await apiWrapper.post(`/payment/create-order/${plan}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create order');
    }

    return response.json();
  },

  async verifyPayment(paymentData: any): Promise<any> {
    const response = await apiWrapper.post('/payment/payment/verify', paymentData);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Payment verification failed');
    }

    return response.json();
  }
};