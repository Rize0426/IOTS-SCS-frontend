import request from '@/utils/request';
import { uploadFile } from './file.js';

/**
 * 搜索知识库
 * @param {string} query - 搜索关键词
 * @param {string} category - 分类筛选 (可选)
 * @param {number} page - 页码 (可选)
 * @param {number} pageSize - 每页数量 (可选)
 * @returns {Promise} - 搜索结果
 */
export function searchKnowledge(query, category, page = 1, pageSize = 10) {
    return request({
        url: '/api/knowledge',
        method: 'get',
        params: {
            query,
            category,
            page,
            page_size: pageSize
        }
    });
}

/**
 * 获取知识点详情
 * @param {string} knowledgeId - 知识点ID
 * @returns {Promise} - 知识点详情
 */
export function getKnowledgeDetail(knowledgeId) {
    return request({
        url: `/api/knowledge/${knowledgeId}`,
        method: 'get'
    });
}

/**
 * 上传知识点
 * @param {Object} data - 知识点信息
 * @param {string} data.title - 标题
 * @param {string} data.content - 内容
 * @param {Array} data.attachments - 附件列表
 * @returns {Promise} - 上传结果
 */
export function uploadKnowledge(data) {
    return request({
        url: '/api/knowledge',
        method: 'post',
        data
    });
}

/**
 * 上传知识点附件
 * @param {File} file - 要上传的文件
 * @param {string} fileUsage - 文件用途
 * @returns {Promise} - 上传结果
 */
export function uploadKnowledgeAttachment(file, fileUsage) {
    return uploadFile(file, fileUsage);
}