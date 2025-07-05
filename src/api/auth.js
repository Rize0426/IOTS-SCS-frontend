// src/api/auth.js
import request from '@/utils/request.js'; // 导入公共请求实例
import { setStorage, delStorage } from '@/utils/localStorage.js'; // 本地存储工具

/**
 * 用户登录（获取 Token）
 * @param {Object} params 登录参数
 * @param {string} params.way 登录方式（如 "account" 或 "captcha"）
 * @param {number} params.role 用户身份（0-管理员, 1-学生, 2-教师）
 * @param {string} params.username 学号/工号/用户名
 * @param {string} params.password 密码（当 way="account" 时必填）
 * @param {string} params.captcha 验证码（当 way="captcha" 时必填）
 * @returns {Promise} 响应结果（含 Token 和用户信息）
 */
export function login(params) {
    return request({
        url: '/api/auth/login',
        method: 'post',
        data: params // POST 请求体
    }).then(res => {
        // 登录成功后存储 Token 到本地（响应结构：{ code:200, data: { token: "xxx", user_info: {...} } }）
        if (res.code === 200) {
            setStorage('Token', res.data.token); // 存储 Token
            setStorage('userInfo', res.data.user_info); // 可选：缓存用户信息（减少重复请求）
        }
        return res;
    });
}

/**
 * 获取当前登录用户信息
 * @returns {Promise} 响应结果（含用户详细信息）
 */
export function getUserInfo() {
    return request({
        url: `/api/users/${getUserUid()}`, // 动态获取当前用户 UID（从本地存储读取）
        method: 'get'
    });
}

/**
 * 更新当前登录用户信息
 * @param {Object} params 更新字段（如 { phone: "13800138000", avatar_url: "xxx.jpg" }）
 * @returns {Promise} 响应结果
 */
export function updateUserInfo(params) {
    return request({
        url: `/api/users/${getUserUid()}`,
        method: 'put',
        data: params // PUT 请求体（仅传递需要更新的字段）
    });
}

/**
 * 退出登录
 * @returns {Promise} 响应结果
 */
export function logout() {
    return request({
        url: '/api/auth/logout',
        method: 'post'
    }).finally(() => {
        // 无论成功与否，清除本地 Token 和用户信息
        delStorage('Token');
        delStorage('userInfo');
    });
}

/**
 * 辅助函数：从本地存储获取当前用户 UID（需登录后存在）
 * @returns {string} 用户 UID
 */
function getUserUid() {
    const userInfo = getStorage('userInfo'); // 假设已封装 getStorage
    return userInfo?.uid || ''; // 若未登录，返回空（需上层处理错误）
}