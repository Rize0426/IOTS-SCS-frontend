<template>
  <div class="notification-bar">
    <!-- 标题区域 -->
    <div class="notification-header">
      <h2>重要通知</h2>
      <!-- 暂时隐藏的三个按钮 -->
      <!--
      <div class="operation-buttons">
        <el-button type="primary" @click="toggleWriteMode" :class="{ active: writeMode }">写入</el-button>
        <el-button type="warning" @click="toggleEditMode" :class="{ active: editMode }">编辑</el-button>
        <el-button type="danger" @click="toggleDeleteMode" :class="{ active: deleteMode }">删除</el-button>
      </div>
      -->
    </div>

    <!-- 通知列表区域 -->
    <div class="notification-list">
      <el-empty v-if="filteredNotices.length === 0" description="暂无通知"></el-empty>

      <div
          v-for="(notice, index) in filteredNotices"
          :key="notice.id"
          class="notice-item"
          @click="showDetail(notice)"
      >
        <div class="notice-content">
          <div class="notice-title">{{ notice.title }}</div>
          <div class="notice-time">{{ notice.time }}</div>
        </div>

        <!-- 动态显示的操作按钮 -->
        <div class="item-actions">
          <el-button
              v-if="editMode"
              type="primary"
              size="small"
              @click.stop="openEditDialog(notice)"
          >编辑</el-button>

          <el-button
              v-if="deleteMode"
              type="danger"
              size="small"
              @click.stop="confirmDelete(notice.id)"
          >删除</el-button>
        </div>
      </div>
    </div>

    <!-- 通知详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="通知详情" width="500px">
      <template v-if="selectedNotice">
        <div class="detail-item">
          <span class="label">标题：</span>
          <span>{{ selectedNotice.title }}</span>
        </div>
        <div class="detail-item">
          <span class="label">内容：</span>
          <span>{{ selectedNotice.content }}</span>
        </div>
        <div class="detail-item">
          <span class="label">通知人：</span>
          <span>{{ selectedNotice.notifier }}</span>
        </div>
        <div class="detail-item">
          <span class="label">通知对象：</span>
          <span>{{ selectedNotice.target }}</span>
        </div>
        <div class="detail-item">
          <span class="label">发布时间：</span>
          <span>{{ selectedNotice.formattedTime }}</span>
        </div>
      </template>
    </el-dialog>

    <!-- 通知编辑对话框 -->
    <el-dialog v-model="writeDialogVisible" :title="isEditMode ? '编辑通知' : '编写通知'" width="500px">
      <el-form :model="editingNotice" :rules="formRules" ref="noticeForm" label-width="100px">
        <el-form-item label="通知标题" prop="title">
          <el-input v-model="editingNotice.title" placeholder="请输入通知标题"></el-input>
        </el-form-item>

        <el-form-item label="通知内容" prop="content">
          <el-input
              v-model="editingNotice.content"
              type="textarea"
              :rows="4"
              placeholder="请输入通知内容"
          ></el-input>
        </el-form-item>

        <el-form-item label="通知人" prop="notifier">
          <el-input v-model="editingNotice.notifier" placeholder="请输入通知人"></el-input>
        </el-form-item>

        <el-form-item label="通知对象" prop="target">
          <el-radio-group v-model="editingNotice.target">
            <el-radio label="学生">学生</el-radio>
            <el-radio label="老师">老师</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="通知日期" prop="date">
          <el-date-picker
              v-model="editingNotice.date"
              type="datetime"
              placeholder="选择通知发布日期"
              format="YYYY-MM-DD HH:mm"
          ></el-date-picker>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <!-- 按钮位置对调：确认在左，取消在右 -->
          <el-button type="primary" @click="submitNotice">确认</el-button>
          <el-button @click="writeDialogVisible = false">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from "axios";

// 通知数据
const notices = ref([
  {
    id: 1,
    title: '期末考试时间调整',
    content: '原定于7月10日的期末考试调整为7月15日，请同学们做好准备。',
    notifier: '教务处',
    target: '学生',
    date: new Date('2024-06-10 10:00')
  },
  {
    id: 2,
    title: '新课程《前端框架》上线',
    content: '本学期新增《前端框架》课程，由张教授主讲，请同学们按时上课。',
    notifier: '教务处',
    target: '学生',
    date: new Date('2024-06-08 14:30')
  }
])

// 控制各种模式的状态
const writeMode = ref(false)    // 写入模式
const editMode = ref(false)     // 编辑模式
const deleteMode = ref(false)   // 删除模式
const isEditMode = ref(false)   // 是否为编辑模式

// 控制编辑对话框
const writeDialogVisible = ref(false)
// 控制详情对话框
const detailDialogVisible = ref(false)

// 当前正在编辑的通知（使用reactive确保响应式）
const editingNotice = reactive({
  id: null,
  title: '',
  content: '',
  notifier: '',
  target: '学生',
  date: new Date()
})

// 当前选中的通知（用于显示详情）
const selectedNotice = ref(null)

// 表单验证规则
const formRules = {
  title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }],
  notifier: [{ required: true, message: '请输入通知人', trigger: 'blur' }],
  target: [{ required: true, message: '请选择通知对象', trigger: 'change' }],
  date: [{ required: true, message: '请选择通知日期', trigger: 'change' }]
}

