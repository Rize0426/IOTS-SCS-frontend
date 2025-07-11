<template>
  <div class="messaging-dashboard">
    <!-- 顶部导航栏 -->
    <div class="dashboard-header">
      <h1>消息中心</h1>
      <div class="discussion-button">
        <el-button type="primary" @click="goToDiscussionForum">
          <el-icon><ChatLineRound /></el-icon> 学习讨论区
        </el-button>
      </div>
    </div>

    <!-- 主体内容区 -->
    <div class="dashboard-content">
      <!-- 左侧联系人列表 -->
      <div class="contacts-panel">
        <div class="search-bar">
          <el-input
              v-model="searchQuery"
              placeholder="搜索联系人..."
              prefix-icon="Search"
          />
        </div>

        <div class="contacts-list">
          <!-- 无联系人状态 -->
          <div v-if="contacts.length === 0" class="no-contacts">
            <el-empty description="暂无联系人">
              <template #description>
                <p>您还没有添加任何联系人。</p>
              </template>
            </el-empty>
          </div>

          <!-- 联系人列表（保留原模拟数据结构） -->
          <div
              v-for="contact in contacts"
              :key="contact.id"
              class="contact-item"
              :class="{ 'active': currentContact?.id === contact.id }"
              @click="openChat(contact)"
          >
            <div class="contact-avatar">
              <el-avatar
                  :src="contact.avatar"
                  :size="40"
                  @error="handleContactAvatarError($event)"
              >
                {{ contact.name.substring(0, 1).toUpperCase() }}
              </el-avatar>
            </div>

            <div class="contact-main">
              <div class="contact-name">{{ contact.name }}</div>
              <div class="contact-last-msg">
                {{ contact.lastMessage?.content || '暂无消息' }}
              </div>
            </div>

            <div class="contact-meta">
              <div class="contact-time">
                {{ formatTime(contact.lastMessage?.timestamp) }}
              </div>
              <div v-if="contact.unreadCount" class="unread-badge">
                {{ contact.unreadCount }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧聊天区域 -->
      <div class="chat-panel" v-if="currentContact">
        <div class="chat-header">
          <div class="contact-info">
            <h3>{{ currentContact.name }}</h3>
          </div>
          <div class="header-actions">
            <el-dropdown @command="handleCommand">
              <el-icon><MoreFilled /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="block">屏蔽用户</el-dropdown-item>
                  <el-dropdown-item command="report">举报用户</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div class="message-history" ref="messageContainer">
          <!-- 无聊天记录状态 -->
          <div v-if="currentMessages.length === 0" class="no-messages">
            <el-empty description="暂无聊天记录">
              <template #description>
                <p>从左侧选择联系人开始聊天。</p>
              </template>
            </el-empty>
          </div>

          <!-- 按时间分组的消息（保留原模拟数据结构） -->
          <template v-else>
            <div
                v-for="(group, groupIndex) in groupedMessages"
                :key="groupIndex"
                class="message-group"
            >
              <!-- 时间标题 -->
              <div class="time-group">
                {{ formatGroupTime(group.timestamp) }}
              </div>

              <!-- 该时间组的消息 -->
              <div
                  v-for="(msg, msgIndex) in group.messages"
                  :key="`${groupIndex}-${msgIndex}`"
                  class="message-wrapper"
                  :class="{ 'own-message': msg.senderId === currentUser.id }"
              >
                <!-- 对方消息：显示头像+名称 -->
                <div v-if="msg.senderId !== currentUser.id" class="message-sender-info">
                  <el-avatar
                      :src="msg.avatar || DEFAULT_AVATAR"
                      size="small"
                      @error="handleMessageAvatarError($event, msg)"
                  />
                  <span class="sender-name">{{ msg.senderName }}</span>
                </div>

                <!-- 消息气泡（自适应高度） -->
                <div class="message-bubble-container">
                  <div class="message-bubble" :class="{'my-bubble': msg.senderId === currentUser.id}">
                    {{ msg.content }}
                    <div class="message-time-row">
                      <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
                      <div class="read-status" :class="{'read': msg.isRead, 'unread': !msg.isRead}">
                        {{ msg.isRead ? '已读' : '未读' }}
                      </div>
                    </div>
                  </div>
                  <!-- 未读状态小红点 -->
                  <span
                      v-if="msg.receiverId === currentContact.id && !msg.isRead"
                      class="unread-dot"
                  ></span>
                </div>

                <!-- 自己消息：显示头像（右侧） -->
                <div v-if="msg.senderId === currentUser.id" class="message-sender-info own-avatar">
                  <el-avatar :src="currentUser.avatar" size="small" @error="handleSelfAvatarError($event)" />
                </div>
              </div>
            </div>
            <!-- 输入框区域（固定高度） -->
            <div class="message-input">
              <el-input v-model="newMessage" placeholder="输入消息..." :disabled="sendingMessage"
                @keyup.enter.prevent="sendMessage" type="textarea" :rows="2" autosize :maxlength="500"
                class="fixed-height-input" />
              <el-button type="primary" @click="sendMessage" :loading="sendingMessage" class="send-btn">
                发送
              </el-button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ChatLineRound, MoreFilled } from '@element-plus/icons-vue';
