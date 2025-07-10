// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/auth.js'; // 引入Pinia用户状态
import ExamResultView from '@/pages/ExamSystemView/student/main/ExamResultView.vue';
import ExamView from '@/pages/ExamSystemView/student/main/ExamView.vue';
import KnowledgeBrowerView from '../pages/KnowledgeBaseSystemView/list/KnowledgeBrowerView.vue'
import KnowledgeDetailView from '../pages/KnowledgeBaseSystemView/list/KnowledgeDetailView.vue'
import FavoriteView from '../pages/KnowledgeBaseSystemView/list/FavoriteView.vue'
import HistoryView from '../pages/KnowledgeBaseSystemView/list/HistoryView.vue'
import CreateKnowledgeView from '../pages/KnowledgeBaseSystemView/main/CreateKnowledgeView.vue'
import PersonalKnowledgeView from '../pages/KnowledgeBaseSystemView/main/PersonalKnowledgeView.vue'
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/HomeView.vue'),
            meta: { requiresAuth: true } // 需要登录
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/components/login/LoginView.vue')
        },
        {
            path: '/userMessage',
            name: 'userMessage',
            component: () => import('../components/user/UserMessage.vue'),
            meta: { requiresAuth: true } // 需要登录
        },
        {
            path: '/courseCenter',
            name: 'courseCenter',
            component: () => import('../components/Courses/CourseCenter.vue'),
            meta: { requiresAuth: true } // 需要登录
        },
        {
            path: '/course/:id',
            name: 'courseDetail',
            component: () => import('@/components/Courses/CourseDetail.vue'),
            meta: { requiresAuth: true } // 如果需要登录才能访问
        },
        {
            path: '/note',
            name: 'note',
            component: () => import('@/components/note/note.vue'),
            meta: { requiresAuth: true } // 如果需要登录才能访问
        },
        {
            path: '/evaluation',
            name: 'evaluation',
            component: () => import('@/pages/StudyCenterView/LearnCenterView.vue'),
            meta: { requiresAuth: true } // 如果需要登录才能访问
        },
        {
            path: '/assignment/detail/:id',
            name: 'assignmentDetail',
            component: () => import('@/pages/AssignmentSystemView/student/main/AssignmentDetailView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/exam',
            name: 'Exam',
            children: [
                {
                    path: '/exam/result/:paperId',
                    name: 'ExamResult',
                    component: ExamResultView,
                },
                {
                    path: '/exam/paper/:paperId',
                    name: 'ExamPaper',
                    component: ExamView,
                }
            ],
            meta: { requiresAuth: true }
        },
        {
            path: '/knowledge-base',
            name: 'KnowledgeBase',
            children: [
                {
                    path: '/knowledge-base/list',
                    name: 'KnowledgeBaseList',
                    component: KnowledgeBrowerView
                },
                {
                    path: '/knowledge-base/detail/:id',
                    name: 'KnowledgeBaseDetail',
                    component: KnowledgeDetailView
                },
                {
                    path: '/knowledge-base/favorites',
                    name: 'Favorites',
                    component: FavoriteView,
                    meta: { requiresAuth: true }
                },
                {
                    path: '/knowledge-base/history',
                    name: 'History',
                    component: HistoryView,
                    meta: { requiresAuth: true }
                },
                {
                    path: '/knowledge-base/create',
                    name: 'CreateKnowledgeBase',
                    component: CreateKnowledgeView,
                    meta: { requiresAuth: true }
                },
                {
                    path: '/knowledge-base/my',
                    name: 'MyKnowledgeBase',
                    component: PersonalKnowledgeView,
                    meta: { requiresAuth: true }
                },
                {
                    path: '/knowledge-base/author/:authorId',
                    name: 'AuthorKnowledgeBase',
                    component: PersonalKnowledgeView
                }
            ],
            redirect: '/knowledge-base/list'
        },
        {
            path: "/teacher",
            name: "Teacher",
            component: () => import("@/views/TeacherView.vue"),
            meta: { requiresAuth: true, role: "teacher" },
            children: [
                {
                    path: "/teacher/dashboard",
                    name: "TeacherDashboard",
                    component: () => import("@/pages/TeacherSystemView/TeacherDashboardView.vue"),
                    meta: { requiresAuth: true, role: "teacher" },
                },
                // 教师端作业管理
                {
                    path: "/teacher/assignment",
                    name: "TeacherAssignment",
                    children: [
                        {
                            path: "/assignment/teacher/view/submissions/:id/:courseId",
                            name: "TeacherAssignmentSubmissions",
                            component: () => import("@/pages/AssignmentSystemView/teacher/main/StudentSubmissionsView.vue"),
                            meta: { requiresAuth: true, role: "teacher" },
                        },
                    ],
                },
                // 教师端考试管理
                {
                    path: "/teacher/exam",
                    name: "TeacherExam",
                    children: [
                        {
                            path: "/exam/teacher/results/:examId",
                            name: "TeacherExamResults",
                            component: () => import("@/pages/ExamSystemView/teacher/ExamResultsView.vue"),
                            meta: { requiresAuth: true, role: "teacher" },
                        },
                    ],
                },
                // 教师端课程管理
                {
                    path: "/teacher/course",
                    name: "TeacherCourse",
                    children: [
                        {
                            path: "/teacher/course/list",
                            name: "TeacherCourseList",
                            component: () => import("@/pages/TeacherSystemView/CourseManagerView.vue"),
                            meta: { requiresAuth: true, role: "teacher" },
                        },
                        {
                            path: "/teacher/course/detail/:id",
                            name: "TeacherCourseDetail",
                            component: () => import("@/pages/TeacherSystemView/CourseDetailView.vue"),
                            meta: { requiresAuth: true, role: "teacher" },
                        },
                    ],
                },
                // 教师端学生管理
                {
                    path: "/teacher/student",
                    name: "TeacherStudent",
                    children: [
                        {
                            path: "/teacher/student/grades/:courseId",
                            name: "TeacherStudentGrades",
                            component: () => import("@/pages/TeacherSystemView/GradeManagerView.vue"),
                            meta: { requiresAuth: true, role: "teacher" },
                        },
                    ],
                },
            ],
            redirect: "/teacher/dashboard"
        },
    ]
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
    const userStore = useUserStore(); // 获取Pinia用户状态

    // 场景1：访问登录页 → 直接放行
    if (to.path === '/login') {
        next();
        return;
    }

    // 场景2：访问需要登录的页面（如主页）
    if (to.meta.requiresAuth) {
        if (!userStore.isLoggedIn) { // 从Pinia判断状态
            ElMessage.error('请先登录');
            next({
                path: '/login',
                query: { redirect: to.fullPath } // 记录原目标路径
            });
            return;
        }
        next(); // 已登录，允许访问
        return;
    }
    // 场景3：检查角色权限
    if (to.meta.role && to.meta.role !== userStore.userRole) {
        ElMessage.error("权限不足，无法访问该页面")
        next("/") // 重定向到首页
        return
    }
    // 场景3：其他页面 → 直接放行
    next();
});

export default router;