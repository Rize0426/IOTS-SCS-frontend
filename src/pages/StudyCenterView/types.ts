// 用户信息接口
export interface UserVO {
  uid: number;
  identity: string;
  email: string;
  phone: string;
  name: string;
  avatarUrl: string;
}

// 作业分析接口
export interface AssignmentAnalysisVO {
  id: number;
  courseId: number;
  title: string;
  score: number;
}

// 考试分析接口
export interface ExamAnalysisVO {
  id: string;
  examName: string;
  totalScore: number;
  score: number;
  courseId: number;
}

// 知识库分析接口
export interface KnowledgeAnalysis {
  id: number;
  title: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  favoriteCount: number;
}

// 课时学习情况接口 (前端补充)
export interface CourseTimeAnalysis {
  courseId: number;
  totalHours: number;
  studiedHours: number;
  progress: number;
  weeklyStudyTime: number[];
  lastStudyDate: string;
}

// 课程学习结果接口
export interface CourseLearnResult {
  courseId: number;
  courseName: string;
  examAnalysisList: ExamAnalysisVO[];
  assignmentAnalysisList: AssignmentAnalysisVO[];
  timeAnalysis: CourseTimeAnalysis; // 新增课时分析
}

// 学习分析主接口
export interface LearnAnalysisVO {
  user: UserVO;
  courseLearnResults: CourseLearnResult[];
  knowledgeAnalysisList: KnowledgeAnalysis[];
  aiAnalysisList: string[];
  aiAnalysis: string;
  learningPath?: LearningPath;
  recommendations?: RecommendationData;
}

// 学习路径规划接口
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  totalDuration: number; // 总学习时长（小时）
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress: number; // 完成进度百分比
  stages: LearningStage[];
  createdAt: string;
  updatedAt: string;
}

export interface LearningStage {
  id: string;
  title: string;
  description: string;
  duration: number; // 预计学习时长（小时）
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  courses: StageCourse[];
  prerequisites: string[]; // 前置阶段ID
  skills: string[]; // 将要掌握的技能
}

export interface StageCourse {
  courseId: number;
  courseName: string;
  type: 'required' | 'optional';
  estimatedHours: number;
  completed: boolean;
}

// 智能推荐接口
export interface RecommendationData {
  courses: CourseRecommendation[];
  experiments: ExperimentRecommendation[];
  materials: MaterialRecommendation[];
  lastUpdated: string;
}

export interface CourseRecommendation {
  courseId: number;
  courseName: string;
  instructor: string;
  rating: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // 课程时长（小时）
  enrolledCount: number;
  tags: string[];
  reason: string; // 推荐理由
  matchScore: number; // 匹配度分数 0-100
  thumbnail: string;
}

export interface ExperimentRecommendation {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // 预计完成时间（小时）
  category: string;
  tools: string[]; // 需要的工具/技术
  reason: string;
  matchScore: number;
}

export interface MaterialRecommendation {
  id: string;
  title: string;
  type: 'article' | 'video' | 'book' | 'tutorial' | 'documentation';
  author: string;
  url: string;
  readingTime: number; // 阅读/观看时间（分钟）
  rating: number;
  tags: string[];
  reason: string;
  matchScore: number;
}