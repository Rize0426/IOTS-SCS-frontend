// src/api/evaluation.js
import request from '@/utils/request.js'; // 导入公共请求实例（注意.js后缀）

/**
 * 提交课程评价
 * @param {Object} data 评价表单数据
 * @param {number} data.courseId 课程ID
 * @param {number} data.contentEvaluation 内容评分（1-5）
 * @param {number} data.serviceEvaluation 服务评分（1-5）
 * @param {number} data.attitudeEvaluation 态度评分（1-5）
 * @param {number} data.effectEvaluation 效果评分（1-5）
 * @param {string} data.evaluationContent 评价内容
 * @returns {Promise} 响应结果（含成功消息）
 */
export function submitEvaluation(data) {
    return request({
        url: '/api/evaluations',
        method: 'post',
        data // POST 请求体（自动序列化为JSON）
    });
}

/**
 * 获取某课程的评价列表（仅评价数据，用于后台）
 * @param {number} courseId 课程ID
 * @returns {Promise} 响应结果（含评价列表数据）
 */
export function getEvaluationList(courseId) {
    return request({
        url: `/api/evaluations/course/${courseId}`,
        method: 'get'
    });
}

/**
 * 获取某课程的评价详情（含课程名称和教师，用于前端展示）
 * @param {number} courseId 课程ID
 * @returns {Promise} 响应结果（含评价详情列表数据）
 */
export function getEvaluationDetails(courseId) {
    return request({
        url: `/api/evaluations/details/${courseId}`,
        method: 'get'
    });
}