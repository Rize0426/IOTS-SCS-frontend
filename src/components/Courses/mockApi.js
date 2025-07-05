// mockApi.js

// 模拟API基础URL
const API_BASE_URL = '/api';

// 模拟网络请求延迟(500-1500ms)
const mockNetworkDelay = () => Math.floor(Math.random() * 1000) + 500;

// 通用模拟API调用函数
const mockApiRequest = async (endpoint, method = 'GET', data = null) => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, mockNetworkDelay()));

    // 模拟各种API响应
    try {
        // 根据不同API路径返回对应模拟数据
        if (endpoint.includes('/courses/')) {
            const courseId = endpoint.split('/').pop();
            // 返回课程详情数据
            return {
                data: {
                    course_id: courseId,
                    course_name: 'Web前端开发实战教程',
                    status: 'in_progress',
                    teacher_name: '张教授',
                    start_date: '2023-09-01',
                    end_date: '2023-12-31',
                    total_lessons: 20,
                    credit: 4,
                    description: '本课程涵盖HTML、CSS、JavaScript等前端核心技术，通过实战项目帮助学员掌握Web前端开发技能。'
                }
            };
        }
        else if (endpoint.includes('/chapters/')) {
            // 返回章节数据
            return {
                data: [
                    {
                        chapter_id: 1,
                        chapter_number: 1,
                        chapter_name: 'HTML基础',
                        resources: [
                            {
                                resource_id: 101,
                                name: 'HTML介绍.pdf',
                                type: 'document',
                                url: '#',
                                description: 'HTML基础介绍文档',
                                size: 1024 * 1024 * 2.5,
                                upload_time: '2023-09-01 10:00:00',
                                view_progress: 30
                            },
                            {
                                resource_id: 102,
                                name: 'HTML标签大全.docx',
                                type: 'document',
                                url: '#',
                                description: '常用HTML标签详解',
                                size: 1024 * 1024 * 1.8,
                                upload_time: '2023-09-02 14:30:00',
                                view_progress: 0
                            }
                        ],
                        videos: [
                            {
                                video_id: 201,
                                title: 'HTML基础入门',
                                description: 'HTML基本标签和结构讲解',
                                thumbnail: 'https://via.placeholder.com/300x180?text=HTML基础',
                                duration: 600,
                                url: '#',
                                size: 1024 * 1024 * 45,
                                upload_time: '2023-09-03 09:15:00',
                                view_progress: 75
                            }
                        ]
                    },
                    {
                        chapter_id: 2,
                        chapter_number: 2,
                        chapter_name: 'CSS样式',
                        resources: [
                            {
                                resource_id: 103,
                                name: 'CSS布局技巧.pdf',
                                type: 'document',
                                url: '#',
                                description: 'CSS弹性布局和网格布局详解',
                                size: 1024 * 1024 * 3.2,
                                upload_time: '2023-09-05 11:20:00',
                                view_progress: 0
                            }
                        ],
                        videos: [
                            {
                                video_id: 202,
                                title: 'CSS选择器和盒模型',
                                description: 'CSS选择器优先级和盒模型详解',
                                thumbnail: 'https://via.placeholder.com/300x180?text=CSS样式',
                                duration: 720,
                                url: '#',
                                size: 1024 * 1024 * 55,
                                upload_time: '2023-09-06 10:45:00',
                                view_progress: 40
                            },
                            {
                                video_id: 203,
                                title: 'Flexbox布局教程',
                                description: 'Flexbox布局实战教程',
                                thumbnail: 'https://via.placeholder.com/300x180?text=Flexbox',
                                duration: 540,
                                url: '#',
                                size: 1024 * 1024 * 40,
                                upload_time: '2023-09-07 16:10:00',
                                view_progress: 0
                            }
                        ]
                    }
                ]
            };
        }
        else if (endpoint.includes('/assignments/')) {
            // 返回作业数据
            return {
                data: [
                    {
                        assignment_id: 1001,
                        title: '个人简历网页设计',
                        description: '使用HTML和CSS设计一份个人简历网页，包含基本信息和照片。',
                        deadline: '2023-10-15',
                        status: 'submitted',
                        attachment: [
                            {
                                file_id: 301,
                                name: '评分标准.pdf',
                                url: '#'
                            }
                        ],
                        submission: {
                            status: 'submitted',
                            submit_time: '2023-10-14 23:30:00',
                            file_url: '#',
                            score: 85,
                            comment: '布局合理，色彩搭配不错，但响应式设计有待改进。'
                        }
                    },
                    {
                        assignment_id: 1002,
                        title: '响应式电商页面开发',
                        description: '使用HTML、CSS和JavaScript开发一个响应式电商产品展示页面。',
                        deadline: '2023-11-05',
                        status: 'pending',
                        attachment: [
                            {
                                file_id: 302,
                                name: '需求文档.docx',
                                url: '#'
                            },
                            {
                                file_id: 303,
                                name: '参考案例.zip',
                                url: '#'
                            }
                        ]
                    }
                ]
            };
        }
        else if (endpoint.includes('/exams/')) {
            // 返回考试数据
            return {
                data: [
                    {
                        exam_id: 2001,
                        title: 'Web前端基础测试',
                        description: '测试HTML、CSS和JavaScript的基础知识',
                        start_time: '2023-10-20 10:00:00',
                        end_time: '2023-10-20 12:00:00',
                        duration: 120,
                        status: 'upcoming',
                        total_score: 100,
                        pass_score: 60
                    },
                    {
                        exam_id: 2002,
                        title: '期中测试',
                        description: '综合测试前半学期所学内容',
                        start_time: '2023-11-10 14:00:00',
                        end_time: '2023-11-10 16:00:00',
                        duration: 120,
                        status: 'completed',
                        total_score: 100,
                        pass_score: 60,
                        my_score: 88,
                        rank: 5
                    }
                ]
            };
        }
        else if (endpoint.includes('/discussions/')) {
            // 返回讨论数据
            return {
                data: {
                    list: [
                        {
                            post_id: 3001,
                            author_name: '李同学',
                            author_avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
                            create_time: '2023-09-15 16:30:00',
                            title: '关于Flexbox布局的问题',
                            content: '我在使用Flexbox布局时遇到了一个问题，容器设置了flex-direction: row，但子元素总是垂直排列，怎么解决？',
                            view_count: 25,
                            reply_count: 3,
                            like_count: 10,
                            tags: ['Flexbox', '布局问题'],
                            is_top: false
                        },
                        {
                            post_id: 3002,
                            author_name: '王同学',
                            author_avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
                            create_time: '2023-09-18 10:15:00',
                            title: '分享一个CSS小技巧',
                            content: '今天我发现了一个CSS小技巧，可以用clip-path属性创建有趣的形状效果。这里分享给大家：...',
                            view_count: 42,
                            reply_count: 5,
                            like_count: 18,
                            tags: ['CSS', '技巧'],
                            is_top: true
                        }
                    ]
                }
            };
        }
        else if (endpoint.includes('/recommended-courses/')) {
            // 返回推荐课程数据
            return {
                data: [
                    {
                        course_id: '2001',
                        course_name: 'JavaScript高级编程',
                        image_url: 'https://via.placeholder.com/120x70?text=JS高级',
                        description: '深入讲解JavaScript高级特性，包括闭包、原型链、异步编程等内容。',
                        popularity: 92
                    },
                    {
                        course_id: '2002',
                        course_name: 'Vue.js框架实战',
                        image_url: 'https://via.placeholder.com/120x70?text=Vue实战',
                        description: '基于Vue.js框架的实战项目开发，掌握组件化、状态管理等核心技术。',
                        popularity: 88
                    },
                    {
                        course_id: '2003',
                        course_name: '移动端UI设计',
                        image_url: 'https://via.placeholder.com/120x70?text=移动端UI',
                        description: '学习移动端UI设计原则和实战技巧，掌握响应式布局和用户体验设计。',
                        popularity: 85
                    }
                ]
            };
        }

        // 默认返回空数据
        return { data: [] };
    } catch (error) {
        console.error('模拟API请求出错:', error);
        throw error;
    }
};

