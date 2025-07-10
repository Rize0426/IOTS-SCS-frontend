// src/api/forum.js
import { ref } from 'vue'

// 模拟用户数据
const mockUsers = [
    { id: 1, name: '张三', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: 2, name: '李四', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: 3, name: '王五', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: 4, name: '赵六', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' }
]

// 当前登录用户 (模拟)
const currentUser = ref(mockUsers[0])

// 模拟帖子数据
const mockPosts = ref([
    {
        id: 1,
        title: '关于Vue3的组合式API学习心得',
        content: '最近在学习Vue3的组合式API，感觉和之前的选项式API有很大不同。组合式API更灵活，可以将相关功能组织在一起，代码更清晰。有没有人愿意分享一下学习经验？',
        author: mockUsers[1],
        createdAt: new Date(Date.now() - 3600000 * 24),
        likes: 15,
        liked: false,
        replies: [
            {
                id: 101,
                content: '我也在学习中，感觉用setup语法糖真的很方便，代码更简洁了。',
                author: mockUsers[2],
                createdAt: new Date(Date.now() - 3600000 * 23),
            },
            {
                id: 102,
                content: '是的，组合式API对于逻辑复用比mixins好太多了，推荐使用。',
                author: mockUsers[0],
                createdAt: new Date(Date.now() - 3600000 * 22),
            }
        ]
    },
    {
        id: 2,
        title: 'TypeScript在Vue项目中的应用',
        content: '大家觉得在Vue项目中使用TypeScript真的有必要吗？虽然知道TS有很多好处，但配置起来好像挺麻烦的，有什么好的学习资源推荐吗？',
        author: mockUsers[3],
        createdAt: new Date(Date.now() - 3600000 * 12),
        likes: 8,
        liked: false,
        replies: [
            {
                id: 201,
                content: '我觉得很有必要，特别是大型项目，TS能提供更好的类型安全和开发体验。',
                author: mockUsers[1],
                createdAt: new Date(Date.now() - 3600000 * 11),
            }
        ]
    },
    {
        id: 3,
        title: '如何高效使用Element Plus组件库',
        content: '最近项目用了Element Plus，但是感觉有些组件用法比较复杂，有没有好的学习资源或者技巧推荐？',
        author: mockUsers[2],
        createdAt: new Date(Date.now() - 3600000 * 6),
        likes: 12,
        liked: false,
        replies: []
    }
])

// 获取帖子列表
export const getPosts = async () => {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...mockPosts.value]
}

// 获取单个帖子详情
export const getPostById = async (postId) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const post = mockPosts.value.find(p => p.id === postId)
    if (!post) throw new Error('帖子不存在')
    return post
}

// 创建新帖子
export const createPost = async (postData) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const newPost = {
        id: mockPosts.value.length + 1,
        title: postData.title,
        content: postData.content,
        author: currentUser.value,
        createdAt: new Date(),
        likes: 0,
        liked: false,
        replies: []
    }
    mockPosts.value.unshift(newPost)
    return newPost
}

// 添加回复
export const addReply = async (postId, content) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const post = mockPosts.value.find(p => p.id === postId)
    if (!post) throw new Error('帖子不存在')

    const newReply = {
        id: Date.now(), // 使用时间戳作为临时ID
        content,
        author: currentUser.value,
        createdAt: new Date()
    }

    if (!post.replies) post.replies = []
    post.replies.push(newReply)
    return newReply
}

// 点赞/取消点赞帖子
export const toggleLikePost = async (postId) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const post = mockPosts.value.find(p => p.id === postId)
    if (!post) throw new Error('帖子不存在')

    if (post.liked) {
        post.likes--
    } else {
        post.likes++
    }
    post.liked = !post.liked
    return post
}

// 获取当前用户
export const getCurrentUser = async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
    return currentUser.value
}