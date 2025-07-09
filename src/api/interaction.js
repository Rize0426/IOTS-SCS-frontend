import request from '@/utils/request';

/**
 * 获取课程讨论区帖子
 * @param {string} courseId - 课程ID
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise} - 帖子列表
 */
export function getCourseDiscussions(courseId, page = 1, pageSize = 10) {
    return request({
        url: `/api/courses/${courseId}/discussions`,
        method: 'get',
        params: { page, page_size: pageSize }
    });
}

/**
 * 创建讨论区帖子
 * @param {string} courseId - 课程ID
 * @param {string} title - 帖子标题
 * @param {string} content - 帖子内容
 * @returns {Promise} - 创建结果
 */
export function createDiscussion(courseId, title, content) {
    return request({
        url: `/api/courses/${courseId}/discussions`,
        method: 'post',
        data: { title, content }
    });
}

/**
 * 获取帖子详情及回复
 * @param {string} postId - 帖子ID
 * @returns {Promise} - 帖子详情和回复
 */
export function getDiscussionDetail(postId) {
    return request({
        url: `/api/discussions/${postId}`,
        method: 'get'
    });
}

/**
 * 回复帖子
 * @param {string} postId - 帖子ID
 * @param {string} content - 回复内容
 * @returns {Promise} - 回复结果
 */
export function replyToDiscussion(postId, content) {
    return request({
        url: `/api/discussions/${postId}`,
        method: 'post',
        data: { content }
    });
}