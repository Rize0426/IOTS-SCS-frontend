// src/api/chat.js
import axios from 'axios';

// 模拟API基础URL（后续连接后端时替换）
const BASE_URL = '/api';

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
    await mockDelay(300); // 模拟网络延迟
    return {
        data: [
            {
                id: 'user_456',
                name: '小明',
                avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9cpng.png',
                online: false,
                lastMessage: {
                    content: '对了，我昨天拍了张校园晚霞的照片，超美！等会发你~',
                    timestamp: Date.now() - 1800000, // 半小时前
                    isRead: false
                }
            },
            {
                id: 'user_789',
                name: '小红',
                avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
                online: true,
                lastMessage: {
                    content: '明天上午的课我们调换教室了，记得带电脑！',
                    timestamp: Date.now() - 86400000, // 昨天
                    isRead: true
                }
            }
        ]
    };
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
    await mockDelay(300);
    // 根据contactId返回不同的模拟数据
    const messagesMap = {
        'user_456': [
            {
                id: 1,
                senderId: 'user_456',
                receiverId: 'user_123',
                content: '早啊！今天课多吗？',
                timestamp: Date.now() - 86400000, // 昨天
                isRead: true
            },
            {
                id: 2,
                senderId: 'user_123',
                receiverId: 'user_456',
                content: '还行，上午3节专业课，下午没课~ 你呢？',
                timestamp: Date.now() - 86340000, // 昨天
                isRead: true
            },
            {
                id: 3,
                senderId: 'user_456',
                receiverId: 'user_123',
                content: '我今天满课！上午高数+英语，下午还有实验课😭',
                timestamp: Date.now() - 86280000, // 昨天
                isRead: true
            },
            {
                id: 4,
                senderId: 'user_123',
                receiverId: 'user_456',
                content: '实验课是不是那个物理实验？我上周刚做过类似的~',
                timestamp: Date.now() - 86220000, // 昨天
                isRead: true
            },
            {
                id: 5,
                senderId: 'user_456',
                receiverId: 'user_123',
                content: '对！就是那个测密度的实验，我差点把量筒打碎😂',
                timestamp: Date.now() - 86160000, // 昨天
                isRead: true
            },
            {
                id: 6,
                senderId: 'user_123',
                receiverId: 'user_456',
                content: '哈哈哈哈我懂！上次我把烧杯摔了，被老师说了半小时😅',
                timestamp: Date.now() - 86100000, // 昨天
                isRead: true
            },
            {
                id: 7,
                senderId: 'user_456',
                receiverId: 'user_123',
                content: '对了，周末要不要一起去图书馆？我借了本新到的《机器学习实战》',
                timestamp: Date.now() - 43200000, // 今天上午10点
                isRead: true
            },
            {
                id: 8,
                senderId: 'user_123',
                receiverId: 'user_456',
                content: '好呀！我正好想找本算法书看，几点？',
                timestamp: Date.now() - 42600000, // 今天上午10:10
                isRead: true
            },
            {
                id: 9,
                senderId: 'user_456',
                receiverId: 'user_123',
                content: '下午2点怎么样？我在图书馆门口等你~',
                timestamp: Date.now() - 42000000, // 今天上午10:20
                isRead: true
            },
            {
                id: 10,
                senderId: 'user_123',
                receiverId: 'user_456',
                content: '没问题！我提前10分钟到~',
                timestamp: Date.now() - 3600000, // 1小时前
                isRead: true
            },
            {
                id: 11,
                senderId: 'user_456',
                receiverId: 'user_123',
                content: '对了，我昨天拍了张校园晚霞的照片，超美！等会发你~',
                timestamp: Date.now() - 1800000, // 半小时前
                isRead: false
            }
        ],
        'user_789': [
            {
                id: 101,
                senderId: 'user_789',
                receiverId: 'user_123',
                content: '明天上午的课我们调换教室了，记得带电脑！',
                timestamp: Date.now() - 86400000, // 昨天
                isRead: true
            },
            {
                id: 102,
                senderId: 'user_123',
                receiverId: 'user_789',
                content: '好的，收到！我明天会提前到教室~',
                timestamp: Date.now() - 86340000, // 昨天
                isRead: true
            }
        ]
    };

    return { data: messagesMap[contactId] || [] };
};

// 发送消息
export const sendMessage = async (message) => {
    await mockDelay(300);
    return {
        data: {
            ...message,
            id: Date.now(), // 模拟生成ID
            timestamp: Date.now(),
            isRead: false
        }
    };
};

// 标记消息为已读
export const markMessageAsRead = async (messageId) => {
    await mockDelay(200);
    return { data: { success: true } };
};