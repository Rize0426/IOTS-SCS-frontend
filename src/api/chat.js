// src/api/chat.js
import axios from 'axios';
import { customFetch } from './customFetch';
import { useUserStore } from '@/stores/auth';
// 模拟API基础URL（后续连接后端时替换）
const BASE_URL = '/api';
const userStore = useUserStore()
// 创建axios实例
const chatApi = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 模拟网络延迟（模拟真实网络环境）
const mockDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ------------------------------
// 联系人相关接口
// ------------------------------

// 获取联系人列表
export const getContacts = async () => {
    const response = await customFetch(`/conversations/user/${userStore.userInfo.uid}`)
    const data = await response.json()
    if (!data) {
        return []
    }
    return {
        data: data.map(s => {
            return {
                id: s.conversation_id,
                name: s.partner_name,
                avatar: s.avatar,
                partnerId: s.partner_id,
                lastMessage: {
                    content: s.last_message,
                    timestamp: (new Date(s.last_active_time)).getTime(),
                    isRead: true,
                },
                unreadCount: s.unreadCount
            }
        })
    }
};

// 屏蔽联系人
export const blockContact = async (contactId) => {
    await mockDelay(300);
    return { data: { success: true } };
};

// 举报联系人
export const reportContact = async (contactId, reason) => {
    await mockDelay(300);
    return { data: { success: true } };
};

// ------------------------------
// 聊天记录相关接口
// ------------------------------

// 获取与指定联系人的聊天记录
export const getChatMessages = async (contactId) => {
    const response = await customFetch(`/messages/conversation/${contactId}?currentUserId=${userStore.userInfo.uid}`)
    const data = await response.json()
    if (!data) {
        throw Error("获取聊天信息失败")
    }
    return {
        data: data.map(s => {
            return {
                senderId: s.sender_id,
                receiverId: s.receiver_id,
                isRead: s.is_read,
                avatar: s.avatar,
                senderName: s.sender_name,
                content: s.content,
                id: s.msgId,
                timestamp: new Date(s.send_time).getTime(),
            }
        })
    }
};

// 发送消息
export const sendMessage = async (message) => {
    /*await mockDelay(300);
    return {
        data: {
            ...message,
            id: Date.now(), // 模拟生成ID
            timestamp: Date.now(),
            isRead: false
        }
    };*/
    debugger
    const response = await customFetch(`/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
    })
    const data = await response.json()
    if (!data) {
        throw Error("发送消息失败")
    }
    return {
        data: {
            senderId: data.sender_id,
            receiverId: data.receiver_id,
            isRead: data.is_read,
            avatar: data.avatar,
            senderName: data.sender_name,
            content: data.content,
            id: data.msgId,
            timestamp: new Date(data.send_time).getTime(),
        }
    }
};

// 标记消息为已读
export const markMessageAsRead = async (messageId) => {
    await mockDelay(200);
    return { data: { success: true } };
};