import dayjs from 'dayjs'; // 需要安装dayjs（npm install dayjs）
import relativeTime from 'dayjs/plugin/relativeTime'; // 相对时间插件
import 'dayjs/locale/zh-cn'; // 中文语言包

// 注册dayjs插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// ------------------------------
// API调用（保持原模拟数据逻辑）
// ------------------------------
import {
  getContacts,
  getChatMessages,
  sendMessage as apiSendMessage,
  markMessageAsRead,
  blockContact,
  reportContact
} from '@/api/chat';
import { useUserStore } from '@/stores/auth';

// ------------------------------
// 状态定义（保留原模拟数据结构）
// ------------------------------
const userStore = useUserStore()

const router = useRouter();
const messageContainer = ref(null);
const newMessage = ref('');
const searchQuery = ref('');
const contacts = ref([]); // 保留原联系人结构
const currentContact = ref(null);
const currentMessages = ref([]); // 保留原聊天记录结构
const sendingMessage = ref(false);
const currentUser = ref({
  id: userStore.userInfo.uid,
  name: userStore.userInfo.account,
  avatar: userStore.userInfo.avatar_url, // 自己的头像
  online: true
});

// 默认头像（用于加载失败时）
const DEFAULT_AVATAR = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png';

// ------------------------------
// 时间格式化方法（优化）
// ------------------------------
// 格式化单条消息时间（带相对时间）
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = dayjs(timestamp);
  const now = dayjs();

  // 今天内的消息显示"HH:mm"
  if (date.isSame(now, 'day')) {
    return date.format('HH:mm');
  }

  // 昨天的消息显示"昨天 HH:mm"
  if (date.isSame(now.subtract(1, 'day'), 'day')) {
    return `昨天 ${date.format('HH:mm')}`;
  }

  // 3天内的消息显示"MM-DD HH:mm"
  if (date.isAfter(now.subtract(3, 'day'))) {
    return date.format('MM-DD HH:mm');
  }

  // 更早的消息显示完整日期
  return date.format('YYYY-MM-DD HH:mm');
};

// 格式化时间组标题（如"今天 14:00"）
const formatGroupTime = (timestamp) => {
  if (!timestamp) return '';
  const date = dayjs(timestamp);
  const now = dayjs();

  // 同一天显示"今天 HH:mm"
  if (date.isSame(now, 'day')) {
    return `今天 ${date.format('HH:mm')}`;
  }

  // 昨天显示"昨天 HH:mm"
  const yesterday = now.subtract(1, 'day');
  if (date.isSame(yesterday, 'day')) {
    return `昨天 ${date.format('HH:mm')}`;
  }

  // 其他日期显示"MM-DD HH:mm"
  return date.format('MM-DD HH:mm');
};

