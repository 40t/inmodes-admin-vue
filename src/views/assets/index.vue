<template>
  <div class="assets-container">
    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="全部" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="音频" value="audio" />
            <el-option label="视频" value="video" />
            <el-option label="图片" value="image" />
          </el-select>
        </el-form-item>

        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="全部" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="自然音" value="nature" />
            <el-option label="音乐" value="music" />
            <el-option label="白噪音" value="white_noise" />
            <el-option label="环境音" value="ambient" />
          </el-select>
        </el-form-item>

        <el-form-item label="搜索">
          <el-input
            v-model="searchForm.search"
            placeholder="标题或描述"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>

        <el-form-item style="float: right">
          <el-button type="primary" @click="showUploadDialog">
            <el-icon><Plus /></el-icon>
            上传物料
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
      >
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column label="预览" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.type === 'image'"
              :src="row.thumbnail || row.url"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px"
              :preview-src-list="[row.url]"
            />
            <el-icon v-else-if="row.type === 'audio'" :size="40" color="#409eff">
              <Headset />
            </el-icon>
            <el-icon v-else :size="40" color="#67c23a">
              <VideoPlay />
            </el-icon>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="标题" min-width="150" />
        
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag type="info">{{ getCategoryName(row.category) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />

        <el-table-column prop="file_size" label="文件大小" width="100">
          <template #default="{ row }">
            {{ formatFileSize(row.file_size) }}
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
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

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 上传对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传物料"
      width="600px"
      @close="resetUploadForm"
    >
      <el-form
        ref="uploadFormRef"
        :model="uploadForm"
        :rules="uploadRules"
        label-width="80px"
      >
        <el-form-item label="文件" prop="file">
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
                支持音频、视频、图片格式，文件大小不超过 100MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input v-model="uploadForm.title" placeholder="请输入标题" />
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-select v-model="uploadForm.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="音频" value="audio" />
            <el-option label="视频" value="video" />
            <el-option label="图片" value="image" />
          </el-select>
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select v-model="uploadForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="自然音" value="nature" />
            <el-option label="音乐" value="music" />
            <el-option label="白噪音" value="white_noise" />
            <el-option label="环境音" value="ambient" />
          </el-select>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="uploadForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="handleUpload">
          确定上传
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑物料"
      width="600px"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="editForm.title" placeholder="请输入标题" />
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select v-model="editForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="自然音" value="nature" />
            <el-option label="音乐" value="music" />
            <el-option label="白噪音" value="white_noise" />
            <el-option label="环境音" value="ambient" />
          </el-select>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="updating" @click="handleUpdate">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadInstance } from 'element-plus'
import { Plus, UploadFilled, Headset, VideoPlay } from '@element-plus/icons-vue'
import * as assetsApi from '../../api/assets'
import type { MediaAsset } from '../../types'

// 搜索表单
const searchForm = reactive({
  type: '',
  category: '',
  search: '',
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
})

// 表格数据
const loading = ref(false)
const tableData = ref<MediaAsset[]>([])

// 上传对话框
const uploadDialogVisible = ref(false)
const uploadFormRef = ref<FormInstance>()
const uploadRef = ref<UploadInstance>()
const uploading = ref(false)
const uploadForm = reactive({
  file: null as File | null,
  title: '',
  type: 'audio' as 'audio' | 'video' | 'image',
  category: '',
  description: '',
})

const uploadRules: FormRules = {
  file: [{ required: true, message: '请选择文件', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
}

// 编辑对话框
const editDialogVisible = ref(false)
const editFormRef = ref<FormInstance>()
const updating = ref(false)
const editForm = reactive({
  id: 0,
  title: '',
  category: '',
  description: '',
})

const editRules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
}

/**
 * 获取列表数据
 */
async function fetchData() {
  loading.value = true
  try {
    const res = await assetsApi.getAssets({
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm,
    })
    if (res.success) {
      tableData.value = res.data
      pagination.total = res.total
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 搜索
 */
function handleSearch() {
  pagination.page = 1
  fetchData()
}

/**
 * 重置
 */
function handleReset() {
  searchForm.type = ''
  searchForm.category = ''
  searchForm.search = ''
  pagination.page = 1
  fetchData()
}

/**
 * 分页变化
 */
function handlePageChange() {
  fetchData()
}

function handleSizeChange() {
  pagination.page = 1
  fetchData()
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
  uploadForm.title = ''
  uploadForm.type = 'audio'
  uploadForm.category = ''
  uploadForm.description = ''
  uploadFormRef.value?.resetFields()
  uploadRef.value?.clearFiles()
}

/**
 * 上传
 */
async function handleUpload() {
  if (!uploadFormRef.value) return

  await uploadFormRef.value.validate(async (valid) => {
    if (!valid || !uploadForm.file) return

    uploading.value = true
    try {
      await assetsApi.uploadAsset({
        file: uploadForm.file,
        title: uploadForm.title,
        type: uploadForm.type,
        category: uploadForm.category,
        description: uploadForm.description,
      })
      ElMessage.success('上传成功')
      uploadDialogVisible.value = false
      fetchData()
    } catch (error) {
      console.error('上传失败:', error)
    } finally {
      uploading.value = false
    }
  })
}

/**
 * 编辑
 */
function handleEdit(row: MediaAsset) {
  editForm.id = row.id
  editForm.title = row.title
  editForm.category = row.category
  editForm.description = row.description || ''
  editDialogVisible.value = true
}

/**
 * 更新
 */
async function handleUpdate() {
  if (!editFormRef.value) return

  await editFormRef.value.validate(async (valid) => {
    if (!valid) return

    updating.value = true
    try {
      await assetsApi.updateAsset(editForm.id, {
        title: editForm.title,
        category: editForm.category,
        description: editForm.description,
      })
      ElMessage.success('更新成功')
      editDialogVisible.value = false
      fetchData()
    } catch (error) {
      console.error('更新失败:', error)
    } finally {
      updating.value = false
    }
  })
}

/**
 * 预览
 */
function handlePreview(row: MediaAsset) {
  window.open(row.url, '_blank')
}

/**
 * 删除
 */
async function handleDelete(row: MediaAsset) {
  await ElMessageBox.confirm(`确定要删除 "${row.title}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })

  try {
    await assetsApi.deleteAsset(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

/**
 * 工具函数
 */
function getTypeName(type: string) {
  const map: Record<string, string> = {
    audio: '音频',
    video: '视频',
    image: '图片',
  }
  return map[type] || type
}

function getTypeColor(type: string) {
  const map: Record<string, any> = {
    audio: 'primary',
    video: 'success',
    image: 'warning',
  }
  return map[type] || ''
}

function getCategoryName(category: string) {
  const map: Record<string, string> = {
    nature: '自然音',
    music: '音乐',
    white_noise: '白噪音',
    ambient: '环境音',
  }
  return map[category] || category
}

function formatFileSize(size?: number) {
  if (!size) return '-'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / 1024 / 1024).toFixed(2) + ' MB'
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.assets-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-card {
  margin-bottom: 0;
}

.table-card {
  flex: 1;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
