export interface ValidationResult {
  isValid: boolean;
  error?: string;
  wordCount: number;
  charCount: number;
}

export const validateJobDescription = (text: string): ValidationResult => {
  const charCount = text.length;
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  if (charCount === 0) {
    return { isValid: false, error: "Job description is required.", wordCount, charCount };
  }

  // 1. Length Check
  if (charCount < 100) {
    return { isValid: false, error: "Description too short. Please provide a full job description (min 100 chars).", wordCount, charCount };
  }
  if (charCount > 8000) {
    return { isValid: false, error: "Description too long. Maximum 8000 characters allowed.", wordCount, charCount };
  }

  // 2. Word Count Check
  if (wordCount < 30) {
    return { isValid: false, error: "Description too brief. Minimum 30 words required.", wordCount, charCount };
  }

  // 3. Repeated Characters Check
  if (/(.)\1{5,}/.test(text)) {
    return { isValid: false, error: "Input contains too many repeated characters.", wordCount, charCount };
  }

  // 4. Natural Language Check
  const alnumCount = (text.match(/[a-z0-9]/gi) || []).length;
  const symbolCount = charCount - alnumCount - (text.match(/\s/g) || []).length;
  
  if (charCount > 0) {
    const symbolRatio = symbolCount / charCount;
    const alnumRatio = alnumCount / charCount;

    if (symbolRatio > 0.2) {
      return { isValid: false, error: "Input contains too many symbols.", wordCount, charCount };
    }
    if (alnumRatio < 0.6) {
      return { isValid: false, error: "Input contains too little natural language.", wordCount, charCount };
    }
  }

  return { isValid: true, wordCount, charCount };
};
