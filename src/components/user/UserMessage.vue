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
          <span v-if="!isEditing" class="detail-value">{{ name }}</span>
          <input v-else type="text" v-model="name" class="detail-input" />
        </div>

        <div class="detail-item">
          <span class="detail-label">身份：</span>
          <span class="detail-value">{{ role }}</span>
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
          <span v-if="!isEditing" class="detail-value">{{ age }}</span>
          <input v-else type="number" v-model.number="age" class="detail-input" />
        </div>

        <div class="detail-item">
          <span class="detail-label">性别：</span>
          <span v-if="!isEditing" class="detail-value">{{ gender }}</span>
          <select v-else v-model="gender" class="detail-input">
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>

        <div class="detail-item">
          <span class="detail-label">邮箱：</span>
          <span v-if="!isEditing" class="detail-value">{{ email }}</span>
          <input v-else type="email" v-model="email" class="detail-input" />
        </div>

        <div class="detail-item">
          <span class="detail-label">手机号：</span>
          <span v-if="!isEditing" class="detail-value">{{ phone }}</span>
          <input v-else type="tel" v-model="phone" class="detail-input" />
        </div>

        <div class="detail-item">
          <span class="detail-label">密码：</span>
          <button class="edit-password-btn" @click="showPasswordModal = true">
            修改密码
          </button>
        </div>

        <div class="action-buttons">
          <button v-if="!isEditing" class="edit-info-btn" @click="toggleEditMode">
            编辑信息
          </button>
          <template v-else>
            <button class="save-info-btn" @click="saveUserInfo">保存</button>
            <button class="cancel-edit-btn" @click="cancelEdit">取消</button>
          </template>
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
import {getUserInfo, updatePassword} from "@/api/auth.js";
import { uploadFile } from "@/api/file.js";
import { updateUserInfo } from "@/api/auth.js";

function translateRole(role) {
  switch (role) {
    case 'student': return "学生";
    case 'teacher': return "教师";
    case 'admin': return "管理员";
    default: return "未知用户";
  }
}

export default {
  components: {
    UserCenter,
    FunctionButtons
  },
  data() {
    return {
      // 用户信息数据
      userAvatar: defaultAvatar, // 默认头像
      name: '当前用户',
      role: '学生',
      university: '某某大学',
      major: '计算机科学与技术',
      age: '',
      gender: '',
      email: '',
      phone: '',
      // 存储从API获取的原始用户信息，以便后续更新时使用
      currentUserInfo: null,
      // 存储进入编辑模式前的原始数据，用于取消编辑时的恢复
      originEditableInfo: null,

      isEditing: false,

      // 密码修改相关
      showPasswordModal: false,
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  },
  async created() {
    await this.fetchUserInfo();
  },
  methods: {
    // 后端获取用户详细信息
    async fetchUserInfo() {
      try {
        const res = await getUserInfo();
        if (res.code === 200 && res.data) {
          const userInfo = res.data;
          this.currentUserInfo = userInfo;
          this.userAvatar = userInfo.avatar_url || defaultAvatar;
          this.name = userInfo.name;
          this.role = translateRole(userInfo.role);
          this.major = userInfo.major;
          this.age = userInfo.age;
          this.gender = userInfo.gender;
          this.email = userInfo.email;
          this.phone = userInfo.phone;
        } else {
          alert('获取用户信息失败: ' + res.msg);
        }
      } catch (error) {
        console.log("获取用户信息时出错: " + error)
        alert("获取用户信息错误");
      }
    },

    toggleEditMode() {
      this.isEditing = !this.isEditing;
      if (this.isEditing) {
        this.originEditableInfo = {
          name: this.name,
          age: this.age,
          gender: this.gender,
          email: this.email,
          phone: this.phone
        };
      }
    },

    async saveUserInfo() {
      const updateFields = {
        name: this.name,
        age: this.age,
        gender: this.gender,
        email: this.email,
        phone: this.phone
      }

      try {
        const res = await updateUserInfo(updateFields);
        if (res.code === 200) {
          alert("个人信息更新成功 ");
          this.isEditing = false;

          for (const key in updateFields) {
            if (updateFields.hasOwnProperty(key)) {
              this.currentUserInfo[key] = updateFields[key];
            }
          }
          localStorage.setItem('userInfo', JSON.stringify(this.currentUserInfo));
        } else {
          alert('个人信息更新失败: ' + res.msg);
        }
      } catch (error) {
        console.error('更新个人信息时出错:', error);
        alert('更新个人信息网络错误');
      }
    },

    cancelEdit() {
      //恢复进入编辑模式前的数据
      if (this.originEditableInfo) {
        this.name = this.originEditableInfo.name;
        this.age = this.originEditableInfo.age;
        this.gender = this.originEditableInfo.gender;
        this.email = this.originEditableInfo.email;
        this.phone = this.originEditableInfo.phone;
      }
      this.isEditing = false;
    },

    // 处理头像上传
    async handleAvatarUpload(event) {
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
      // uploadFile(file,userInfo.uid)
    },

    // 修改密码
    async changePassword() {
      if (this.newPassword !== this.confirmPassword) {
        alert('两次输入的新密码不一致')
        return
      }
      const updateFields = {
        oldPassword: this.oldPassword,
        newPassword: this.newPassword
      }

      try {
        console.log(updateFields);
        const res = await updatePassword(updateFields);
        if (res.code === 200) {
          alert('密码修改成功')
          this.showPasswordModal = false
          this.oldPassword = ''
          this.newPassword = ''
          this.confirmPassword = ''
        } else {
          alert("密码修改失败: " + res.msg);
        }
      } catch (error) {
        alert("密码修改错误");
        console.log("密码修改错误: " + error);
      }
    }
  }
}
</script>

<style scoped>
/* 页面父容器 */
.page-container {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 250px 1fr;
  grid-gap: 16px;
  min-height: 70vh;
  margin: 0 auto;
  max-width: 1200px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

/* 左侧栏 - 保持原样 */
.left-sidebar {
  grid-column: 1;
  width: 250px;
  background: #f0f2f5;
  padding: 16px;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
  box-sizing: border-box;
}

/* 右侧栏 - 整合原来的中间和右侧内容 */
.right-column {
  grid-column: 2;
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  border-radius: 50%;
  object-fit: cover;
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
  align-items: center; /* 垂直居中对齐 */
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
  flex-shrink: 0; /* 防止被压缩 */
}

/* 值样式 */
.detail-value {
  flex: 1;
  color: #303133;
}

/* 新增的输入框样式 */
.detail-input {
  flex: 1;
  padding: 5px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
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

/* 新增的动作按钮组样式 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.edit-info-btn, .save-info-btn, .cancel-edit-btn {
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.edit-info-btn {
  background-color: #67c23a; /* 绿色 */
  color: white;
}
.edit-info-btn:hover {
  background-color: #85ce61;
}

.save-info-btn {
  background-color: #409EFF; /* 蓝色 */
  color: white;
}
.save-info-btn:hover {
  background-color: #66b1ff;
}

.cancel-edit-btn {
  background-color: #f0f0f0; /* 灰色 */
  color: #606266;
}
.cancel-edit-btn:hover {
  background-color: #e4e7ed;
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