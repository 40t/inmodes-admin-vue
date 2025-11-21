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
          <el-select v-model="searchForm.category" placeholder="全部" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option
              v-for="cat in searchFilteredCategories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.slug"
            />
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
            <!-- 图片类型：使用 el-image 预览 -->
            <el-image
              v-if="row.type === 'image'"
              :src="getFileUrl(row.file_path)"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px"
              :preview-src-list="[getFileUrl(row.file_path)]"
            />
            <!-- 视频类型：显示封面缩略图，但不使用 el-image 预览 -->
            <img
              v-else-if="row.type === 'video' && row.thumbnail"
              :src="getFileUrl(row.thumbnail)"
              style="width: 60px; height: 60px; border-radius: 4px; object-fit: cover; cursor: pointer;"
              @click="handlePreview(row)"
              :title="'点击预览视频: ' + row.title"
            />
            <!-- 音频图标 -->
            <el-icon v-else-if="row.type === 'audio'" :size="40" color="#409eff">
              <Headset />
            </el-icon>
            <!-- 视频图标（无封面） -->
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

        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="success" size="small" @click="handleReupload(row)">
              重新上传
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
          <div style="margin-top: 8px; font-size: 12px; color: #909399;">
            决定 R2 存储目录: {{ uploadForm.type || 'audio/video/image' }}/
          </div>
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select 
            v-model="uploadForm.category" 
            placeholder="请先选择类型" 
            :disabled="!uploadForm.type"
            style="width: 100%"
          >
            <el-option
              v-for="cat in filteredCategories"
              :key="cat.id"
              :label="`${cat.name} (${cat.slug})`"
              :value="cat.slug"
            />
          </el-select>
          <div style="margin-top: 8px; font-size: 12px; color: #909399;">
            用于业务筛选和内容管理
          </div>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="uploadForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>

        <!-- 视频预览和封面截取 -->
        <el-form-item v-if="uploadForm.type === 'video' && uploadForm.videoPreviewUrl" label="视频预览">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <video
              ref="videoPreviewRef"
              :src="uploadForm.videoPreviewUrl"
              controls
              style="width: 100%; max-height: 300px; border-radius: 4px; background: #000;"
              @loadedmetadata="handleVideoLoaded"
            />
            <div style="display: flex; gap: 8px; align-items: center;">
              <el-button type="primary" size="small" @click="captureVideoFrame">
                <el-icon><Camera /></el-icon>
                截取当前帧作为封面
              </el-button>
              <span v-if="uploadForm.thumbnail" style="color: #67c23a; font-size: 14px;">
                <el-icon><Check /></el-icon>
                已截取封面
              </span>
            </div>
            <!-- 封面预览 -->
            <div v-if="thumbnailPreviewUrl" style="margin-top: 8px;">
              <div style="font-size: 14px; color: #606266; margin-bottom: 8px;">封面预览：</div>
              <el-image
                :src="thumbnailPreviewUrl"
                fit="cover"
                style="width: 200px; height: 112px; border-radius: 4px;"
              />
            </div>
          </div>
          <canvas ref="canvasRef" style="display: none;"></canvas>
        </el-form-item>

        <!-- 上传进度 -->
        <el-form-item v-if="uploading">
          <el-progress 
            :percentage="uploadProgress" 
            :status="uploadProgress === 100 ? 'success' : undefined"
          />
          <div style="margin-top: 8px; font-size: 12px; color: #909399; text-align: center;">
            {{ uploadProgress < 100 ? '正在上传...' : '处理中...' }}
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="uploadDialogVisible = false" :disabled="uploading">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="handleUpload">
          {{ uploading ? '上传中...' : '确定上传' }}
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
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.slug"
            />
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

    <!-- 重新上传对话框 -->
    <el-dialog
      v-model="reuploadDialogVisible"
      title="重新上传文件"
      width="600px"
      @close="resetReuploadForm"
    >
      <el-alert
        title="提示"
        type="warning"
        :closable="false"
        style="margin-bottom: 20px"
      >
        重新上传将替换原有文件，但保留标题、分类等信息
      </el-alert>

      <el-form
        ref="reuploadFormRef"
        :model="reuploadForm"
        label-width="80px"
      >
        <el-form-item label="当前信息">
          <div style="color: #606266">
            <div>标题: {{ reuploadForm.title }}</div>
            <div>类型: {{ getTypeName(reuploadForm.type) }}</div>
            <div>分类: {{ getCategoryName(reuploadForm.category) }}</div>
          </div>
        </el-form-item>

        <el-form-item label="新文件" prop="file" required>
          <el-upload
            ref="reuploadRef"
            :auto-upload="false"
            :limit="1"
            :on-change="handleReuploadFileChange"
            :on-remove="handleReuploadFileRemove"
            drag
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只能上传 {{ getTypeName(reuploadForm.type) }} 文件，且不超过 500MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- 视频预览和封面截取 -->
        <el-form-item v-if="reuploadForm.type === 'video' && reuploadForm.videoPreviewUrl" label="视频预览">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <video
              ref="reuploadVideoPreviewRef"
              :src="reuploadForm.videoPreviewUrl"
              controls
              style="width: 100%; max-height: 300px; border-radius: 4px; background: #000;"
            />
            <div style="display: flex; gap: 8px; align-items: center;">
              <el-button type="primary" size="small" @click="captureReuploadVideoFrame">
                <el-icon><Camera /></el-icon>
                截取当前帧作为封面
              </el-button>
              <span v-if="reuploadForm.thumbnail" style="color: #67c23a; font-size: 14px;">
                <el-icon><Check /></el-icon>
                已截取封面
              </span>
            </div>
            <!-- 封面预览 -->
            <div v-if="reuploadThumbnailPreviewUrl" style="margin-top: 8px;">
              <div style="font-size: 14px; color: #606266; margin-bottom: 8px;">封面预览：</div>
              <el-image
                :src="reuploadThumbnailPreviewUrl"
                fit="cover"
                style="width: 200px; height: 112px; border-radius: 4px;"
              />
            </div>
          </div>
          <canvas ref="reuploadCanvasRef" style="display: none;"></canvas>
        </el-form-item>

        <!-- 上传进度 -->
        <el-form-item v-if="uploading">
          <el-progress :percentage="uploadProgress" :status="uploadProgress === 100 ? 'success' : undefined" />
          <div style="margin-top: 10px; color: #909399; font-size: 14px">
            正在上传... {{ uploadProgress }}%
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="reuploadDialogVisible = false" :disabled="uploading">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="handleReuploadSubmit">
          {{ uploading ? '上传中...' : '确定上传' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadInstance } from 'element-plus'
import { Plus, UploadFilled, Headset, VideoPlay, Camera, Check } from '@element-plus/icons-vue'
import * as assetsApi from '../../api/assets'
import * as categoriesApi from '../../api/categories'
import type { MediaAsset, Category } from '../../types'

// 分类数据
const categories = ref<Category[]>([])

// 根据上传表单的类型过滤分类
const filteredCategories = computed(() => {
  if (!uploadForm.type) return []
  return categories.value.filter(cat => cat.type === uploadForm.type)
})

// 根据搜索表单的类型过滤分类
const searchFilteredCategories = computed(() => {
  if (!searchForm.type) return categories.value
  return categories.value.filter(cat => cat.type === searchForm.type)
})

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
const uploadProgress = ref(0)
const videoPreviewRef = ref<HTMLVideoElement>()
const canvasRef = ref<HTMLCanvasElement>()
const thumbnailPreviewUrl = ref<string | null>(null)
const uploadForm = reactive({
  file: null as File | null,
  title: '',
  type: 'audio' as 'audio' | 'video' | 'image',
  category: '',
  description: '',
  thumbnail: null as File | null,
  videoPreviewUrl: null as string | null,
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
  
  // 检测文件类型（通过MIME type）
  const isVideo = file.raw && file.raw.type.startsWith('video/')
  
  // 如果是视频文件，创建预览URL
  if (isVideo && file.raw) {
    // 清理旧的预览URL
    if (uploadForm.videoPreviewUrl) {
      URL.revokeObjectURL(uploadForm.videoPreviewUrl)
    }
    uploadForm.videoPreviewUrl = URL.createObjectURL(file.raw)
    // 清空之前的封面
    uploadForm.thumbnail = null
    thumbnailPreviewUrl.value = null
    
    // 如果类型还没选择，自动设置为video
    if (!uploadForm.type || uploadForm.type !== 'video') {
      uploadForm.type = 'video'
    }
  } else {
    // 非视频文件，清理视频预览
    if (uploadForm.videoPreviewUrl) {
      URL.revokeObjectURL(uploadForm.videoPreviewUrl)
      uploadForm.videoPreviewUrl = null
    }
  }
}

/**
 * 文件移除
 */
function handleFileRemove() {
  uploadForm.file = null
  // 清理视频预览URL
  if (uploadForm.videoPreviewUrl) {
    URL.revokeObjectURL(uploadForm.videoPreviewUrl)
    uploadForm.videoPreviewUrl = null
  }
  // 清理封面预览URL
  if (thumbnailPreviewUrl.value) {
    URL.revokeObjectURL(thumbnailPreviewUrl.value)
    thumbnailPreviewUrl.value = null
  }
  uploadForm.thumbnail = null
}

/**
 * 视频加载完成
 */
function handleVideoLoaded() {
  console.log('视频加载完成，可以截取封面')
}

/**
 * 截取视频当前帧作为封面
 */
function captureVideoFrame() {
  const video = videoPreviewRef.value
  const canvas = canvasRef.value
  
  if (!video || !canvas) {
    ElMessage.error('视频预览未就绪')
    return
  }
  
  // 设置canvas尺寸为视频尺寸
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  
  // 绘制当前视频帧到canvas
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    ElMessage.error('无法创建canvas上下文')
    return
  }
  
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  
  // 将canvas转换为Blob，然后创建File对象
  canvas.toBlob((blob) => {
    if (!blob) {
      ElMessage.error('截取封面失败')
      return
    }
    
    // 创建File对象
    const timestamp = Date.now()
    const thumbnailFile = new File([blob], `thumbnail_${timestamp}.jpg`, { type: 'image/jpeg' })
    uploadForm.thumbnail = thumbnailFile
    
    // 创建预览URL
    if (thumbnailPreviewUrl.value) {
      URL.revokeObjectURL(thumbnailPreviewUrl.value)
    }
    thumbnailPreviewUrl.value = URL.createObjectURL(blob)
    
    ElMessage.success('封面截取成功')
  }, 'image/jpeg', 0.9)
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
  uploadForm.thumbnail = null
  
  // 清理视频预览URL
  if (uploadForm.videoPreviewUrl) {
    URL.revokeObjectURL(uploadForm.videoPreviewUrl)
    uploadForm.videoPreviewUrl = null
  }
  
  // 清理封面预览URL
  if (thumbnailPreviewUrl.value) {
    URL.revokeObjectURL(thumbnailPreviewUrl.value)
    thumbnailPreviewUrl.value = null
  }
  
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
    uploadProgress.value = 0
    
    try {
      await assetsApi.uploadAsset(
        {
          file: uploadForm.file,
          title: uploadForm.title,
          type: uploadForm.type,
          category: uploadForm.category,
          description: uploadForm.description,
          thumbnail: uploadForm.thumbnail,
        },
        (progressEvent) => {
          // 计算上传进度
          if (progressEvent.total) {
            uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
        }
      )
      ElMessage.success('上传成功')
      uploadDialogVisible.value = false
      uploadProgress.value = 0
      fetchData()
    } catch (error: any) {
      console.error('上传失败:', error)
      ElMessage.error(error.response?.data?.detail || '上传失败，请重试')
      uploadProgress.value = 0
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
 * 重新上传
 */
const reuploadDialogVisible = ref(false)
const reuploadFormRef = ref<FormInstance>()
const reuploadVideoPreviewRef = ref<HTMLVideoElement>()
const reuploadCanvasRef = ref<HTMLCanvasElement>()
const reuploadThumbnailPreviewUrl = ref<string | null>(null)
const reuploadForm = reactive({
  id: 0,
  file: null as File | null,
  title: '',
  type: '' as 'audio' | 'video' | 'image',
  category: '',
  thumbnail: null as File | null,
  videoPreviewUrl: null as string | null,
})

function handleReupload(row: MediaAsset) {
  reuploadForm.id = row.id
  reuploadForm.title = row.title
  reuploadForm.type = row.type
  reuploadForm.category = row.category
  reuploadForm.file = null
  reuploadForm.thumbnail = null
  reuploadForm.videoPreviewUrl = null
  reuploadThumbnailPreviewUrl.value = null
  reuploadDialogVisible.value = true
}

/**
 * 重置重新上传表单
 */
function resetReuploadForm() {
  reuploadForm.file = null
  reuploadForm.thumbnail = null
  
  // 清理视频预览URL
  if (reuploadForm.videoPreviewUrl) {
    URL.revokeObjectURL(reuploadForm.videoPreviewUrl)
    reuploadForm.videoPreviewUrl = null
  }
  
  // 清理封面预览URL
  if (reuploadThumbnailPreviewUrl.value) {
    URL.revokeObjectURL(reuploadThumbnailPreviewUrl.value)
    reuploadThumbnailPreviewUrl.value = null
  }
}

/**
 * 重新上传文件选择
 */
function handleReuploadFileChange(file: any) {
  reuploadForm.file = file.raw
  
  // 检测文件类型（通过MIME type）
  const isVideo = file.raw && file.raw.type.startsWith('video/')
  
  // 如果是视频文件，创建预览URL
  if (isVideo && file.raw && reuploadForm.type === 'video') {
    // 清理旧的预览URL
    if (reuploadForm.videoPreviewUrl) {
      URL.revokeObjectURL(reuploadForm.videoPreviewUrl)
    }
    reuploadForm.videoPreviewUrl = URL.createObjectURL(file.raw)
    // 清空之前的封面
    reuploadForm.thumbnail = null
    reuploadThumbnailPreviewUrl.value = null
  }
}

/**
 * 重新上传文件移除
 */
function handleReuploadFileRemove() {
  reuploadForm.file = null
  // 清理视频预览URL
  if (reuploadForm.videoPreviewUrl) {
    URL.revokeObjectURL(reuploadForm.videoPreviewUrl)
    reuploadForm.videoPreviewUrl = null
  }
  // 清理封面预览URL
  if (reuploadThumbnailPreviewUrl.value) {
    URL.revokeObjectURL(reuploadThumbnailPreviewUrl.value)
    reuploadThumbnailPreviewUrl.value = null
  }
  reuploadForm.thumbnail = null
}

/**
 * 截取重新上传视频的当前帧作为封面
 */
function captureReuploadVideoFrame() {
  const video = reuploadVideoPreviewRef.value
  const canvas = reuploadCanvasRef.value
  
  if (!video || !canvas) {
    ElMessage.error('视频预览未就绪')
    return
  }
  
  // 设置canvas尺寸为视频尺寸
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  
  // 绘制当前视频帧到canvas
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    ElMessage.error('无法创建canvas上下文')
    return
  }
  
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  
  // 将canvas转换为Blob，然后创建File对象
  canvas.toBlob((blob) => {
    if (!blob) {
      ElMessage.error('截取封面失败')
      return
    }
    
    // 创建File对象
    const timestamp = Date.now()
    const thumbnailFile = new File([blob], `thumbnail_${timestamp}.jpg`, { type: 'image/jpeg' })
    reuploadForm.thumbnail = thumbnailFile
    
    // 创建预览URL
    if (reuploadThumbnailPreviewUrl.value) {
      URL.revokeObjectURL(reuploadThumbnailPreviewUrl.value)
    }
    reuploadThumbnailPreviewUrl.value = URL.createObjectURL(blob)
    
    ElMessage.success('封面截取成功')
  }, 'image/jpeg', 0.9)
}

/**
 * 执行重新上传
 */
async function handleReuploadSubmit() {
  if (!reuploadForm.file) {
    ElMessage.warning('请选择要上传的文件')
    return
  }

  uploading.value = true
  uploadProgress.value = 0
  
  try {
    await assetsApi.reuploadAsset(
      reuploadForm.id,
      reuploadForm.file,
      reuploadForm.thumbnail,
      (progressEvent: any) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      }
    )
    ElMessage.success('重新上传成功')
    reuploadDialogVisible.value = false
    uploadProgress.value = 0
    fetchData()
  } catch (error: any) {
    console.error('重新上传失败:', error)
    ElMessage.error(error.response?.data?.detail || '重新上传失败，请重试')
    uploadProgress.value = 0
  } finally {
    uploading.value = false
  }
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
  window.open(getFileUrl(row.file_path), '_blank')
}

/**
 * 获取文件完整 URL
 * 文件存储在 R2,使用 CDN 地址
 */
function getFileUrl(path: string) {
  // 如果已经是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // R2 文件使用 CDN 地址: https://static.inmodes.com/audio/rain.mp3
  return `https://static.inmodes.com/${path}`
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

/**
 * 加载分类列表
 */
async function fetchCategories() {
  try {
    const res = await categoriesApi.getAllCategories({ is_active: true })
    console.log('分类 API 响应:', res)
    if (res.success && res.data) {
      categories.value = res.data
      console.log('分类数据已加载:', categories.value)
    } else {
      console.warn('分类数据加载失败，success:', res.success)
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 监听上传表单类型变化，清空分类选择
watch(() => uploadForm.type, (newType, oldType) => {
  if (newType !== oldType) {
    uploadForm.category = ''
  }
})

// 监听搜索表单类型变化，清空分类选择
watch(() => searchForm.type, (newType, oldType) => {
  if (newType !== oldType && searchForm.category) {
    // 检查当前选择的分类是否属于新类型
    const currentCategory = categories.value.find(cat => cat.slug === searchForm.category)
    if (currentCategory && currentCategory.type !== newType) {
      searchForm.category = ''
    }
  }
})

// 初始化
onMounted(() => {
  fetchData()
  fetchCategories()
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
