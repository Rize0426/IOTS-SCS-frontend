<template>
  <div class="user-info-card">
    <!-- 头像 -->
    <div class="avatar-container">
      <img :src="userInfo.avatar" class="avatar" alt="用户头像" />
    </div>

    <!-- 用户信息 -->
    <div class="info-container">
      <!-- 用户名 -->
      <div class="username">{{ userInfo.username}}</div>

      <!-- 用户身份 -->
      <div class="role">{{ userInfo.role }}</div>
    </div>
  </div>
</template>

<script setup>
import defaultAvatar from '@/assets/images/个人信息头像.png';
import { computed } from "vue";
import { useUserStore } from "@/stores/auth.js";

function translateRole(role) {
  switch (role) {
    case 'student': return "学生";
    case 'teacher': return "教师";
    case 'admin': return "管理员";
    default: return "未知用户";
  }
}

const userStore = useUserStore();

const userInfo = computed(() => {
  const info = userStore.userInfo || {};
  return {
    avatar: info.avatar_url || defaultAvatar,
    username: info.account || "当前用户",
    role: translateRole(info.role),
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