// 专门用于获取课程资源的API调用函数
const getCourseResources = async (courseId) => {
    try {
        const response = await mockApiRequest(`${API_BASE_URL}/courses/${courseId}`);
        return response.data;
    } catch (error) {
        console.error('获取课程资源失败:', error);
        return null;
    }
};

// 获取章节数据
const getChapters = async (courseId) => {
    try {
        const response = await mockApiRequest(`${API_BASE_URL}/chapters/${courseId}`);
        return response.data;
    } catch (error) {
        console.error('获取章节数据失败:', error);
        return [];
    }
};

// 获取作业数据
const getAssignments = async (courseId) => {
    try {
        const response = await mockApiRequest(`${API_BASE_URL}/assignments/${courseId}`);
        return response.data;
    } catch (error) {
        console.error('获取作业数据失败:', error);
        return [];
    }
};

// 获取考试数据
const getExams = async (courseId) => {
    try {
        const response = await mockApiRequest(`${API_BASE_URL}/exams/${courseId}`);
        return response.data;
    } catch (error) {
        console.error('获取考试数据失败:', error);
        return [];
    }
};

// 获取讨论数据
const getDiscussions = async (courseId) => {
    try {
        const response = await mockApiRequest(`${API_BASE_URL}/discussions/${courseId}`);
        return response.data.list || [];
    } catch (error) {
        console.error('获取讨论数据失败:', error);
        return [];
    }
};

