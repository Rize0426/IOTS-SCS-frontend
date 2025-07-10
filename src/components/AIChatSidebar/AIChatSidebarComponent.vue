<template>
  <button class="floating-button" v-if="!aiChatVisible && isButtonShow" @click="showAIChat" :style="{
    left: `${x}px`,
    top: `${y}px`,
    opacity: isDragging ? 0.8 : 1 // 拖动时半透明
  }" @mousedown="startDrag" @mouseup="endDrag" @mouseleave="endDrag" @mousemove="handleDrag" @touchstart="startDrag"
    @touchend="endDrag" @touchmove="handleDrag">AI</button>
  <!-- 聊天侧边栏组件 -->
  <teleport to="body" v-if="aiChatVisible">
    <div class="chat-sidebar-overlay" @click="handleOverlayClick">
      <transition name="slide-right">
        <div class="chat-sidebar-container" @click.stop>
          <!-- 聊天头部 -->
          <div class="chat-header">
            <div class="header-left">
              <el-button type="text" @click="showHistory" class="history-btn">
                <el-icon>
                  <Clock />
                </el-icon>
                <span class="ml-1">历史</span>
              </el-button>
              <el-divider direction="vertical" />
              <h3 class="chat-title">AI 助手</h3>
            </div>
            <div class="header-right">
              <el-button type="text" @click="closeSidebar" class="close-btn">
                <el-icon>
                  <Close />
                </el-icon>
              </el-button>
            </div>
          </div>

          <!-- 聊天消息区域 -->
          <el-scrollbar class="messages-container" ref="messagesScrollbar">
            <div class="messages-list">
              <div v-for="message in messages" :key="message.id" :class="['message-item', message.role]">
                <div class="message-avatar" v-if="message.content" >
                  <el-avatar :size="32"
                    :src="message.role === 'user' ? '/placeholder.svg?height=32&width=32' : undefined"
                    :style="message.role === 'assistant' ? 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : ''">
                    <el-icon v-if="message.role === 'assistant'">
                      <Robot />
                    </el-icon>
                  </el-avatar>
                </div>

                <div class="message-content" v-if="message.content">
                  <div class="message-header">
                    <span class="sender-name">{{ message.role === 'user' ? '你' : 'AI' }}</span>
                    <span class="message-time">{{ formatDateTime(message.createAt) }}</span>
                  </div>

                  <div class="message-body"  v-if="message.content">
                    <div v-if="message.content" class="message-text" v-html="message.content"></div>

                    <!-- 图片显示 -->
                    <div v-if="message.images && message.images.length" class="message-images">
                      <el-image v-for="(image, index) in message.images" :key="index" :src="image.url" :alt="image.name"
                        class="message-image" fit="cover" :preview-src-list="message.images.map(img => img.url)" />
                    </div>

                    <!-- 文件显示 -->
                    <div v-if="message.files && message.files.length" class="message-files">
                      <div v-for="(file, index) in message.files" :key="index" class="file-item">
                        <el-icon class="file-icon">
                          <Document />
                        </el-icon>
                        <span class="file-name">{{ file.name }}</span>
                        <span class="file-size">({{ formatFileSize(file.size) }})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 加载状态 -->
              <div v-if="isLoading" class="message-item assistant">
                <div class="message-avatar">
                  <el-avatar :size="32" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                    <el-icon></el-icon>
                  </el-avatar>
                </div>
                <div class="message-content">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </el-scrollbar>

          <!-- 输入区域 -->
          <div class="input-area">
            <!-- 文件预览区域 -->
            <div v-if="uploadedFiles.length || uploadedImages.length" class="file-preview-area">
              <!-- 图片预览 -->
              <div v-if="uploadedImages.length" class="preview-images">
                <div v-for="(image, index) in uploadedImages" :key="'img-' + index" class="preview-item image-preview">
                  <el-image :src="image.url" class="preview-image" fit="cover" v-loading="image.file && currentUploadImages.includes(image.file)" />
                  <el-button type="danger" size="small" circle class="remove-btn" @click="removeImage(index)">
                    <el-icon>
                      <Close />
                    </el-icon>
                  </el-button>
                </div>
              </div>

              <!-- 文件预览 -->
              <div v-if="uploadedFiles.length" class="preview-files">
                <div v-for="(file, index) in uploadedFiles" :key="'file-' + index" class="preview-item file-preview">
                  <el-icon class="file-icon" v-loading="file.file && currentUploadFiles.includes(file.file)">
                    <Document />
                  </el-icon>
                  <span class="file-name">{{ file.name }}</span>
                  <el-button type="danger" size="small" circle class="remove-btn" @click="removeFile(index)">
                    <el-icon>
                      <Close />
                    </el-icon>
                  </el-button>
                </div>
              </div>
            </div>

            <div class="input-controls">
              <div class="input-wrapper">
                <el-input v-model="inputMessage" type="textarea" :rows="1" :autosize="{ minRows: 1, maxRows: 3 }"
                  placeholder="输入消息..." class="message-input" @keydown.enter.exact.prevent="sendMessage"
                  @keydown.enter.shift.exact="handleShiftEnter" />

                <div class="input-actions">
                  <!-- 图片上传 -->
                  <el-upload :show-file-list="false" :before-upload="handleImageUpload" accept="image/*" multiple>
                    <el-button type="text" class="action-btn">
                      <el-icon>
                        <Picture />
                      </el-icon>
                    </el-button>
                  </el-upload>

                  <!-- 文件上传 -->
                  <el-upload :show-file-list="false" :before-upload="handleFileUpload" multiple>
                    <el-button type="text" class="action-btn">
                      <el-icon>
                        <Paperclip />
                      </el-icon>
                    </el-button>
                  </el-upload>

                  <!-- 发送按钮 -->
                  <el-button type="primary" :disabled="!canSend" @click="sendMessage" class="send-btn">
                    <el-icon>
                      <Promotion />
                    </el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 会话历史弹窗 -->
    <el-dialog v-model="showHistoryDialog" title="会话历史" width="400px" :before-close="handleHistoryClose"
      class="history-dialog">
      <div class="history-content">
        <div class="history-actions">
          <el-button type="primary" size="small" @click="startNewChat" class="w-full mb-4">
            <el-icon class="mr-1">
              <Plus />
            </el-icon>
            新建对话
          </el-button>
        </div>

        <el-scrollbar class="history-list" max-height="400px">
          <div class="history-section">
            <div v-for="chat in chatHistory" :key="chat.chatId"
              :class="['history-item', { active: currentChatId === chat.chatId }]" @click="selectChat(chat.chatId)">
              <div class="chat-info">
                <div class="chat-title">{{ chat.title }}</div>
                <div class="chat-time">{{ formatDateTime(chat.createTime) }}</div>
              </div>
              <el-button type="text" size="small" class="delete-btn" @click.stop="deleteChat(chat.chatId)">
                <el-icon>
                  <Delete />
                </el-icon>
              </el-button>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </el-dialog>
  </teleport>
</template>

<script setup lang="ts">
import { useAIChatSidebar, icons } from './index'
import './styles.css'

const {
  Close,
  Clock,
  Document,
  Picture,
  Paperclip,
  Promotion,
  Plus,
  Delete
} = icons

// 定义props和emits
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'close'])

// 使用从index.ts导出的逻辑
const {
  aiChatVisible,
  isButtonShow,
  showAIChat,
  inputMessage,
  messages,
  uploadedImages,
  uploadedFiles,
  isLoading,
  currentChatId,
  messagesScrollbar,
  showHistoryDialog,
  chatHistory,
  canSend,
  closeSidebar,
  handleOverlayClick,
  sendMessage,
  handleImageUpload,
  handleFileUpload,
  removeImage,
  removeFile,
  formatFileSize,
  selectChat,
  startNewChat,
  deleteChat,
  handleHistoryClose,
  handleShiftEnter,
  x,
  y,
  isDragging,
  startDrag,
  handleDrag,
  endDrag,
  showHistory,
  formatDateTime,
  currentUploadFiles,
  currentUploadImages
} = useAIChatSidebar(props, emit)
</script>