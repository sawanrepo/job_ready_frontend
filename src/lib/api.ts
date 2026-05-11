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
  tailored_content: any;
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