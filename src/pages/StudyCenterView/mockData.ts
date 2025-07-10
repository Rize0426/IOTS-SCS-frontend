import type { LearnAnalysisVO } from './types.ts';
function getRandomDate() {
  const start = new Date(2025, 1, 16);
  const end = new Date(2025, 5, 31);
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime);
}
function getTimeAnalysis() {
  const randomNumbers = Array.from({ length: 7 }, () =>
    Math.floor(Math.random() * 16) // 生成 0-15 之间的整数
  );
  const totalHours = randomNumbers.reduce((sum: any, num: any) => sum + num, 0);
  const studiedHours = Math.floor(Math.random() * totalHours);
  return {
    totalHours: totalHours,
    studiedHours: studiedHours,
    progress: parseFloat((studiedHours / totalHours * 100).toFixed(2)),
    weeklyStudyTime: randomNumbers,
    lastStudyDate: getRandomDate().toISOString()
  }
}
export const mockLearnAnalysisData: LearnAnalysisVO = {
  user: {
    uid: 1001,
    identity: '20210001',
    email: 'zhangsan@csu.edu.cn',
    phone: '13800138000',
    name: '张三',
    avatorUrl: ''
  },
  courseLearnResults: [
    {
      courseId: 1,
      courseName: '数据结构与算法',
      examAnalysisList: [
        {
          id: 'exam_001',
          examName: '期中考试',
          totalScore: 100,
          score: 85.5,
          courseId: 1
        },
        {
          id: 'exam_002',
          examName: '期末考试',
          totalScore: 100,
          score: 92.0,
          courseId: 1
        }
      ],
      assignmentAnalysisList: [
        {
          id: 1,
          courseId: 1,
          title: '链表实现',
          score: 88.5
        },
        {
          id: 2,
          courseId: 1,
          title: '二叉树遍历',
          score: 95.0
        },
        {
          id: 3,
          courseId: 1,
          title: '排序算法对比',
          score: 91.5
        }
      ],
      timeAnalysis: {
        courseId: 1,
        ...getTimeAnalysis()
      }
    },
    {
      courseId: 2,
      courseName: '计算机网络',
      examAnalysisList: [
        {
          id: 'exam_003',
          examName: '期中考试',
          totalScore: 100,
          score: 78.0,
          courseId: 2
        },
        {
          id: 'exam_004',
          examName: '期末考试',
          totalScore: 100,
          score: 84.5,
          courseId: 2
        }
      ],
      assignmentAnalysisList: [
        {
          id: 4,
          courseId: 2,
          title: '网络协议分析',
          score: 82.0
        },
        {
          id: 5,
          courseId: 2,
          title: 'TCP/IP实验',
          score: 87.5
        }
      ],
      timeAnalysis: {
        courseId: 2,
        ...getTimeAnalysis()
      }
    },
    {
      courseId: 3,
      courseName: '数据库原理',
      examAnalysisList: [
        {
          id: 'exam_005',
          examName: '期中考试',
          totalScore: 100,
          score: 89.0,
          courseId: 3
        }
      ],
      assignmentAnalysisList: [
        {
          id: 6,
          courseId: 3,
          title: 'SQL查询优化',
          score: 93.5
        },
        {
          id: 7,
          courseId: 3,
          title: '数据库设计',
          score: 88.0
        }
      ],
      timeAnalysis: {
        courseId: 3,
        ...getTimeAnalysis()
      }
    }
  ],
  knowledgeAnalysisList: [
    {
      id: 1,
      title: '深入理解红黑树',
      likeCount: 245,
      commentCount: 32,
      viewCount: 1580,
      favoriteCount: 156
    },
    {
      id: 2,
      title: 'HTTP协议详解',
      likeCount: 189,
      commentCount: 28,
      viewCount: 1240,
      favoriteCount: 98
    },
    {
      id: 3,
      title: 'MySQL索引优化策略',
      likeCount: 312,
      commentCount: 45,
      viewCount: 2180,
      favoriteCount: 201
    }
  ],
  aiAnalysisList: [
    '学习进度总体良好，数据结构与算法课程表现优异，建议继续保持',
    '计算机网络课程需要加强实践练习，建议增加实验操作时间',
    '数据库原理课程理论掌握较好，可以尝试更多实际项目练习',
    '知识库贡献度很高，深受同学欢迎，建议继续分享学习心得',
    '学习时间分配相对均衡，建议在考试前适当增加复习时间'
  ],
  aiAnalysis: '',
  learningPath: {
    id: 'path_001',
    title: '全栈开发工程师成长路径',
    description: '基于您的学习兴趣和当前能力水平，为您量身定制的全栈开发学习计划。从基础理论到实践项目，循序渐进地提升您的技术能力。',
    totalDuration: 240,
    difficulty: 'intermediate',
    progress: 35.8,
    stages: [
      {
        id: 'stage_001',
        title: '计算机基础强化',
        description: '巩固计算机科学基础知识，为后续学习打下坚实基础',
        duration: 80,
        status: 'completed',
        progress: 100,
        courses: [
          {
            courseId: 1,
            courseName: '数据结构与算法',
            type: 'required',
            estimatedHours: 32,
            completed: true
          },
          {
            courseId: 2,
            courseName: '计算机网络',
            type: 'required',
            estimatedHours: 24,
            completed: true
          },
          {
            courseId: 3,
            courseName: '数据库原理',
            type: 'required',
            estimatedHours: 24,
            completed: true
          }
        ],
        prerequisites: [],
        skills: ['数据结构', '算法设计', '网络协议', 'SQL查询', '数据库设计']
      },
      {
        id: 'stage_002',
        title: '前端开发技能',
        description: '掌握现代前端开发技术栈，能够构建响应式用户界面',
        duration: 60,
        status: 'in_progress',
        progress: 45,
        courses: [
          {
            courseId: 4,
            courseName: 'HTML5与CSS3高级特性',
            type: 'required',
            estimatedHours: 20,
            completed: true
          },
          {
            courseId: 5,
            courseName: 'JavaScript ES6+',
            type: 'required',
            estimatedHours: 24,
            completed: false
          },
          {
            courseId: 6,
            courseName: 'Vue.js框架开发',
            type: 'required',
            estimatedHours: 16,
            completed: false
          }
        ],
        prerequisites: ['stage_001'],
        skills: ['HTML5', 'CSS3', 'JavaScript', 'Vue.js', '响应式设计', 'TypeScript']
      },
      {
        id: 'stage_003',
        title: '后端开发技能',
        description: '学习服务器端开发技术，构建高性能的后端服务',
        duration: 70,
        status: 'not_started',
        progress: 0,
        courses: [
          {
            courseId: 7,
            courseName: 'Node.js服务器开发',
            type: 'required',
            estimatedHours: 28,
            completed: false
          },
          {
            courseId: 8,
            courseName: 'Spring Boot微服务',
            type: 'optional',
            estimatedHours: 32,
            completed: false
          },
          {
            courseId: 9,
            courseName: 'Redis缓存技术',
            type: 'optional',
            estimatedHours: 10,
            completed: false
          }
        ],
        prerequisites: ['stage_001'],
        skills: ['Node.js', 'Express', 'RESTful API', 'Spring Boot', 'Redis', '微服务架构']
      },
      {
        id: 'stage_004',
        title: '项目实战与部署',
        description: '通过实际项目练习，掌握完整的开发流程和部署技能',
        duration: 30,
        status: 'not_started',
        progress: 0,
        courses: [
          {
            courseId: 10,
            courseName: '全栈项目实战',
            type: 'required',
            estimatedHours: 20,
            completed: false
          },
          {
            courseId: 11,
            courseName: 'Docker容器化部署',
            type: 'required',
            estimatedHours: 10,
            completed: false
          }
        ],
        prerequisites: ['stage_002', 'stage_003'],
        skills: ['项目管理', 'Git版本控制', 'Docker', 'CI/CD', '云服务部署']
      }
    ],
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-16T14:30:00Z'
  },
  recommendations: {
    courses: [
      {
        courseId: 101,
        courseName: 'Vue 3 组合式API深度解析',
        instructor: '李明教授',
        rating: 4.8,
        difficulty: 'intermediate',
        duration: 24,
        enrolledCount: 1580,
        tags: ['Vue.js', '前端框架', '组合式API', 'TypeScript'],
        reason: '基于您在Vue.js学习中的优异表现，推荐深入学习Vue 3的高级特性',
        matchScore: 92,
        thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
      },
      {
        courseId: 102,
        courseName: 'Node.js全栈开发实战',
        instructor: '张伟老师',
        rating: 4.6,
        difficulty: 'intermediate',
        duration: 32,
        enrolledCount: 2340,
        tags: ['Node.js', '后端开发', 'Express', 'MongoDB'],
        reason: '您的前端基础扎实，适合学习后端技术来成为全栈开发者',
        matchScore: 88,
        thumbnail: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
      },
      {
        courseId: 103,
        courseName: '算法设计与分析进阶',
        instructor: '王教授',
        rating: 4.9,
        difficulty: 'advanced',
        duration: 40,
        enrolledCount: 890,
        tags: ['算法', '数据结构', '动态规划', '图论'],
        reason: '您在数据结构课程中表现出色，建议进一步提升算法设计能力',
        matchScore: 85,
        thumbnail: 'https://images.pexels.com/photos/11035540/pexels-photo-11035540.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
      }
    ],
    experiments: [
      {
        id: 'exp_001',
        title: '构建响应式电商网站',
        description: '使用Vue.js和Element Plus构建一个完整的电商网站，包含商品展示、购物车、订单管理等功能',
        difficulty: 'intermediate',
        estimatedTime: 16,
        category: '前端开发',
        tools: ['Vue.js', 'Element Plus', 'Axios', 'Vue Router'],
        reason: '结合您的前端学习进度，通过实际项目巩固Vue.js技能',
        matchScore: 90
      },
      {
        id: 'exp_002',
        title: 'RESTful API设计与实现',
        description: '设计并实现一套完整的RESTful API，包含用户认证、数据CRUD操作、文件上传等功能',
        difficulty: 'intermediate',
        estimatedTime: 12,
        category: '后端开发',
        tools: ['Node.js', 'Express', 'JWT', 'MongoDB'],
        reason: '为您的全栈学习路径补充后端API开发经验',
        matchScore: 87
      },
      {
        id: 'exp_003',
        title: '分布式缓存系统设计',
        description: '使用Redis设计并实现一个分布式缓存系统，提升应用性能',
        difficulty: 'advanced',
        estimatedTime: 20,
        category: '系统设计',
        tools: ['Redis', 'Node.js', 'Docker', 'Nginx'],
        reason: '基于您的数据库基础，学习缓存技术提升系统性能',
        matchScore: 82
      }
    ],
    materials: [
      {
        id: 'mat_001',
        title: 'Vue.js设计与实现',
        type: 'book',
        author: '霍春阳',
        url: 'https://example.com/vue-design-book',
        readingTime: 480,
        rating: 4.9,
        tags: ['Vue.js', '源码分析', '框架设计'],
        reason: '深入理解Vue.js框架原理，提升前端架构能力',
        matchScore: 94
      },
      {
        id: 'mat_002',
        title: 'JavaScript高级程序设计',
        type: 'video',
        author: '技术胖',
        url: 'https://example.com/js-advanced-video',
        readingTime: 720,
        rating: 4.7,
        tags: ['JavaScript', '高级特性', 'ES6+'],
        reason: '巩固JavaScript基础，学习高级特性和最佳实践',
        matchScore: 91
      },
      {
        id: 'mat_003',
        title: 'Node.js开发实战指南',
        type: 'tutorial',
        author: '阮一峰',
        url: 'https://example.com/nodejs-tutorial',
        readingTime: 360,
        rating: 4.8,
        tags: ['Node.js', '后端开发', '实战教程'],
        reason: '系统学习Node.js开发，为后端学习做准备',
        matchScore: 89
      },
      {
        id: 'mat_004',
        title: '算法导论中文版',
        type: 'documentation',
        author: 'Thomas H. Cormen',
        url: 'https://example.com/algorithms-doc',
        readingTime: 1200,
        rating: 4.9,
        tags: ['算法', '数据结构', '理论基础'],
        reason: '经典算法教材，提升算法设计和分析能力',
        matchScore: 86
      }
    ],
    lastUpdated: '2024-01-16T15:30:00Z'
  }
};