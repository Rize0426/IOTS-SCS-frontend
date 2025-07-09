// stores/auth.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('token') || '',          // 从 localStorage 初始化
        userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'), // 从 localStorage 初始化
        isLoggedIn: !!localStorage.getItem('token')          // 登录状态
    }),
    actions: {
        // 登录（存储状态）
        setLogin(token, userInfo) {
            this.token = token;
            this.userInfo = userInfo;
            this.isLoggedIn = true;

            localStorage.setItem('token', token);              // 同步到 localStorage
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
        },
        // 登出（清除状态）
        setLogout() {
            this.token = '';
            this.userInfo = {};
            this.isLoggedIn = false;

            localStorage.removeItem('token');                     // 清除 localStorage
            localStorage.removeItem('userInfo');
        }
    }
});