// 获取推荐课程数据
const getRecommendedCourses = async (courseId) => {
    try {
        const response = await mockApiRequest(`${API_BASE_URL}/recommended-courses/${courseId}`);
        return response.data;
    } catch (error) {
        console.error('获取推荐课程数据失败:', error);
        return [];
    }
};

// 下载文件模拟函数
const downloadFile = async (fileId, fileType = 'document') => {
    try {
        // 模拟不同文件类型的下载
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 根据文件类型模拟不同的下载行为
        if (fileType === 'document') {
            console.log(`模拟下载文档文件ID: ${fileId}`);
            // 在实际应用中，这里会返回文件的blob数据或下载链接
            return { success: true, message: '文档下载成功', fileUrl: '#' };
        } else if (fileType === 'video') {
            console.log(`模拟下载视频文件ID: ${fileId}`);
            return { success: true, message: '视频下载成功', fileUrl: '#' };
        } else if (fileType === 'attachment') {
            console.log(`模拟下载附件文件ID: ${fileId}`);
            return { success: true, message: '附件下载成功', fileUrl: '#' };
        }

        return { success: false, message: '未知文件类型' };
    } catch (error) {
        console.error('文件下载失败:', error);
        return { success: false, message: '文件下载失败' };
    }
};

// 预览视频模拟函数
const previewVideo = async (videoId) => {
    try {
        // 模拟视频预览
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`模拟预览视频ID: ${videoId}`);
        return { success: true, videoUrl: '#' };
    } catch (error) {
        console.error('视频预览失败:', error);
        return { success: false, message: '视频预览失败' };
    }
};

// 提交作业模拟函数
const submitAssignment = async (courseId, assignmentId, assignmentData) => {
    try {
        // 模拟作业提交
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log(`模拟提交作业: 课程ID=${courseId}, 作业ID=${assignmentId}`);
        console.log('作业数据:', assignmentData);

        // 模拟成功提交
        return {
            success: true,
            message: '作业提交成功',
            submissionId: `sub_${Date.now()}`
        };
    } catch (error) {
        console.error('作业提交失败:', error);
        return { success: false, message: '作业提交失败' };
    }
};