// 为表单添加引用
const noticeForm = ref(null)

// 过滤后的通知列表（添加格式化时间）
const filteredNotices = computed(() => {
  return notices.value.map(notice => ({
    ...notice,
    formattedTime: new Date(notice.date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }))
})

async function loadNotice() {
  const res = await axios.get('/api/notices/list').then(res => res);
  notices.value = res.data;
}

// 切换写入模式（修复：确保打开写入对话框并重置编辑对象）
const toggleWriteMode = () => {
  writeMode.value = !writeMode.value
  editMode.value = false   // 关闭其他模式
  deleteMode.value = false
  isEditMode.value = false

  // 重置编辑对象（关键！避免残留旧数据）
  Object.assign(editingNotice, {
    id: null,
    title: '',
    content: '',
    notifier: '',
    target: '学生',
    date: new Date()
  })

  // 打开写入对话框
  if (writeMode.value) {
    writeDialogVisible.value = true
  } else {
    writeDialogVisible.value = false
  }
}

// 切换编辑模式（修复：不再自动打开第一条通知的编辑对话框）
const toggleEditMode = () => {
  editMode.value = !editMode.value
  writeMode.value = false  // 关闭其他模式
  deleteMode.value = false

  // 如果关闭编辑模式，关闭对话框
  if (!editMode.value) {
    writeDialogVisible.value = false
  }
}

// 切换删除模式
const toggleDeleteMode = () => {
  deleteMode.value = !deleteMode.value
  writeMode.value = false  // 关闭其他模式
  editMode.value = false
}

// 打开编辑对话框（修改通知）
const openEditDialog = (currentNotice) => {
  // 重置编辑对象（关键：绑定原通知的所有属性）
  Object.assign(editingNotice, {
    id: currentNotice.id,       // 原通知ID
    title: currentNotice.title, // 原标题
    content: currentNotice.content, // 原内容
    notifier: currentNotice.notifier, // 原通知人
    target: currentNotice.target, // 原通知对象
    date: new Date(currentNotice.date) // 深拷贝原日期
  });
  editMode.value = true;
  writeDialogVisible.value = true;
};

// 提交通知（新增或编辑）
const submitNotice = async () => {
  if (!noticeForm.value) return

  await noticeForm.value.validate(async (valid) => {
    if (valid) {
      // 格式化日期
      const formattedDate = new Date(editingNotice.date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })

      if (isEditMode.value) {
        // 更新现有通知（关键：通过id定位原通知）
        const index = notices.value.findIndex(n => n.id === editingNotice.id)
        if (index !== -1) {
          notices.value[index] = {
            ...editingNotice,
            formattedTime: formattedDate
          }
          ElMessage.success('通知更新成功')
        } else {
          // 如果未找到原通知（理论上不会发生），则添加新通知
          notices.value.unshift({
            ...editingNotice,
            formattedTime: formattedDate
          })
          ElMessage.warning('未找到原通知，已作为新通知发布')
        }
      } else {
        // 添加新通知（关键：生成唯一ID）
        editingNotice.id = Date.now() // 临时ID
        notices.value.unshift({
          ...editingNotice,
          formattedTime: formattedDate
        })
        ElMessage.success('通知发布成功')
      }

      // 关闭对话框
      writeDialogVisible.value = false
    } else {
      ElMessage.warning('请填写完整的通知信息')
      return false
    }
  })
}

// 确认删除通知
const confirmDelete = (id) => {
  ElMessageBox.confirm('确定要删除这条通知吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 删除通知
    notices.value = notices.value.filter(notice => notice.id !== id)
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
    ElMessage.info('已取消删除')
  })
}

// 显示通知详情
const showDetail = (notice) => {
  selectedNotice.value = notice
  detailDialogVisible.value = true
}
</script>

<style scoped>
.notification-bar {
  margin: 0 0 15px 0;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 100%; /* 填满父容器宽度 */
  box-sizing: border-box; /* 让padding和border包含在总宽度内 */
  max-width: 600px; /* 限制最大宽度为600px */
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.notification-header h2 {
  margin: 0;
  color: #333;
  font-size: 22px;
}

.operation-buttons {
  display: flex;
  margin-left: auto;
  gap: 5px;
}

/* 按钮激活状态样式 */
.operation-buttons .el-button.active {
  background-color: #ecf5ff;
  border-color: #d9ecff;
  color: #409EFF;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.notice-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
  border-left: 4px solid #409EFF;
  width: 100%;
  cursor: pointer; /* 添加鼠标指针样式，表明可点击 */
  transition: background-color 0.2s; /* 添加过渡效果 */
}

.notice-item:hover {
  background-color: #f0f0f0; /* 鼠标悬停时的背景色 */
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-weight: bold;
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.notice-time {
  font-size: 14px;
  color: #999;
}

/* 操作按钮样式 */
.item-actions {
  display: flex;
  gap: 5px;
}

/* 自定义空状态样式 */
:deep(.el-empty) {
  margin: 20px 0;
}

/* 详情对话框样式 */
.detail-item {
  margin-bottom: 10px;
}

.label {
  font-weight: bold;
  margin-right: 8px;
  color: #666;
}
</style>