import request from '@/utils/request';

// 教师课程管理
export const teacherCourseApi = {
    /**
     * 获取教师的全部课程
     * @param {string} status - 课程状态，如 "in_progress", "completed", "all"
     * @returns {Promise} - 课程列表
     */
    getCourses(status) {
        return request({
            url: '/api/teacher/courses',
            method: 'get',
            params: { status }
        });
    },

    /**
     * 获取课程详细信息
     * @param {string} courseId - 课程ID
     * @returns {Promise} - 课程详情
     */
    getCourseDetail(courseId) {
        return request({
            url: `/api/teacher/courses/${courseId}`,
            method: 'get'
        });
    },

    /**
     * 上传课程资料
     * @param {string} courseId - 课程ID
     * @param {Array} attachments - 附件列表，包含file_id、file_name、file_url
     * @returns {Promise} - 上传结果
     */
    uploadResource(courseId, attachments) {
        return request({
            url: `/api/teacher/courses/${courseId}/resources`,
            method: 'post',
            data: { attachments }
        });
    }
};

// 学生课程管理
export const studentCourseApi = {
    /**
     * 获取已选课程列表
     * @param {string} status - 课程状态，如 "in_progress", "completed", "all"
     * @returns {Promise} - 课程列表
     */
    getMyCourses(status) {
        return request({
            url: '/api/courses',
            method: 'get',
            params: { status }
        });
    },

    /**
     * 获取课程详情
     * @param {string} courseId - 课程ID
     * @returns {Promise} - 课程详情
     */
    getCourseDetail(courseId) {
        return request({
            url: `/api/courses/${courseId}`,
            method: 'get'
        });
    },

    /**
     * 获取课程进度
     * @param {string} courseId - 课程ID
     * @returns {Promise} - 课程进度
     */
    getCoursesProgress(courseId) {
        return request({
            url: `/api/courses/${courseId}/progress`,
            method: `get`
        });
    },

    /**
     * 获取课程全部课时
     * @param {string} courseId - 课程ID
     * @returns {Promise} - 课时列表
     */
    getLessonsRes(courseId) {
        return request({
            url: `/api/courses/${courseId}/lessons/resources`,
            method: 'get'
        });
    },

    getLessonsVideo(courseId) {
        return request({
            url: `/api/courses/${courseId}/lessons/video`,
            method: 'get'
        })
    },

    /**
     * 获取课时内容
     * @param {string} courseId - 课程ID
     * @param {string} lessonId - 课时ID
     * @returns {Promise} - 课时内容
     */
    getLessonContent(courseId, lessonId) {
        return request({
            url: `/api/courses/${courseId}/lessons/${lessonId}`,
            method: 'get'
        });
    },

    /**
     * 标记课时完成
     * @param {string} courseId - 课程ID
     * @param {string} lessonId - 课时ID
     * @returns {Promise} - 标记结果
     */
    markLessonCompleted(courseId, lessonId) {
        return request({
            url: `/api/courses/${courseId}/lessons/${lessonId}/status`,
            method: 'post'
        });
    }
};