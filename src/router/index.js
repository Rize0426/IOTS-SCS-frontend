// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/auth.js';
// 引入Pinia用户状态

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/S-home',
            name: 'S-home',
            component: () => import('../views/HomeView.vue'),
            meta: { title: '学生首页', requiresAuth: true } // 需要登录
        },
        {
            path: '/T-home',
            name: 'T-home',
            component: () => import('../views/T-HomeView.vue'),
            meta: { title: '教师首页', requiresAuth: true } // 需要登录
        },
        {
            path: '/',
            name: 'login',
            component: () => import('@/components/login/LoginView.vue')
        },
        {
            path: '/userMessage',
            name: 'userMessage',
            component: () => import('../components/user/UserMessage.vue'),
            meta: { title: '个人信息', requiresAuth: true } // 需要登录
        },
        {
            path: '/courseCenter',
            name: 'courseCenter',
            component: () => import('../components/Courses/CourseCenter.vue'),
            meta: { title: '课程中心', requiresAuth: true } // 需要登录
        },
        {
            path: '/course/:id',
            name: 'courseDetail',
            component: () => import('@/components/Courses/CourseDetail.vue'),
            meta: { title: '课程详情', requiresAuth: true } // 如果需要登录才能访问
        },
        {
            path: '/note',
            name: 'note',
            component: () => import('@/components/note/NoteView.vue'),
            meta: { title: '笔记', requiresAuth: true } // 如果需要登录才能访问
        },
        {
            path: '/evaluation',
            name: 'evaluation',
            component: () => import('@/components/user/UserEvaluation.vue'),
            meta: { title: '成绩分析', requiresAuth: true } // 如果需要登录才能访问
        },
        {
            path: '/teacher/teacher-resources',
            name: 'TeacherResourceManager',
            component: () => import('@/components/teacher/TeacherResourceManager.vue'),
            meta: { title: '资源管理', requiresAuth: true, role: 'teacher' }
        },
        {
            path: '/teacher/student-grades',
            name: 'StudentGrades',
            component: () => import('@/components/teacher/StudentGrades.vue'),
            meta: { title: '学生成绩', requiresAuth: true }
        },
        {
            path: '/teacher/teacher-discussion',
            name: 'TeacherDiscussion',
            component: () => import('@/components/teacher/TeacherDiscussion.vue'),
            meta: { title: '老师讨论区', requiresAuth: true }
        },
        {
            path: '/teacher/exam-manage',
            name: 'ExamManage',
            component: () => import('@/components/teacher/ExamManage.vue'),
            meta: { title: '考试管理', requiresAuth: true }
        },
        {
            path: '/messages',
            name: 'Messages',
            component: () => import('@/components/message/MessageView.vue'),
            meta: { title: '消息管理', requiresAuth: true }
        },
        {
            path: '/forum',
            name: 'Forum',
            component: () => import('@/components/message/DiscussionForum.vue'),
            meta: { title: '学习讨论区', requiresAuth: true }
        },
        {
            path: '/post/:id',
            name: 'PostDetail',
            component: () => import('@/components/message/PostDetail.vue'),
            meta: { title: '学习讨论区详情', requiresAuth: true }
        },
        {
            path: '/pingjia',
            name: 'PinJia',
            component: () => import('@/components/evaluation/Evaluation.vue'),
            meta: { title: '评价中心', requiresAuth: true }
        }
    ]
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
    const userStore = useUserStore(); // 获取Pinia用户状态

    // 场景1：访问登录页 → 直接放行
    if (to.path === '/') {
        next();
        return;
    }

    // 场景2：访问需要登录的页面（如主页）
    if (to.meta.requiresAuth) {
        if (!userStore.isLoggedIn) { // 从Pinia判断状态
            ElMessage.error('请先登录');
            next({
                path: '/',
                query: { redirect: to.fullPath } // 记录原目标路径
            });
            return;
        }
        next(); // 已登录，允许访问
        return;
    }

    // 场景3：其他页面 → 直接放行
    next();
});

export default router;