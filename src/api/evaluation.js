/*
import request from '@/utils/request';

/!**
 * 获取学习效果报告
 * @param {string} period - 报告周期，如 "weekly", "monthly", "term" (可选)
 * @returns {Promise} - 学习效果报告
 *!/
export function getEvaluationReport(period) {
    return request({
        url: '/api/evaluation/report',
        method: 'get',
        params: { period }
    });
}*/
import request from '@/utils/request';

/**
 * 获取学习效果报告（支持模拟数据）
 * @param {string} period - 报告周期
 * @returns {Promise} - 学习效果报告
 */
export function getEvaluationReport(period) {
    // 返回模拟数据（结构与真实接口完全一致）
    return Promise.resolve({
        code: 200,
        message: "获取成功（模拟数据）",
        data: {
            overall_progress: 78,
            average_score: 86.5,
            engagement_metrics: {
                study_time_minutes: 1520,
                login_days: 22,
                interactive_posts: 18
            },
            performance_by_course: [
                {course_id: "CS101", course_name: "计算机基础", progress: 85, score: 89},
                {course_id: "MA202", course_name: "高等数学", progress: 72, score: 78},
                {course_id: "PH303", course_name: "大学物理", progress: 65, score: 82}
            ],
            skill_mastery: [
                {skill_name: "编程逻辑", mastery_level: 82},
                {skill_name: "数学建模", mastery_level: 75},
                {skill_name: "数据分析", mastery_level: 68}
            ],
            recommendations: [
                "建议增加编程实战练习，提升代码熟练度",
                "高等数学的微积分部分需加强，推荐观看《微积分的本质》系列视频",
                "每周保持至少3次学习互动，可加入学习小组提升参与感"
            ]
        }
    });
}