// ------------------------------
// 消息分组逻辑（保留原逻辑）
// ------------------------------
const groupedMessages = computed(() => {
  if (!currentMessages.value.length) return [];

  // 克隆消息数组并排序（按时间戳升序）
  const sortedMessages = [...currentMessages.value].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  const groups = [];
  let currentGroup = {
    timestamp: sortedMessages[0].timestamp,
    messages: [sortedMessages[0]]
  };

  for (let i = 1; i < sortedMessages.length; i++) {
    const msg = sortedMessages[i];
    // 如果当前消息时间与当前组时间差超过1小时，创建新组
    if (msg.timestamp - currentGroup.timestamp > 3600000) {
      groups.push(currentGroup);
      currentGroup = {
        timestamp: msg.timestamp,
        messages: [msg]
      };
    } else {
      currentGroup.messages.push(msg);
    }
  }
  groups.push(currentGroup); // 添加最后一组

  return groups;
});

// ------------------------------
// 初始化逻辑（保留原模拟数据加载）
// ------------------------------
const initialize = async () => {
  try {
    const res = await getContacts();
    contacts.value = res.data.map(contact => ({
      ...contact,
      unreadCount: contact.messages?.filter(msg => !msg.isRead).length || 0
    }));

    // 默认选中第一个联系人
    if (contacts.value.length > 0) {
      await openChat(contacts.value[0]);
    }
  } catch (error) {
    console.error('初始化失败:', error);
    ElMessage.error('加载联系人失败，请刷新重试');
  }
};

// ------------------------------
// 打开聊天（修改：添加消息已读处理）
// ------------------------------
const openChat = async (contact) => {
  currentContact.value = contact;
  currentMessages.value = []; // 清空之前的消息
  sendingMessage.value = false; // 重置发送状态

  try {
    // 加载该联系人的聊天记录（使用原模拟数据结构）
    const res = await getChatMessages(contact.id);
    currentMessages.value = res.data.map(msg => ({
      ...msg
    }));

    // 标记当前聊天窗口中对方发送的消息为已读
    const unreadMessages = currentMessages.value.filter(
      msg => msg.senderId !== currentUser.value.id && !msg.isRead
    );

    // 更新未读计数
    if (unreadMessages.length > 0) {
      contact.unreadCount = unreadMessages.length;
      // 调用API将消息标记为已读
      unreadMessages.forEach(msg => {
        markMessageAsRead(msg.id);
      });
    }

    // 更新联系人最后一条消息状态
    if (contact.lastMessage) {
      const latestMessage = currentMessages.value.find(
        msg => msg.id === contact.lastMessage.id
      );
      if (latestMessage) {
        contact.lastMessage.isRead = latestMessage.isRead;
      }
    }

    // 等待DOM更新后滚动到底部
    nextTick(() => {
      if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
      }
    });
  } catch (error) {
    console.error('加载聊天记录失败:', error);
    ElMessage.error('加载聊天记录失败');
  }
};