// 上传文件模拟函数
const uploadFile = async (file, fileType = 'document', courseId = null, assignmentId = null) => {
    try {
        // 模拟文件上传
        const fileSize = file.size || 1024 * 1024 * 2; // 默认2MB
        const fileName = file.name || `file_${Date.now()}`;

        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log(`模拟上传${fileType}: ${fileName}, 大小: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);

        // 模拟上传成功
        return {
            success: true,
            fileId: `file_${Date.now()}`,
            fileName: fileName,
            fileSize: fileSize,
            uploadTime: new Date().toISOString()
        };
    } catch (error) {
        console.error('文件上传失败:', error);
        return { success: false, message: '文件上传失败' };
    }
};

// 创建讨论模拟函数
const createDiscussion = async (courseId, discussionData) => {
    try {
        // 模拟讨论创建
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`模拟创建讨论: 课程ID=${courseId}`);
        console.log('讨论数据:', discussionData);

        // 模拟成功创建
        return {
            success: true,
            discussionId: `disc_${Date.now()}`,
            message: '讨论发布成功'
        };
    } catch (error) {
        console.error('讨论创建失败:', error);
        return { success: false, message: '讨论发布失败' };
    }
};

// 预约考试模拟函数
const reserveExam = async (courseId, examId) => {
    try {
        // 模拟考试预约
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`模拟预约考试: 课程ID=${courseId}, 考试ID=${examId}`);

        // 模拟成功预约
        return {
            success: true,
            message: '考试预约成功'
        };
    } catch (error) {
        console.error('考试预约失败:', error);
        return { success: false, message: '考试预约失败' };
    }
};

// 开始考试模拟函数
const startExam = async (courseId, examId) => {
    try {
        // 模拟开始考试
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`模拟开始考试: 课程ID=${courseId}, 考试ID=${examId}`);

        // 模拟跳转到考试页面
        window.location.href = `/mock-exam/${courseId}/${examId}`;
        return { success: true, message: '考试开始成功' };
    } catch (error) {
        console.error('开始考试失败:', error);
        return { success: false, message: '开始考试失败' };
    }
};

// 查看考试结果模拟函数
const viewExamResult = async (courseId, examId) => {
    try {
        // 模拟获取考试结果
        await new Promise(resolve => setTimeout(resolve, 800));

        // 模拟成功响应
        return {
            score: 88,
            passed: true,
            rank: 5,
            message: '考试结果获取成功'
        };
    } catch (error) {
        console.error('查看考试结果失败:', error);
        return { success: false, message: '查看考试结果失败' };
    }
};

// 提交讨论回复模拟函数
const submitDiscussionReply = async (postId, content) => {
    try {
        // 模拟提交回复
        await new Promise(resolve => setTimeout(resolve, 800));

        // 模拟成功响应
        return {
            success: true,
            replyId: Date.now(),
            message: '讨论回复已发布'
        };
    } catch (error) {
        console.error('提交回复失败:', error);
        return { success: false, message: '提交回复失败' };
    }
};

// 获取我的课程列表
const getMyCourses = async () => {
    try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        // 返回模拟的课程数据
        return {
            data: [
                // 上次访问课程
                {
                    course_id: 'c001',
                    course_name: '计算机网络基础（必修）',
                    teacher_name: '张教授',
                    credit: 4.0,
                    start_date: '2024-03-01',
                    end_date: '2024-07-15',
                    total_lessons: 48,
                    completed_lessons: 36,
                    progress: 75,
                    last_accessed_lesson: '2024-07-10'
                },
                // 其他课程数据
                {
                    course_id: 'c002',
                    course_name: '数据结构与算法（核心）',
                    teacher_name: '李教授',
                    credit: 3.5,
                    start_date: '2024-03-01',
                    end_date: '2024-07-15',
                    total_lessons: 40,
                    completed_lessons: 20,
                    progress: 50
                },
                // ... 其他课程数据
            ]
        };
    } catch (error) {
        console.error('获取我的课程失败:', error);
        throw error;
    }
};

export {
    mockApiRequest,
    getCourseResources,
    getChapters,
    getAssignments,
    getExams,
    getDiscussions,
    getRecommendedCourses,
    downloadFile,
    previewVideo,
    submitAssignment,
    uploadFile,
    createDiscussion,
    reserveExam,
    startExam,
    viewExamResult,
    submitDiscussionReply
};