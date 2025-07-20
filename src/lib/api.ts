const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ATSCheckResponse {
  score: number;
  feedback: string;
  suggestions: string[];
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

    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/resume/ats-check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

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

    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/resume/tailor-resume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Resume tailoring failed');
    }

    return response.json();
  },

  async downloadResume(filename: string): Promise<Blob> {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/resume/download/${filename}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  },
};