// ------------------------------
// 发送消息（修改：设置初始已读状态）
// ------------------------------
const sendMessage = async () => {
  if (!newMessage.value.trim() || !currentContact.value) return;
  sendingMessage.value = true;

  const messageData = {
    sender_id: currentUser.value.id,
    receiver_id: currentContact.value.partnerId,
    content: newMessage.value,
    type: "TEXT",
    conversation_id: currentContact.value.id,
  };

  try {
    // 发送消息到后端（模拟数据保持不变）
    const res = await apiSendMessage(messageData);

    // 添加到本地消息列表（保留原模拟数据结构）
    currentMessages.value.push({
      ...res.data,
      isRead: true // 自己发送的消息设为已读
    });

    // 更新最后一条消息
    currentContact.value.lastMessage = {
      content: newMessage.value,
      timestamp: res.data.timestamp,
      isRead: true // 自己发送的消息设为已读
    };

    // 清空输入框
    newMessage.value = '';

    // 等待DOM更新后滚动到底部
    nextTick(() => {
      if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
      }
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    ElMessage.error('消息发送失败，请重试');
  } finally {
    sendingMessage.value = false;
  }
};

// ------------------------------
// 头像加载失败处理
// ------------------------------
// 联系人头像加载失败
const handleContactAvatarError = (event) => {
  event.target.src = DEFAULT_AVATAR; // 替换为默认头像
};

// 消息头像加载失败（对方）
const handleMessageAvatarError = (event, msg) => {
  // 可以记录错误或上报日志
  console.error(`头像加载失败（${msg.senderName}）:`, event);
  event.target.src = DEFAULT_AVATAR; // 替换为默认头像
};

// 自己头像加载失败
const handleSelfAvatarError = (event) => {
  console.error('自己头像加载失败:', event);
  event.target.src = DEFAULT_AVATAR; // 替换为默认头像
};

// ------------------------------
// 其他方法（保留原逻辑）
// ------------------------------
const handleCommand = async (command) => {
  if (!currentContact.value) return;

  try {
    if (command === 'block') {
      await blockContact(currentContact.value.id);
      ElMessage.success('已屏蔽该用户');
      // 从联系人列表中移除（或标记为屏蔽）
      contacts.value = contacts.value.filter(c => c.id !== currentContact.value.id);
      currentContact.value = null;
    } else if (command === 'report') {
      await reportContact(currentContact.value.id, '骚扰消息');
      ElMessage.success('已举报该用户');
    }
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败，请重试');
  }
};

const goToDiscussionForum = () => {
  router.push('/forum');
};

// 搜索联系人（保留原逻辑）
const searchContacts = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return contacts.value.filter(contact =>
    contact.name.toLowerCase().includes(query)
  );
});

// 组件挂载时初始化
onMounted(() => {
  initialize();
});
</script>

