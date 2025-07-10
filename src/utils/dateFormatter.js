/**
 * 格式化日期为指定格式的字符串
 * @param {Date} date - 日期对象
 * @param {string} format - 格式化模板，支持的占位符:
 *   YYYY - 四位年份
 *   MM - 两位月份
 *   DD - 两位日期
 *   HH - 两位小时 (24小时制)
 *   mm - 两位分钟
 *   ss - 两位秒数
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) return '';

    const d = new Date(date);

    // 处理无效日期
    if (isNaN(d.getTime())) return '';

    const pad = (num) => num < 10 ? `0${num}` : num;

    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hour = pad(d.getHours());
    const minute = pad(d.getMinutes());
    const second = pad(d.getSeconds());

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hour)
        .replace('mm', minute)
        .replace('ss', second);
}