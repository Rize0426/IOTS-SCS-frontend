// utils/request.js
import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';
import { useUserStore } from '@/stores/auth.js'; // 引入Pinia用户状态
import { getStorage } from '@/utils/localStorage.js';

const service = axios.create({
    baseURL: '/api', // 后端地址（后续替换）
    timeout: 10000,
    withCredentials: true,
});

// 请求拦截器：携带token
service.interceptors.request.use(
    config => {
        const token = getStorage('token'); // 或从Pinia获取：useUserStore().token
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // 后端要求的请求头格式
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器：处理登录失效等状态
service.interceptors.response.use(
    response => {
        const res = response.data;
        if (res.code === 200) {
            return res; // 正常响应
        } else if (res.code === -2) { // 登录失效（后端定义的code）
            ElMessage.error(res.message || '登录已过期，请重新登录');
            // 清除本地状态
            const userStore = useUserStore();
            userStore.setLogout();
            // 跳转到登录页
            router.push({
                path: '/login',
                query: { redirect: router.currentRoute.value.fullPath }
            });
            return Promise.reject(new Error('登录失效'));
        } else {
            /*ElMessage.success('请求成功');*/
            return Promise.reject(res);
        }
    },
    error => {
        ElMessage.error('网络异常，请稍后重试');
        return Promise.reject(error);
    }
);

export default service;