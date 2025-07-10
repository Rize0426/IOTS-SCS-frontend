// stores/auth.js
import { defineStore } from 'pinia';
import { getStorage, setStorage, delStorage } from '@/utils/localStorage.js';

export const useUserStore = defineStore('user', {
    state: () => ({
        token: getStorage('token') || '',          // 从 localStorage 初始化
        userInfo: JSON.parse(getStorage('userInfo') || '{}'), // 从 localStorage 初始化
        isLoggedIn: !!getStorage('token'),          // 登录状态
        useRole:"teacher"
    }),
    actions: {
        // 登录（存储状态）
        setLogin(token, userInfo) {
            this.token = token;
            this.userInfo = userInfo;
            this.isLoggedIn = true;
            setStorage('token', token);              // 同步到 localStorage
            setStorage('userInfo', JSON.stringify(userInfo));
        },
        // 登出（清除状态）
        setLogout() {
            this.token = '';
            this.userInfo = {};
            this.isLoggedIn = false;
            delStorage('token');                     // 清除 localStorage
            delStorage('userInfo');
        }
    }
});