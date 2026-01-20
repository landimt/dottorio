/**
 * Shared API response types for the Dottorio application
 * These types represent the data returned by API endpoints
 */

// ============================================================================
// Base Types
// ============================================================================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// ============================================================================
// User Types
// ============================================================================

export interface UserSummary {
  id: string;
  name: string | null;
  email: string;
}

export interface User extends UserSummary {
  avatarUrl: string | null;
  role: string;
  status: string;
  year: number | null;
  isRepresentative: boolean;
  universityId: string | null;
  channelId: string | null;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export interface UserWithRelations extends User {
  university: University | null;
  channel: Channel | null;
  _count: {
    exams: number;
    studentAnswers: number;
    comments: number;
  };
}

// ============================================================================
// University Types
// ============================================================================

export interface University {
  id: string;
  name: string;
  shortName: string | null;
  city: string | null;
  emoji: string | null;
}

export interface UniversityWithCounts extends University {
  _count: {
    professors: number;
    users: number;
    channels: number;
  };
}

export interface Channel {
  id: string;
  name: string;
  universityId: string;
}

// ============================================================================
// Subject Types
// ============================================================================

export interface Subject {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
}

export interface SubjectWithCounts extends Subject {
  _count: {
    professors: number;
    exams: number;
  };
}

// ============================================================================
// Professor Types
// ============================================================================

export interface Professor {
  id: string;
  name: string;
  universityId: string | null;
}

export interface ProfessorWithRelations extends Professor {
  university: University | null;
  subjects: Array<{
    subject: Subject;
  }>;
  _count: {
    exams: number;
  };
}

// ============================================================================
// Exam Types
// ============================================================================

export interface Exam {
  id: string;
  subjectId: string;
  professorId: string | null;
  universityId: string;
  channelId: string | null;
  year: number | null;
  examDate: Date | null;
  examType: string;
  academicYear: string | null;
  description: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExamWithRelations extends Exam {
  subject: Subject;
  professor: Professor | null;
  university: University;
  creator: UserSummary;
  _count?: {
    questions: number;
  };
}

// ============================================================================
// Question Types
// ============================================================================

export interface Question {
  id: string;
  text: string;
  examId: string;
  groupId: string | null;
  canonicalId: string | null;
  isCanonical: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionListItem extends Question {
  exam: ExamWithRelations;
  isSaved: boolean;
  _count: {
    studentAnswers: number;
    comments: number;
    savedBy: number;
  };
}

export interface QuestionDetail extends Question {
  exam: ExamWithRelations;
  isSaved: boolean;
  aiAnswer: AiAnswer | null;
  studentAnswers: StudentAnswerWithUser[];
  comments: CommentWithUser[];
  _count: {
    studentAnswers: number;
    comments: number;
    savedBy: number;
  };
}

export interface SimilarQuestion {
  id: string;
  text: string;
  groupId: string | null;
  views: number;
  timesAsked: number;
  hasAiAnswer: boolean;
  studentAnswersCount: number;
  exam: {
    subject: string;
    professor: string;
    university: string;
  };
}

// ============================================================================
// Answer Types
// ============================================================================

export interface AiAnswer {
  id: string;
  content: string;
  questionId: string;
  model: string | null;
  rating: number | null;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentAnswer {
  id: string;
  content: string;
  questionId: string;
  userId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentAnswerWithUser extends StudentAnswer {
  user: UserSummary;
  isLiked: boolean;
  _count: {
    likes: number;
  };
}

// ============================================================================
// Comment Types
// ============================================================================

export interface Comment {
  id: string;
  content: string;
  questionId: string;
  userId: string;
  createdAt: Date;
}

export interface CommentWithUser extends Comment {
  user: UserSummary;
  isLiked: boolean;
  _count: {
    likes: number;
  };
}

// ============================================================================
// API Response Types
// ============================================================================

// Questions
export interface QuestionsSearchResponse {
  questions: QuestionListItem[];
  pagination: Pagination;
}

export interface QuestionDetailResponse extends QuestionDetail {}

export interface SimilarQuestionsResponse {
  questions: SimilarQuestion[];
}

// Users (Admin)
export interface UsersListResponse {
  users: UserWithRelations[];
}

// Universities (Admin)
export interface UniversitiesListResponse {
  universities: UniversityWithCounts[];
}

// Subjects (Admin)
export interface SubjectsListResponse {
  subjects: SubjectWithCounts[];
}

// Professors (Admin)
export interface ProfessorsListResponse {
  professors: ProfessorWithRelations[];
}

// Generic action responses
export interface DeleteResponse {
  deleted: boolean;
}

export interface SaveToggleResponse {
  saved: boolean;
}

export interface LikeToggleResponse {
  liked: boolean;
}
