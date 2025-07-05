import request from '@/utils/request';
import { uploadFile } from './upload';

/**
 * 获取作业列表
 * @param {string} courseId - 课程ID (可选)
 * @param {string} status - 作业状态，如 "pending", "submitted", "graded" (可选)
 * @returns {Promise} - 作业列表
 */
export function getAssignments(courseId, status) {
    return request({
        url: '/api/assignments',
        method: 'get',
        params: {
            course_id: courseId,
            status
        }
    });
}

/**
 * 获取作业详情
 * @param {string} assignmentId - 作业ID
 * @returns {Promise} - 作业详情
 */
export function getAssignmentDetail(assignmentId) {
    return request({
        url: `/api/assignments/${assignmentId}`,
        method: 'get'
    });
}

/**
 * 提交作业
 * @param {string} assignmentId - 作业ID
 * @param {Object} data - 提交数据
 * @param {string} data.answer_content - 主观题答案
 * @param {Object} data.answers_objective - 客观题答案
 * @param {Array} data.attachments - 附件列表
 * @returns {Promise} - 提交结果
 */
export function submitAssignment(assignmentId, data) {
    return request({
        url: `/api/assignments/${assignmentId}`,
        method: 'post',
        data
    });
}

/**
 * 上传作业附件
 * @param {File} file - 要上传的文件
 * @param {string} fileUsage - 文件用途
 * @returns {Promise} - 上传结果
 */
export function uploadAssignmentAttachment(file, fileUsage) {
    return uploadFile(file, fileUsage);
}

/**
 * 新建作业(教师)
 * @param {Object} data - 作业信息
 * @param {string} data.content - 作业描述与要求
 * @param {number} data.max_number - 最大上传人数
 * @param {number} data.max_chance - 每人可上传次数
 * @param {string} data.end_date - 截止时间
 * @param {Array} data.attachments - 作业附件
 * @returns {Promise} - 新建结果
 */
export function createAssignment(data) {
    return request({
        url: '/api/teacher/assignments',
        method: 'post',
        data
    });
}

/**
 * 修改作业(教师)
 * @param {string} assignmentId - 作业ID
 * @param {Object} data - 修改的作业信息
 * @returns {Promise} - 修改结果
 */
export function updateAssignment(assignmentId, data) {
    return request({
        url: `/api/teacher/assignments/${assignmentId}`,
        method: 'put',
        data
    });
}