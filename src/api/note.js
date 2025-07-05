import request from '@/utils/request';

/**
 * 获取学习笔记
 * @param {string} courseId - 课程ID (可选)
 * @param {string} lessonId - 课时ID (可选)
 * @returns {Promise} - 笔记列表
 */
export function getNotes(courseId, lessonId) {
    return request({
        url: '/api/notes',
        method: 'get',
        params: {
            course_id: courseId,
            lesson_id: lessonId
        }
    });
}

/**
 * 创建学习笔记
 * @param {Object} data - 笔记信息
 * @param {string} data.course_id - 课程ID
 * @param {string} data.lesson_id - 课时ID (可选)
 * @param {string} data.title - 标题
 * @param {string} data.content - 内容
 * @returns {Promise} - 创建结果
 */
export function createNote(data) {
    return request({
        url: '/api/notes',
        method: 'post',
        data
    });
}

/**
 * 获取笔记详情
 * @param {string} noteId - 笔记ID
 * @returns {Promise} - 笔记详情
 */
export function getNoteDetail(noteId) {
    return request({
        url: `/api/notes/${noteId}`,
        method: 'get'
    });
}

/**
 * 更新学习笔记
 * @param {string} noteId - 笔记ID
 * @param {Object} data - 笔记信息
 * @param {string} data.title - 标题
 * @param {string} data.content - 内容
 * @returns {Promise} - 更新结果
 */
export function updateNote(noteId, data) {
    return request({
        url: `/api/notes/${noteId}`,
        method: 'put',
        data
    });
}

/**
 * 删除学习笔记
 * @param {string} noteId - 笔记ID
 * @returns {Promise} - 删除结果
 */
export function deleteNote(noteId) {
    return request({
        url: `/api/notes/${noteId}`,
        method: 'delete'
    });
}