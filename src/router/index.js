// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/auth.js'; // 引入Pinia用户状态

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
            component: () => import('@/components/user/UserEvaluation.vue'),
            meta: { requiresAuth: true } // 如果需要登录才能访问
        }
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

    // 场景3：其他页面 → 直接放行
    next();
});

export default router;