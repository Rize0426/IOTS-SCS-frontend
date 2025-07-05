<template>
  <div class="user-info-card">
    <!-- 头像 -->
    <div class="avatar-container">
      <img :src="userInfo.avatar" class="avatar" alt="用户头像" />
    </div>

    <!-- 用户信息 -->
    <div class="info-container">
      <!-- 用户名 -->
      <div class="username">{{ userInfo.username }}</div>

      <!-- 用户身份 -->
      <div class="role">{{ userInfo.role }}</div>
    </div>
  </div>
</template>

<script setup>
import defaultAvatar from '@/assets/images/个人信息头像.png';
// 定义props，接收后端传值
const props = defineProps({
  userInfo: {
    type: Object,
    required: true,
    default: () => ({
      avatar: defaultAvatar,
      username: '当前用户',                   // 默认用户名
      role: '学生'                           // 默认用户身份
    })
  }
})
</script>

<style scoped>
.user-info-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 200px;
}

.avatar-container {
  display: flex;
  justify-content: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover; /* 确保头像填充整个区域 */
}

.info-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 5px;
}

.username {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  text-align: left;
  flex: 1;
  margin-right: 8px;
}

.role {
  font-size: 16px;
  color: #666;
  text-align: right;
  flex: 1;
  /* 确保文字不换行 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>