<style scoped lang="scss">
.messaging-dashboard {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #f5f7fa;

  .dashboard-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 16px 24px;
    background-color: #ffffff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    border-bottom: 1px solid #ebeef5;
    margin-left: 400px;

    h1 {
      font-size: 20px;
      margin: 0;
      color: #303133;
    }

    .discussion-button {
      margin-left: 50px;
    }

  }

  .dashboard-content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  // 左侧联系人面板（保留原样式）
  .contacts-panel {
    width: 240px;
    border-right: 1px solid #ebeef5;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    margin-left: 400px;


    .search-bar {
      padding: 16px;
      border-bottom: 1px solid #ebeef5;

      .el-input {
        width: 100%;

        :deep(.el-input__inner) {
          border-radius: 20px;
          padding-left: 40px;
        }

        :deep(.el-icon-search) {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
        }
      }
    }

    .contacts-list {
      flex: 1;
      overflow-y: auto;

      .contact-item {
        display: flex;
        padding: 16px;
        cursor: pointer;
        border-bottom: 1px solid #f2f2f2;
        transition: background-color 0.2s;
        position: relative; // 新增：作为小红点的定位基准

        &:hover {
          background-color: #f9fafc;
        }

        &.active {
          background-color: #ecf5ff;

          .contact-name {
            color: #409eff;
            font-weight: bold;
          }
        }

        .contact-avatar {
          margin-right: 16px;
        }

        .contact-main {
          flex: 1;
          min-width: 0;

          .contact-name {
            font-weight: 500;
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .contact-last-msg {
            font-size: 13px;
            color: #909399;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .contact-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-between;
          min-width: 70px;

          .contact-time {
            font-size: 12px;
            color: #909399;
          }

          .unread-badge {
            position: absolute; // 关键：相对于 .contact-item 定位
            top: 16px; // 距离联系人项顶部 16px（根据内边距调整）
            right: 16px; // 距离联系人项右侧 16px
            min-width: auto; // 移除原 min-width
            padding: 0 6px;
          }
        }
      }

      .no-contacts {
        padding: 32px;
        display: flex;
        justify-content: center;
      }
    }
  }

  // 右侧聊天面板（核心样式调整）
  .chat-panel {
    width: 600px;
    height: 600px;
    display: flex;
    flex-direction: column;

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background-color: #ffffff;
      border-bottom: 1px solid #ebeef5;

      .contact-info {
        display: flex;
        align-items: center;

        h3 {
          margin: 0 0 0 10px;
          font-size: 16px;
        }

        .status {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 10px;
          background-color: #909399;
          color: white;

          &.online {
            background-color: #67c23a;
          }
        }
      }

      .header-actions {
        display: flex;
        gap: 10px;
      }
    }

    .message-history {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background-color: #f7f8fa;

      .no-messages {
        padding: 64px 24px;
        display: flex;
        justify-content: center;
      }

      .message-group {
        margin-bottom: 24px; // 组间间距

        .time-group {
          font-size: 12px;
          color: #909399;
          margin-bottom: 8px;
          padding-left: 8px;
          border-left: 2px solid #ebeef5;
        }

        .message-wrapper {
          display: flex;
          align-items: flex-start;
          max-width: 100%;
          gap: 8px; // 头像与消息气泡间距

          // 对方消息：靠左
          &:not(.own-message) {
            justify-content: flex-start;
          }

          // 自己消息：靠右
          &.own-message {
            justify-content: flex-end;
          }

          .message-sender-info {
            display: flex;
            align-items: center;
            flex-shrink: 0;

            .sender-name {
              font-size: 12px;
              color: #606266;
              margin-left: 4px; // 头像与名称间距
            }
          }

          .message-bubble-container {
            max-width: 70%; // 消息最大宽度（桌面端）
            flex-grow: 1;
            margin-bottom: 15px;

            .message-bubble {
              padding: 12px 16px;
              border-radius: 12px;
              background-color: #edf0f3; // 默认背景色（可自定义）
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
              position: relative;
              word-break: break-word;
              line-height: 1.5;
              white-space: pre-wrap; // 保留换行符
              min-height: 40px; // 最小高度（避免空消息时塌陷）
              max-height: none; // 移除原 max-height 限制
              overflow-y: visible; // 内容过多时自然撑开父容器

              &::-webkit-scrollbar {
                width: 6px;
              }

              &::-webkit-scrollbar-thumb {
                background-color: #e4e7ed;
                border-radius: 3px;
              }

              // 自定义气泡颜色
              &.my-bubble {
                background-color: #79ace3;
                color: white;
              }

              .message-time-row {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                margin-top: 4px;
                font-size: 11px; // 与时间字体大小一致

                .message-time {
                  color: #0a0a0a;
                  margin-right: 8px;
                }

                .read-status {
                  padding: 0 4px;
                  border-radius: 4px;
                  white-space: nowrap;

                  &.read {
                    color: #67c23a; // 已读为绿色
                  }

                  &.unread {
                    color: #673ac2; // 未读为红色
                  }
                }
              }
            }

            // 未读状态小红点
            .unread-dot {
              position: relative;
              top: 8px;
              right: 8px;
              width: 8px;
              height: 8px;
              background-color: #f56c6c;
              border-radius: 50%;
            }
          }
        }
      }
    }

    .message-input {
      display: flex;
      padding: 16px;
      background-color: #ffffff;
      border-top: 1px solid #ebeef5;

      .el-input {
        margin-right: 10px;
        flex-grow: 1;

        :deep(.el-textarea__inner) {
          border-radius: 20px;
          resize: none; // 禁止手动调整大小
        }
      }

      .el-button {
        align-self: flex-end;
      }
    }
  }
}
</style>