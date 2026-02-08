export interface InterviewStartRequest {
    resume_text: string;
    job_description: string;
}

export interface InterviewResponse {
    session_id: string;
    question: string;
    question_number: number;
    total_questions: number;
    interview_ended: boolean;
}

export interface InterviewResult {
    communication_score: number;
    technical_knowledge_score: number;
    problem_solving_score: number;
    confidence_score: number;
    strengths: string[];
    weaknesses: string[];
    improvement_suggestions: string;
    final_verdict: string;
    feedback_summary: string;
}
