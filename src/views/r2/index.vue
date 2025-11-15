<template>
  <div class="r2-container">
    <!-- 配置提示 -->
    <el-alert
      v-if="!isConfigured"
      title="R2 存储未配置"
      type="warning"
      :closable="false"
      show-icon
    >
      <template #default>
        <p>Cloudflare R2 存储服务尚未配置。请按以下步骤配置:</p>
        <ol style="margin: 10px 0; padding-left: 20px;">
          <li>在 Cloudflare Dashboard 创建 R2 API Token</li>
          <li>在后端 .env 文件中配置 R2_ACCESS_KEY_ID 和 R2_SECRET_ACCESS_KEY</li>
          <li>重启后端服务</li>
        </ol>
        <p>详细配置说明请参考后端项目的 <code>R2_SETUP.md</code> 文档</p>
      </template>
    </el-alert>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-label">总对象数</div>
            <div class="stat-value">{{ stats.total_objects }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-label">总大小 (GB)</div>
            <div class="stat-value">{{ stats.total_size_gb }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-label">总大小 (MB)</div>
            <div class="stat-value">{{ stats.total_size_mb }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-label">存储桶</div>
            <div class="stat-value">{{ stats.bucket_name }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <el-form :inline="true">
        <el-form-item label="前缀">
          <el-input
            v-model="searchPrefix"
            placeholder="输入前缀筛选"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="分类">
          <el-select v-model="selectedCategory" placeholder="选择分类" clearable style="width: 150px">
            <el-option
              v-for="cat in categories"
              :key="cat"
              :label="cat"
              :value="cat"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>

        <el-form-item style="float: right">
          <el-button type="primary" @click="showUploadDialog">
            <el-icon><Upload /></el-icon>
            上传到 R2
          </el-button>
          <el-button type="danger" :disabled="selectedKeys.length === 0" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="key" label="文件路径" min-width="300" show-overflow-tooltip />
        
        <el-table-column label="预览" width="100">
          <template #default="{ row }">
            <el-image
              v-if="isImage(row.key)"
              :src="row.url"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px"
              :preview-src-list="[row.url]"
            />
            <el-icon v-else-if="isAudio(row.key)" :size="40" color="#409eff">
              <Headset />
            </el-icon>
            <el-icon v-else-if="isVideo(row.key)" :size="40" color="#67c23a">
              <VideoPlay />
            </el-icon>
            <el-icon v-else :size="40" color="#909399">
              <Document />
            </el-icon>
          </template>
        </el-table-column>

        <el-table-column prop="size" label="文件大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>

        <el-table-column prop="etag" label="ETag" width="150" show-overflow-tooltip />

        <el-table-column prop="last_modified" label="最后修改时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.last_modified) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleCopyUrl(row)">
              复制链接
            </el-button>
            <el-button link type="primary" size="small" @click="handlePreview(row)">
              预览
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 加载更多 -->
      <div v-if="hasMore" class="load-more">
        <el-button @click="loadMore" :loading="loading">加载更多</el-button>
      </div>
    </el-card>

    <!-- 上传对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传文件到 R2"
      width="500px"
      @close="resetUploadForm"
    >
      <el-form :model="uploadForm" label-width="80px">
        <el-form-item label="分类">
          <el-input v-model="uploadForm.category" placeholder="输入分类/文件夹名称" />
        </el-form-item>

        <el-form-item label="文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            drag
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持所有文件类型，文件将上传到 Cloudflare R2
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="handleUpload">
          确定上传
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type UploadInstance } from 'element-plus'
import { Upload, Delete, UploadFilled, Headset, VideoPlay, Document } from '@element-plus/icons-vue'
import * as r2Api from '../../api/r2'
import type { R2Object, R2Stats } from '../../types'

// 统计数据
const stats = reactive<R2Stats>({
  total_objects: 0,
  total_size_bytes: 0,
  total_size_mb: 0,
  total_size_gb: 0,
  bucket_name: '',
})

// 搜索
const searchPrefix = ref('')
const selectedCategory = ref('')
const categories = ref<string[]>([])

// 表格数据
const loading = ref(false)
const tableData = ref<R2Object[]>([])
const selectedKeys = ref<string[]>([])
const hasMore = ref(false)
const nextToken = ref<string | undefined>()
const isConfigured = ref(true)

// 上传对话框
const uploadDialogVisible = ref(false)
const uploadRef = ref<UploadInstance>()
const uploading = ref(false)
const uploadForm = reactive({
  file: null as File | null,
  category: '',
})

/**
 * 获取统计数据
 */
async function fetchStats() {
  try {
    const res = await r2Api.getR2Stats()
    if (res.success && res.data) {
      Object.assign(stats, res.data)
    }
  } catch (error: any) {
    console.error('获取统计数据失败:', error)
    if (error.response?.status === 400) {
      isConfigured.value = false
    }
  }
}

/**
 * 获取分类列表
 */
async function fetchCategories() {
  try {
    const res = await r2Api.getR2Categories()
    if (res.success && res.data) {
      categories.value = res.data
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

/**
 * 获取对象列表
 */
async function fetchData(append = false) {
  loading.value = true
  try {
    const prefix = selectedCategory.value || searchPrefix.value
    const res = await r2Api.listR2Objects({
      prefix,
      max_keys: 100,
      continuation_token: append ? nextToken.value : undefined,
    })
    
    if (res.success && res.data) {
      if (append) {
        tableData.value.push(...res.data.objects)
      } else {
        tableData.value = res.data.objects
      }
      hasMore.value = res.data.is_truncated
      nextToken.value = res.data.next_token
    }
  } catch (error: any) {
    console.error('获取数据失败:', error)
    if (error.response?.status === 400 && !append) {
      isConfigured.value = false
    }
  } finally {
    loading.value = false
  }
}

/**
 * 搜索
 */
function handleSearch() {
  nextToken.value = undefined
  fetchData()
}

/**
 * 重置
 */
function handleReset() {
  searchPrefix.value = ''
  selectedCategory.value = ''
  nextToken.value = undefined
  fetchData()
}

/**
 * 加载更多
 */
function loadMore() {
  fetchData(true)
}

/**
 * 选择变化
 */
function handleSelectionChange(selection: R2Object[]) {
  selectedKeys.value = selection.map(item => item.key)
}

/**
 * 显示上传对话框
 */
function showUploadDialog() {
  uploadDialogVisible.value = true
}

/**
 * 文件选择
 */
function handleFileChange(file: any) {
  uploadForm.file = file.raw
}

/**
 * 文件移除
 */
function handleFileRemove() {
  uploadForm.file = null
}

/**
 * 重置上传表单
 */
function resetUploadForm() {
  uploadForm.file = null
  uploadForm.category = ''
  uploadRef.value?.clearFiles()
}

/**
 * 上传
 */
async function handleUpload() {
  if (!uploadForm.file) {
    ElMessage.warning('请选择文件')
    return
  }

  if (!uploadForm.category) {
    ElMessage.warning('请输入分类')
    return
  }

  uploading.value = true
  try {
    await r2Api.uploadToR2(uploadForm.file, uploadForm.category)
    ElMessage.success('上传成功')
    uploadDialogVisible.value = false
    fetchData()
    fetchStats()
  } catch (error) {
    console.error('上传失败:', error)
  } finally {
    uploading.value = false
  }
}

/**
 * 复制链接
 */
async function handleCopyUrl(row: R2Object) {
  try {
    await navigator.clipboard.writeText(row.url)
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

/**
 * 预览
 */
function handlePreview(row: R2Object) {
  window.open(row.url, '_blank')
}

/**
 * 删除
 */
async function handleDelete(row: R2Object) {
  await ElMessageBox.confirm(`确定要删除 "${row.key}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })

  try {
    await r2Api.deleteR2Object(row.key)
    ElMessage.success('删除成功')
    fetchData()
    fetchStats()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

/**
 * 批量删除
 */
async function handleBatchDelete() {
  await ElMessageBox.confirm(`确定要删除选中的 ${selectedKeys.value.length} 个文件吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })

  try {
    await r2Api.batchDeleteR2Objects(selectedKeys.value)
    ElMessage.success('批量删除成功')
    selectedKeys.value = []
    fetchData()
    fetchStats()
  } catch (error) {
    console.error('批量删除失败:', error)
  }
}

/**
 * 工具函数
 */
function isImage(key: string) {
  return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(key)
}

function isAudio(key: string) {
  return /\.(mp3|wav|flac|aac|ogg)$/i.test(key)
}

function isVideo(key: string) {
  return /\.(mp4|mov|avi|mkv|webm)$/i.test(key)
}

function formatFileSize(size: number) {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB'
  return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  fetchStats()
  fetchCategories()
  fetchData()
})
</script>

<style scoped>
.r2-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-row {
  margin-bottom: 0;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.search-card {
  margin-bottom: 0;
}

.table-card {
  flex: 1;
}

.load-more {
  margin-top: 20px;
  text-align: center;
}
</style>
