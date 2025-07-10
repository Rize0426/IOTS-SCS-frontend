import request from '@/utils/request';

/**
 * 上传文件
 * @param {File} file - 要上传的文件
 * @param {string} fileUsage - 文件用途描述
 * @returns {Promise} - 返回上传结果
 */
export function uploadFile(file, fileUsage) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_usage', fileUsage);

    return request({
        url: '/api/files',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * 下载文件
 * @param {string} fileId - 文件ID
 * @returns {Promise} - 返回文件下载链接
 */
export function downloadFile(fileId) {
    return request({
        url: `/api/files?file_id=${fileId}`,
        method: 'get',
        responseType: 'blob' // 重要：设置响应类型为blob
    });
}
