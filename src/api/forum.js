// src/api/forum.js
import { customFetch } from './customFetch'
import { useUserStore } from '@/stores/auth'

const userStore = useUserStore()
// 获取帖子列表
export const getPosts = async () => {
    const response = await customFetch(`/posts/discussions?courseId=123456`)
    const data = await response.json()
    if (!data) {
        throw Error("获取帖子失败")
    }
    return data.map(s => {
        return {
            id: s.post_id,
            title: s.title,
            content: s.preview,
            author: {
                id: s.user_id,
                name: s.user_name,
                avatar: s.avatar
            },
            createdAt: new Date(s.create_time),
            likes: s.like_count,
            liked: false,
            replies: [],
            reply_count: s.reply_count
        }
    })
}

// 获取单个帖子详情
export const getPostById = async (postId) => {
    const response = await customFetch(`/posts/${postId}`)
    const data = await response.json()
    if (!data) {
        throw Error("获取该帖子内容失败")
    }
    return {
        id: data.post_id,
        title: data.title,
        content: data.content,
        author: {
            id: data.user_id,
            name: data.user_name,
            avatar: data.avatar
        },
        createdAt: new Date(data.create_time),
        likes: data.like_count,
        liked: false,
        replies: [...data.replies.map(s => {
            return {
                id: s.reply_id,
                content: s.content,
                createdAt: new Date(s.create_time),
                author: {
                    id: s.user_id,
                    name: s.user_name,
                    avatar: s.avatar
                }
            }
        })]
    }
}

// 创建新帖子
export const createPost = async (postData) => {
    const newPost = {
        title: postData.title,
        content: postData.content,
        course_id: 123456,
        user_id: userStore.userInfo.uid
    }
    const response = await customFetch("/posts/createDiscussionPost", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPost)
    })
    const data = await response.json()
    if (!data) {
        throw Error("发帖失败")
    }
    return {
        id: data.post_id,
        title: data.title,
        content: data.content,
        author: {
            id: data.user_id,
            name: data.user_name,
            avatar: data.avatar
        },
        createdAt: new Date(data.create_time),
        likes: data.like_count,
        liked: false,
        replies: [...data.replies.map(s => {
            return {
                id: s.reply_id,
                content: s.content,
                createdAt: new Date(s.create_time),
                author: {
                    id: s.user_id,
                    name: s.user_name,
                    avatar: s.avatar
                }
            }
        })]
    }
}

// 添加回复
export const addReply = async (postId, content) => {
    const response = await customFetch(`/posts/${postId}/replies`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_id: userStore.userInfo.uid,
            content: content
        })
    })
    const data = await response.json()
    if (!data) {
        throw Error("回复失败")
    }
    return {
        id: data.reply_id,
        content: data.content,
        createdAt: new Date(data.create_time),
        author: {
            id: data.user_id,
            name: data.user_name,
            avatar: data.avatar
        }
    }
}

// 点赞/取消点赞帖子
export const toggleLikePost = async (postId) => {
    await customFetch(`/posts/${postId}/like`,{
        method:"PUT"
    })
    return true
}

// 获取当前用户
export const getCurrentUser = async () => {
    return {
        id:userStore.userInfo.uid,
        name:userStore.userInfo.account,
        avatar:userStore.userInfo.avatar_url
    }
}