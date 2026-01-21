/**
 * Shared TypeScript interfaces for the QuestionDetail component and its children
 */

export interface Question {
  id: string;
  text: string;
  views: number;
  examId: string;
  isSaved: boolean;
  groupId: string | null;
  isCanonical: boolean;
  canonical: { id: string; text: string } | null;
  exam: {
    id: string;
    subject: { id: string; name: string; emoji: string | null };
    professor: { id: string; name: string } | null;
    university: { id: string; name: string };
  };
  aiAnswer: {
    id: string;
    content: string;
    model: string | null;
  } | null;
  studentAnswers: StudentAnswer[];
  comments: Comment[];
  personalAnswer: {
    id: string;
    content: string;
    isPublic: boolean;
  } | null;
  _count: {
    studentAnswers: number;
    comments: number;
    savedBy: number;
  };
}

export interface QuestionVariation {
  id: string;
  text: string;
  createdAt: Date;
  exam: {
    professor: { name: string } | null;
    university: { name: string };
  };
  _count: {
    studentAnswers: number;
  };
}

export interface StudentAnswer {
  id: string;
  content: string;
  isPublic: boolean;
  createdAt: Date;
  isLiked: boolean;
  likesCount: number;
  user: {
    id: string;
    name: string | null;
    university: { name: string } | null;
    year: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  isLiked: boolean;
  likesCount: number;
  user: {
    id: string;
    name: string | null;
    university: { name: string } | null;
    year: number;
  };
}

export interface RelatedQuestion {
  id: string;
  text: string;
  views: number;
  isSaved?: boolean;
  exam: {
    professor: { name: string } | null;
  };
  _count: {
    studentAnswers: number;
    savedBy: number;
  };
}

// Component Props Types

export interface QuestionDetailContainerProps {
  questionId: string;
  onNavigate: (id: string) => void;
  onQuestionHover?: (id: string) => void;
}

export interface QuestionDetailProps {
  question: Question;
  relatedQuestions: RelatedQuestion[];
  variations: QuestionVariation[];
  userId?: string;
  onNavigate: (id: string) => void;
  onQuestionHover?: (id: string) => void;
}

export interface QuestionHeaderProps {
  question: Question;
  relatedQuestions: RelatedQuestion[];
  currentIsSaved: boolean;
  onNavigate: (id: string) => void;
  onQuestionHover?: (id: string) => void;
}

export interface QuestionSidebarProps {
  questions: RelatedQuestion[];
  currentQuestionId: string;
  currentQuestionData: {
    text: string;
    views: number;
    professor: string;
    isSaved: boolean;
  };
  hasVariations: boolean;
  variationsCount: number;
  onNavigate: (id: string) => void;
  onQuestionHover?: (id: string) => void;
  onVariationsClick: () => void;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

export interface QuestionTabsProps {
  question: Question;
  userId?: string;
  activeTab: "ai-answer" | "student-answers" | "my-answer" | "comments";
  onTabChange: (tab: "ai-answer" | "student-answers" | "my-answer" | "comments") => void;
}

export interface StudentAnswersTabProps {
  initialAnswers: StudentAnswer[];
  questionId: string;
  userId?: string;
}

export interface MyAnswerTabProps {
  question: Question;
  userId?: string;
  onSwitchToAITab: () => void;
}

export interface CommentsSectionProps {
  questionId: string;
  initialComments: Comment[];
  userId?: string;
  isDesktop?: boolean;
}

export interface QuestionDialogsProps {
  question: Question;
  variations: QuestionVariation[];
  isVariationsOpen: boolean;
  onVariationsClose: () => void;
  isLinkOpen: boolean;
  onLinkClose: () => void;
  isReportOpen: boolean;
  onReportClose: () => void;
  onNavigate: (id: string) => void;
}

// Utility Types

export interface UniversityInfo {
  short: string;
  colorClass: string;
}

export type QuestionFilter = "all" | "saved";
export type QuestionSort = "views" | "recent";
export type CommentSort = "likes" | "recent";
