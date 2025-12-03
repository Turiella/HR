// Type definitions for HR application

export interface Candidate {
  cvId: string;
  userId: string;
  fullName: string;
  email: string;
  score: number;
  experienceYears: number;
  skills: string[];
  education: string[];
  city?: string;
  gender?: string;
  reasons?: {
    requiredMatches: number;
    preferredMatches: number;
    jobDescriptionMatches: number;
    experienceOK: boolean;
    distanceKm?: number;
  };
}

export interface RankingResult {
  count: number;
  candidates: Candidate[];
}

export interface SearchParams {
  requiredSkills: string;
  preferredSkills: string;
  minExperience: number;
  gender: string;
  cities: string;
  maxDistanceKm: string;
  jobDescription: string;
}

export interface SortOption {
  value: 'score' | 'experience' | 'name';
  label: string;
}

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message: string;
}

// Types for Candidate Profile
export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  gender?: string;
  city?: string;
  lat?: number;
  lon?: number;
}

export interface CV {
  id: number;
  filename: string;
  stored_filename: string;
  content_text: string;
  parsed_data: ParsedData;
  skills: string[];
  experience_years: number;
  education: string[];
  classification_score: number;
  category: string;
  version: number;
  is_primary: boolean;
}

export interface ParsedData {
  skills: string[];
  experienceYears: number;
  education: string[];
  classificationScore: number;
  text?: string;
  analysisMethod?: string;
  error?: string;
  errorDetails?: string;
}

export interface CVCategory {
  name: string;
  primaryCv: CV;
  latestCv: CV;
  versions: CV[];
}

export interface RecommendedCV {
  cv: CV;
  reasons?: {
    requiredMatches: number;
    preferredMatches: number;
    jobDescriptionMatches: number;
    experienceOK: boolean;
    distanceKm?: number;
  };
}

export interface CandidateProfileData {
  user: UserProfile;
  categories: CVCategory[];
  recommendedCv?: RecommendedCV;
}

export interface SearchQueryParams {
  required?: string;
  preferred?: string;
  jd?: string;
}
