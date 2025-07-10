// src/utils/dateUtils.js

/**
 * 格式化日期为指定格式的字符串
 * @param {Date|string} date - 日期对象或字符串
 * @param {string} format - 格式模板（如 'YYYY-MM-DD HH:mm'）
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需+1
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * 计算两个日期之间的天数差
 * @param {Date|string} start - 开始日期
 * @param {Date|string} end - 结束日期
 * @returns {number} 天数差（绝对值）
 */
export function getDateDiff(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}