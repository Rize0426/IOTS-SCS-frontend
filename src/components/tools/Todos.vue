<template>
  <div class="todos-container">
    <h2 class="todos-title">待办事项</h2>

    <!-- 加载状态 -->
    <el-skeleton v-if="loading" animated :count="3" />

    <!-- 待办列表（仅未完成项） -->
    <div v-else class="todo-list">
      <el-empty v-if="filteredTodos.length === 0" description="暂无未完成待办" />

      <el-card v-for="todo in sortedTodos" :key="todo.id" class="todo-item" shadow="hover">
        <div class="todo-content">
          <!-- 类型标签（作业/考试） -->
          <el-tag size="small" :type="todo.type === 'homework' ? 'primary' : 'danger'">
            {{ todo.type === 'assignment' ? '作业' : '考试' }}
          </el-tag>

          <!-- 可跳转的标题（关键修改点） -->
          <router-link :to="`/course/${todo.courseId}`" class="todo-title-link">
            <span class="todo-title">{{ todo.title }}</span>
          </router-link>

          <!-- 截止时间（日期+时间） -->
          <div class="todo-deadline">
            <el-icon>
              <Clock />
            </el-icon>
            <span>{{ formatDate(todo.deadline) }}</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { Clock } from '@element-plus/icons-vue'
import axios from 'axios'
import { customFetch } from '@/api/customFetch'
export default {
  components: { Clock },
  data() {
    return {
      loading: true,
      todos: [], // 原始待办数据
      /*apiTodos: [ // 模拟接口数据（含类型、状态和课程ID）
        {
          id: 1,
          title: '前端作业（HTML+CSS）',
          type: 'homework', // 作业
          completed: false, // 未完成
          deadline: '2024-07-15 23:59',
          courseId: 101 // 关联课程ID（假设课程101的路由是/course/101）
        },
        {
          id: 2,
          title: '数据库期中测试',
          type: 'exam', // 考试
          completed: false, // 未完成
          deadline: '2024-07-10 18:00',
          courseId: 102
        },
        {
          id: 3,
          title: '算法设计报告',
          type: 'homework',
          completed: false,
          deadline: '2024-07-20 23:59',
          courseId: 103 // 假设课程102的路由是/course/103
        }
      ]*/
    }
  },
  computed: {
    // 过滤未完成项并按截止时间排序
    filteredTodos() {
      return this.todos.filter(todo => !todo.completed)
    },
    sortedTodos() {
      return [...this.filteredTodos].sort((a, b) => {
        return new Date(a.deadline) - new Date(b.deadline)
      })
    }
  },
  async mounted() {
    await this.fetchTodos()
  },
  methods: {
    // 模拟接口调用（后续替换真实接口）
    async fetchTodos() {
      try {
        this.loading = true
        // 真实接口：axios.get('/api/student/todos')
        /*await new Promise(resolve => setTimeout(resolve, 800))
        this.todos = this.apiTodos // 赋值模拟数据*/
        const response = await customFetch('/api/assignments/todo')
        const data = await response.json()
        if (data.data) {
          this.todos = data.data.map((item) => {
            const res = {
              id: item.id,
              title: item.title,
              type: item.type,
              completed: false,
              deadline: item.endTime,
              courseId: item.courseId
            }
            return res
          })
        }
        const response2 = await customFetch('/api/exams/todo')
        const data2 = await response2.json()
        if (data2.data) {
          this.todos = [...this.todos, ...data2.data.map((item) => {
            const res = {
              id: item.id,
              title: item.title,
              type: item.type,
              completed: false,
              deadline: item.endTime,
              courseId: item.courseId
            }
            return res
          })]
        }
      } catch (error) {
        console.error('获取待办失败:', error)
        this.$message.error('获取待办事项失败')
      } finally {
        this.loading = false
      }
    },

    // 格式化日期（日期+时间）
    formatDate(dateStr) {
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }
  }
}
</script>

<style scoped>
.todos-container {
  margin: 0;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-width: 100%;
}

.todos-title {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.todo-list {
  gap: 12px;
  max-height: 200px;
  /* 限制最大高度（可根据需求调整） */
  overflow-y: auto;
  /* 超出部分垂直滚动 */
  overflow-x: hidden;
  /* 隐藏水平滚动条 */
  padding-right: 5px;
  /* 防止滚动条遮挡内容 */
}

.todo-item {
  width: 100%;
  background: #f9f9f9;
  border-radius: 6px;
}

.todo-content {
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.todo-title-link {
  color: #409EFF;
  /* Element UI 主色（与标签颜色统一） */
  text-decoration: none;
  /* 去掉下划线 */
  font-size: 16px;
  font-weight: 500;
  flex: 1;
  transition: color 0.2s ease;
}

.todo-title-link:hover {
  color: #66b1ff;
  /* 悬停颜色加深 */
  text-decoration: underline;
  /* 悬停下划线（可选） */
}

.todo-title {
  /* 标题文本样式（与链接继承） */
}

.todo-deadline {
  color: #606266;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>