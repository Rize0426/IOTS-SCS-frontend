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
    return request(`/api/evaluation/report?period=${period}`).then(res => res.data);
}
