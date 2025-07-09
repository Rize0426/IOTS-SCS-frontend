import request from '@/utils/request';

/**
 * 获取成绩单
 * @param {string} academicYear - 学年 (可选)
 * @returns {Promise} - 成绩列表
 */
export function getGrades(academicYear) {
    return request({
        url: '/api/grades',
        method: 'get',
        params: { academic_year: academicYear }
    });
}

/**
 * 获取考试成绩详情
 * @param {string} examId - 考试ID
 * @returns {Promise} - 考试成绩详情
 */
export function getExamGradeDetail(examId) {
    return request({
        url: `/api/grades/${examId}`,
        method: 'get'
    });
}