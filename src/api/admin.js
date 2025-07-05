import request from '@/utils/request';

/**
 * 增加用户
 * @param {Object} data - 用户信息
 * @param {Array} data.usernames - 用户名列表
 * @param {string} data.role - 用户角色
 * @returns {Promise} - 增加结果
 */
export function addUsers(data) {
    return request({
        url: '/api/admin/users',
        method: 'post',
        data
    });
}

/**
 * 重置密码
 * @param {string} uid - 用户ID
 * @returns {Promise} - 重置结果
 */
export function resetPassword(uid) {
    return request({
        url: `/api/admin/users/${uid}`,
        method: 'post'
    });
}

/**
 * 获取用户活动日志
 * @param {string} uid - 用户ID
 * @param {string} activity - 活动内容 (可选)
 * @param {number} page - 页码 (可选)
 * @param {number} pageSize - 每页数量 (可选)
 * @returns {Promise} - 日志列表
 */
export function getUserActivityLogs(uid, activity, page = 1, pageSize = 10) {
    return request({
        url: `/api/admin/users/${uid}/activity_logs`,
        method: 'get',
        params: {
            activity,
            page,
            page_size: pageSize
        }
    });
}