<template>
    <div class="knowledge-base-app">
        <!-- 创建/编辑知识库 -->
        <div class="create-page">
            <div class="create-header">
                <h2>{{ isCreate ? '创建知识库' : '编辑知识库' }}</h2>
                <el-button @click="goBack" type="default">返回</el-button>
            </div>

            <el-form :model="formData" label-width="100px" class="create-form">
                <el-form-item label="标题" required>
                    <el-input v-model="formData.title" placeholder="请输入知识库标题" size="large" />
                </el-form-item>

                <el-form-item label="标签">
                    <el-input-tag v-model="formData.tags" placeholder="请输入标签" aria-label="请输入标签后按回车键" />
                </el-form-item>

                <el-form-item label="内容" required class="content-form-item">
                    <div class="markdown-editor">
                        <div class="editor-tabs">
                            <el-radio-group v-model="editorMode" size="small">
                                <el-radio-button label="edit">编辑</el-radio-button>
                                <el-radio-button label="preview">预览</el-radio-button>
                                <el-radio-button label="split">分屏</el-radio-button>
                            </el-radio-group>
                        </div>

                        <div class="editor-container" :class="editorMode">
                            <div v-show="editorMode === 'edit' || editorMode === 'split'" class="editor-panel">
                                <el-input v-model="formData.content" type="textarea" placeholder="请输入Markdown内容..."
                                    :rows="20" resize="none" class="markdown-textarea" />
                            </div>

                            <div v-show="editorMode === 'preview' || editorMode === 'split'" class="preview-panel">
                                <div class="markdown-preview" v-html="renderedMarkdown"></div>
                            </div>
                        </div>
                    </div>
                </el-form-item>

                <el-form-item label="附件">
                    <el-upload v-model:file-list="formData.attachments" action="#" :auto-upload="false" multiple
                        class="upload-demo">
                        <el-button type="primary">
                            <el-icon>
                                <Upload />
                            </el-icon>
                            选择文件
                        </el-button>
                        <template #tip>
                            <div class="el-upload__tip">支持多种格式文件，单个文件不超过10MB</div>
                        </template>
                    </el-upload>
                </el-form-item>

                <el-form-item class="form-actions">
                    <el-button @click="saveDraft" :loading="saving" size="large">
                        <el-icon>
                            <Document />
                        </el-icon>
                        保存草稿
                    </el-button>
                    <el-button type="primary" @click="publish" :loading="publishing" size="large">
                        <el-icon>
                            <Promotion />
                        </el-icon>
                        发布
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
    Document,
    Upload,
    Promotion
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import parseMarkdown from '../../../utils/markdownParse'
import router from '../../../router'
import { useRoute } from 'vue-router'
import { customFetch } from '../../../api/customFetch'

interface FormData {
    title: string
    content: string
    tags: string[]
    attachments: Array<{ name: string; url: string; status: string; uid: string; raw?: File }>
}
const route = useRoute()
let kpId = route.query.id
// 响应式数据
const isCreate = ref(kpId ? false : true)
const saving = ref(false)
const publishing = ref(false)
const editorMode = ref<'edit' | 'preview' | 'split'>('split')
const isSaved = ref(false)
// 表单数据
const formData = ref<FormData>({
    title: '',
    content: '',
    tags: [],
    attachments: []
})

const renderedMarkdown = computed(() => {
    // 简单的Markdown渲染（实际项目中建议使用marked或markdown-it）
    return parseMarkdown(formData.value.content)
})

const goBack = () => {
    if (!isSaved.value) {
        ElMessageBox.confirm('当前页面尚有未保存内容，确定要离开吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            router.back()
        }).catch(() => { })
    }else{
        router.back()
    }

}
const resetForm = () => {
    formData.value = {
        title: '',
        content: '',
        tags: [],
        attachments: []
    }
}
const fetchDetail = async () => {
    try {
        const res = await customFetch(`/api/knowledge/${kpId}`)
        const data = await res.json()
        if (!data || data.code !== 200) {
            ElMessage.error('加载知识库详情失败')
            return
        }
        formData.value = {
            title: data.data.title,
            content: data.data.content,
            tags: JSON.parse(data.data.tags),
            attachments: data.data.attachmentsJson ? JSON.parse(data.data.attachmentsJson).map((url: string, idx: number) => ({
                name: url.split('\\').pop() || url.split('/').pop() || `附件${idx + 1}`,
                url,
                status: 'success',
                uid: `${Date.now()}_${idx}`
            })) : []
        }
    } catch (e) {
        console.log("加载知识库详情失败：", e)
        ElMessage.error('加载知识库详情失败')
    }
}
const saveDraft = async () => {
    if (!formData.value.title.trim() || !formData.value.content.trim()) {
        ElMessage.error('请填写完整信息')
        return
    }

    await _sendData(true)
    //isCreate.value = false
}

