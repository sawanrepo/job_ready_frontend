export interface ValidationResult {
  isValid: boolean;
  error?: string;
  wordCount: number;
  charCount: number;
  isLimitedInput: boolean;
}

interface ValidationOptions {
  allowShortTarget?: boolean;
}

export const validateJobDescription = (text: string, options: ValidationOptions = {}): ValidationResult => {
  const charCount = text.length;
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const isLimitedInput = wordCount > 0 && wordCount < 30;

  if (charCount === 0) {
    return { isValid: false, error: "Job description or job role is required.", wordCount, charCount, isLimitedInput };
  }

  if (charCount > 8000) {
    return { isValid: false, error: "Description too long. Maximum 8000 characters allowed.", wordCount, charCount, isLimitedInput };
  }

  // 1. Length/word checks for flows that require a full job description.
  if (!options.allowShortTarget) {
    if (charCount < 100) {
      return { isValid: false, error: "Description too short. Please provide a full job description (min 100 chars).", wordCount, charCount, isLimitedInput };
    }

    if (wordCount < 30) {
      return { isValid: false, error: "Description too brief. Minimum 30 words required.", wordCount, charCount, isLimitedInput };
    }
  }

  // 2. Repeated Characters Check
  if (/(.)\1{5,}/.test(text)) {
    return { isValid: false, error: "Input contains too many repeated characters.", wordCount, charCount, isLimitedInput };
  }

  // 3. Natural Language Check
  const alnumCount = (text.match(/[a-z0-9]/gi) || []).length;
  const symbolCount = charCount - alnumCount - (text.match(/\s/g) || []).length;
  
  if (charCount > 0) {
    const symbolRatio = symbolCount / charCount;
    const alnumRatio = alnumCount / charCount;

    if (symbolRatio > 0.2) {
      return { isValid: false, error: "Input contains too many symbols.", wordCount, charCount, isLimitedInput };
    }
    if (alnumRatio < 0.6) {
      return { isValid: false, error: "Input contains too little natural language.", wordCount, charCount, isLimitedInput };
    }
  }

  return { isValid: true, wordCount, charCount, isLimitedInput };
};
