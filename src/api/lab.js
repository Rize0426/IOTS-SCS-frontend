import request from '@/utils/request';

/**
 * 获取实验/实训列表
 * @param {string} type - 类型："lab" 或 "project" (可选)
 * @param {string} courseId - 课程ID (可选)
 * @returns {Promise} - 实验/实训列表
 */
export function getLabsProjects(type, courseId) {
    return request({
        url: '/api/labs_projects',
        method: 'get',
        params: {
            type,
            course_id: courseId
        }
    });
}

/**
 * 获取实验/实训详情
 * @param {string} id - 实验/实训ID
 * @returns {Promise} - 实验/实训详情
 */
export function getLabProjectDetail(id) {
    return request({
        url: `/api/labs_projects/${id}`,
        method: 'get'
    });
}

/**
 * 提交实验/实训成果
 * @param {string} id - 实验/实训ID
 * @param {Object} data - 提交数据
 * @param {string} data.content - 提交文本内容
 * @param {string} data.experiment_data - 实验数据(JSON)
 * @param {Array} data.attachments - 附件列表
 * @returns {Promise} - 提交结果
 */
export function submitLabProject(id, data) {
    return request({
        url: `/api/labs_projects/${id}`,
        method: 'post',
        data
    });
}