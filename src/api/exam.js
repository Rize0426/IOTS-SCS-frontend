import request from '@/utils/request';

/**
 * 获取考试列表
 * @param {string} courseId - 课程ID (可选)
 * @param {string} status - 考试状态，如 "upcoming", "ongoing", "completed" (可选)
 * @returns {Promise} - 考试列表
 */
export function getExams(courseId, status) {
    return request({
        url: '/api/exams',
        method: 'get',
        params: {
            course_id: courseId,
            status
        }
    });
}

/**
 * 获取考试详情
 * @param {string} examId - 考试ID
 * @returns {Promise} - 考试详情
 */
export function getExamDetail(examId) {
    return request({
        url: `/api/exams/${examId}`,
        method: 'get'
    });
}

/**
 * 预约考试
 * @param {string} examId - 考试ID
 * @param {string} reminderTime - 提醒时间
 * @returns {Promise} - 预约结果
 */
export function reserveExam(examId, reminderTime) {
    return request({
        url: `/api/exams/${examId}/reservation`,
        method: 'post',
        data: { reminder_time: reminderTime }
    });
}

/**
 * 提交考试
 * @param {string} examId - 考试ID
 * @param {Object} data - 提交数据
 * @param {Object} data.answers_objective - 客观题答案
 * @param {Object} data.answers_content - 主观题答案
 * @returns {Promise} - 提交结果
 */
export function submitExam(examId, data) {
    return request({
        url: `/api/exams/${examId}`,
        method: 'post',
        data
    });
}

/**
 * 新建考试(教师)
 * @param {Object} data - 考试信息
 * @param {string} data.content - 考试描述与要求
 * @param {number} data.max_number - 最大上传人数
 * @param {number} data.max_chance - 每人可上传次数
 * @param {string} data.start_time - 开始时间
 * @param {string} data.end_time - 结束时间
 * @param {Array} data.attachments - 考试附件
 * @returns {Promise} - 新建结果
 */
export function createExam(data) {
    return request({
        url: '/api/teacher/exams',
        method: 'post',
        data
    });
}