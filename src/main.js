// main.js
import './assets/base.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'  // 图标库
import 'element-plus/dist/index.css'  // Element Plus 样式
import App from './App.vue'
import router from './router'
import 'default-passive-events'  // 处理 Chrome 被动事件警告
import AIChatSidebarComponent from './components/AIChatSidebar/AIChatSidebarComponent.vue'

// 创建 Vue 应用实例
const app = createApp(App)
const pinia = createPinia();

// 全局注册 Element Plus 图标（所有图标自动注册为组件）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 挂载插件（路由、Element Plus）
app.use(pinia); // 安装Pinia
app.use(router)
app.use(ElementPlus)

// 挂载应用
app.mount('#app')

createApp(AIChatSidebarComponent).use(ElementPlus).mount('#ai-chat-sidebar')