const publish = async () => {
    if (!formData.value.title.trim() || !formData.value.content.trim()) {
        ElMessage.error('请填写完整信息')
        return
    }

    await _sendData(false)
    //isCreate.value = false
}
const _sendData = async (isDraft: boolean) => {
    try {
        if (isDraft) {
            saving.value = true
        } else {
            publishing.value = true
        }
        const data = new FormData()
        const dto = {
            kpId: isCreate.value ? '' : kpId,
            title: formData.value.title,
            content: formData.value.content,
            tags: JSON.stringify(formData.value.tags),
            attachmentsJson: ''
        }
        const attachments = []
        for (const file of formData.value.attachments) {
            if (file.raw) {
                data.append('files', file.raw)
            } else {
                attachments.push(file.url)
            }
        }
        dto.attachmentsJson = JSON.stringify(attachments)
        data.append('dto', new Blob([JSON.stringify(dto)], {
            type: 'application/json'
        }))
        const url = isDraft ? '/api/knowledge/draft' : '/api/knowledge'
        const res = await customFetch(url, {
            method: isCreate ? 'POST' : 'PUT',
            body: data
        })
        const resData = await res.json()

        if (!resData || resData.code !== 200) {
            if (isDraft) {
                ElMessage.error('保存草稿失败，请稍后重试')
            } else {
                ElMessage.error('发布失败，请稍后重试')
            }
            return
        }
        //kpId = resData.data
        isSaved.value = true
        if (isDraft) {
            ElMessage.success('保存草稿成功')
        } else {
            ElMessageBox.confirm('发布成功，返回或者新建知识库？', '发布成功',
                {
                    confirmButtonText: '新建知识库',
                    cancelButtonText: '返回',
                    type: 'success'
                }
            ).then(() => {
                router.push('/knowledge-base/create')
                kpId = ''
                isCreate.value = true
                resetForm()
            }).catch(() => {
                router.go(-1)
            })
        }
    } catch (err) {
        console.log("知识库创建编辑失败：", err)
        if (isDraft) {
            ElMessage.error('保存草稿失败')
        } else {
            ElMessage.error('发布失败')
        }
    } finally {
        if (isDraft) {
            saving.value = false
        } else {
            publishing.value = false
        }
    }
}

const editKnowledge = (item: any) => {
    formData.value = {
        title: item.title,
        content: item.content || '',
        tags: [...item.tags],
        attachments: []
    }
}
// 监听编辑器模式变化
watch(editorMode, (newMode) => {
    // 可以在这里添加编辑器模式切换的逻辑
})
watch(formData.value, (newData) => {
    isSaved.value = false
})
// 初始化
onMounted(() => {
    if (isCreate.value) {
        return
    }
    fetchDetail()
    // 添加键盘监听事件
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault()
            saveDraft()
        }
    })
})
</script>
<style scoped>
.knowledge-base-app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    min-height: 90vh;
    background-color: #f5f7fa;
    border: 1px solid #ebeef5;
    border-radius: 16px;
}

/* 创建页面样式 */
.create-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.create-header h2 {
    margin: 0;
    color: #303133;
}

.create-form {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.content-form-item {
    margin-bottom: 30px;
    width: 100%;
}

.markdown-editor {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
    width: 100%;
}

.editor-tabs {
    background: #f5f7fa;
    padding: 10px 15px;
    border-bottom: 1px solid #dcdfe6;
}

.editor-container {
    display: flex;
    min-height: 500px;
}

.editor-container.edit .editor-panel {
    width: 100%;
}

.editor-container.preview .preview-panel {
    width: 100%;
}

.editor-container.split .editor-panel,
.editor-container.split .preview-panel {
    width: 50%;
}

.editor-panel {
    border-right: 1px solid #dcdfe6;
}

.markdown-textarea {
    height: 100%
}

.markdown-textarea :deep(.el-textarea__inner) {
    height: 100% !important;
    resize: none;
    border: none;
    border-radius: 0;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.preview-panel {
    max-height: 500px;
    word-wrap: break-word;
    padding: 15px;
    background: white;
    overflow-y: auto;
}

.markdown-preview {
    line-height: 1.8;
    color: #303133;
    overflow-y: auto;
    word-wrap: break-word
}

.markdown-preview :deep(h1) {
    font-size: 24px;
    margin: 20px 0 15px 0;
    color: #303133;
}

.markdown-preview :deep(h2) {
    font-size: 20px;
    margin: 20px 0 15px 0;
    color: #303133;
}

.markdown-preview :deep(h3) {
    font-size: 16px;
    margin: 15px 0 10px 0;
    color: #303133;
}

.markdown-preview :deep(p) {
    margin: 10px 0;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
    margin: 10px 0;
    padding-left: 25px;
}

.markdown-preview :deep(li) {
    margin: 5px 0;
}

.markdown-preview :deep(code) {
    background: #f5f7fa;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.markdown-preview :deep(pre) {
    background: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 15px 0;
}

.form-actions {
    margin-top: 30px;
    text-align: center;
}

.form-actions .el-button {
    margin: 0 10px;
    min-width: 120px;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .create-page {
        padding: 0 15px;
    }

    .editor-container.split {
        flex-direction: column;
    }

    .editor-container.split .editor-panel,
    .editor-container.split .preview-panel {
        width: 100%;
    }

    .editor-container.split .editor-panel {
        border-right: none;
        border-bottom: 1px solid #dcdfe6;
    }

}
</style>