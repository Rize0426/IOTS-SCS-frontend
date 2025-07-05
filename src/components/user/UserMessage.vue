<template>
  <div class="page-container">
    <!-- 左半部分保持不变 -->
    <div class="left-sidebar">
      <UserCenter />
      <FunctionButtons />
    </div>

    <!-- 右半部分重构为个人信息页面 -->
    <div class="right-column">
      <!-- 个人信息头部：头像和上传按钮 -->
      <div class="profile-header">
        <div class="avatar-container">
          <img :src="userAvatar" alt="个人头像" class="avatar">
          <label for="avatar-upload" class="upload-button">
            <i class="el-icon-camera"></i> 上传
          </label>
          <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              @change="handleAvatarUpload"
              class="avatar-input"
          >
        </div>
      </div>

      <!-- 个人信息详情列表 -->
      <div class="profile-details">
        <div class="detail-item">
          <span class="detail-label">姓名：</span>
          <span class="detail-value">{{ userName }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">身份：</span>
          <span class="detail-value">{{ identity }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">大学：</span>
          <span class="detail-value">{{ university }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">专业：</span>
          <span class="detail-value">{{ major }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">年龄：</span>
          <span class="detail-value">{{ age }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">性别：</span>
          <span class="detail-value">{{ gender }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">邮箱：</span>
          <span class="detail-value">{{ email }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">手机号：</span>
          <span class="detail-value">{{ phone }}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">密码：</span>
          <button class="edit-password-btn" @click="showPasswordModal = true">
            修改
          </button>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="showPasswordModal = false">
      <div class="password-modal" @click.stop>
        <h3>修改密码</h3>
        <div class="form-group">
          <label>原密码：</label>
          <input type="password" v-model="oldPassword">
        </div>
        <div class="form-group">
          <label>新密码：</label>
          <input type="password" v-model="newPassword">
        </div>
        <div class="form-group">
          <label>确认新密码：</label>
          <input type="password" v-model="confirmPassword">
        </div>
        <div class="button-group">
          <button class="cancel-btn" @click="showPasswordModal = false">取消</button>
          <button class="confirm-btn" @click="changePassword">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 导入需要的组件
import UserCenter from '@/components/user/UserCenter.vue'
import FunctionButtons from '@/components/tools/FunctionButtons.vue'
import defaultAvatar from '@/assets/images/个人信息头像.png';

export default {
  components: {
    UserCenter,
    FunctionButtons
  },
  data() {
    return {
      // 用户信息数据
      userAvatar: defaultAvatar, // 默认头像
      userName: '当前用户',
      identity: '学生',
      university: '某某大学',
      major: '计算机科学与技术',
      age: '22',
      gender: '男',
      email: 'abcd@qq.com',
      phone: '12234456678',

      // 密码修改相关
      showPasswordModal: false,
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  },
  methods: {
    // 处理头像上传
    handleAvatarUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      // 文件类型验证
      if (!file.type.match('image.*')) {
        alert('请上传图片文件')
        return
      }

      // 文件大小验证
      if (file.size > 2 * 1024 * 1024) {
        alert('头像图片不能超过2MB')
        return
      }

      // 读取文件并预览
      const reader = new FileReader()
      reader.onload = (e) => {
        this.userAvatar = e.target.result
      }
      reader.readAsDataURL(file)

      // 实际项目中，这里应该调用API上传头像到服务器
    },

    // 修改密码
    changePassword() {
      if (this.newPassword !== this.confirmPassword) {
        alert('两次输入的新密码不一致')
        return
      }

      // 这里应该调用API发送密码修改请求
      // 成功后关闭弹窗
      alert('密码修改成功')
      this.showPasswordModal = false
      this.oldPassword = ''
      this.newPassword = ''
      this.confirmPassword = ''
    }
  }
}
</script>

<style scoped>
/* 页面父容器 */
.page-container {
  display: grid;
  grid-template-rows: auto 1fr auto; /* 行轨道：头部、内容区、底部 */
  grid-template-columns: 250px 1fr; /* 改为两列布局：左固定宽度，右自适应 */
  grid-gap: 16px; /* 三栏之间的水平间距 */
  min-height: 70vh;
  margin: 0 auto; /* 关键：父容器水平居中 */
  max-width: 1200px; /* 限制最大宽度 */
  width: 100%; /* 占满父级宽度 */
  padding: 0 20px; /* 与页面边缘的距离 */
  box-sizing: border-box; /* 确保padding包含在宽度内 */
}

/* 左侧栏 - 保持原样 */
.left-sidebar {
  grid-column: 1; /* 第1列 */
  width: 250px; /* 与grid-template-columns一致 */
  background: #f0f2f5;
  padding: 16px; /* 内边距 */
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
  box-sizing: border-box; /* 关键：padding包含在宽度内 */
}

/* 右侧栏 - 整合原来的中间和右侧内容 */
.right-column {
  grid-column: 2; /* 第2列 */
  width: 100%; /* 占满剩余空间 */
  padding: 16px; /* 内边距 */
  box-sizing: border-box; /* 关键：padding包含在宽度内 */
  display: flex;
  flex-direction: column;
  gap: 24px; /* 元素之间的垂直间距 */
}

/* 个人信息头部 */
.profile-header {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

/* 头像容器 */
.avatar-container {
  position: relative;
  width: 150px;
  height: 150px;
}

/* 头像样式 */
.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%; /* 圆形头像 */
  object-fit: cover; /* 保持比例填充 */
  border: 3px solid #409EFF;
}

/* 上传按钮样式 */
.upload-button {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #409EFF;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.upload-button:hover {
  background-color: #66b1ff;
}

/* 隐藏原生文件输入框 */
.avatar-input {
  display: none;
}

/* 个人信息详情列表 */
.profile-details {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 每个详情项 */
.detail-item {
  display: flex;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

/* 标签样式 */
.detail-label {
  width: 80px;
  color: #606266;
  font-weight: 500;
}

/* 值样式 */
.detail-value {
  flex: 1;
  color: #303133;
}

/* 修改密码按钮 */
.edit-password-btn {
  background-color: transparent;
  border: 1px solid #409EFF;
  color: #409EFF;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-password-btn:hover {
  background-color: #ecf5ff;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.password-modal {
  width: 400px;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.password-modal h3 {
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #606266;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn, .confirm-btn {
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #606266;
}

.confirm-btn {
  background-color: #409EFF;
  color: white;
}

.cancel-btn:hover {
  background-color: #e4e7ed;
}

.confirm-btn:hover {
  background-color: #66b1ff;
}
</style>