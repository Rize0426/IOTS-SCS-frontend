import request from '@/utils/request';

/**
 * 获取智能推荐内容
 * @returns {Promise} - 推荐内容
 */
export function getSmartRecommendation() {
    return request({
        url: '/api/courses/suggestion',
        method: 'get'
    });
}