import request from '@/utils/request';

/**
 * 获取问题列表
 * @param {string} status - 问题状态，如 "pending", "answered", "closed" (可选)
 * @param {string} courseId - 课程ID (可选)
 * @param {number} page - 页码 (可选)
 * @param {number} pageSize - 每页数量 (可选)
 * @returns {Promise} - 问题列表
 */
export function getQuestions(status, courseId, page = 1, pageSize = 10) {
    return request({
        url: '/api/questions',
        method: 'get',
        params: {
            status,
            course_id: courseId,
            page,
            page_size: pageSize
        }
    });
}

/**
 * 提交新问题
 * @param {Object} data - 问题信息
 * @param {string} data.course_id - 关联课程
 * @param {string} data.lesson_id - 关联课时 (可选)
 * @param {string} data.title - 标题
 * @param {string} data.description - 描述
 * @param {Array} data.attachments - 附件列表 (可选)
 * @returns {Promise} - 提交结果
 */
export function createQuestion(data) {
    return request({
        url: '/api/questions',
        method: 'post',
        data
    });
}

/**
 * 获取问题详情及回复
 * @param {string} questionId - 问题ID
 * @returns {Promise} - 问题详情和回复
 */
export function getQuestionDetail(questionId) {
    return request({
        url: `/api/questions/${questionId}`,
        method: 'get'
    });
}