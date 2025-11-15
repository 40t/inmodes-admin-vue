<template>
  <div class="categories-container">
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

        <el-form-item label="状态">
          <el-select v-model="searchForm.is_active" placeholder="全部" clearable style="width: 120px">
            <el-option label="全部" :value="undefined" />
            <el-option label="激活" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>

        <el-form-item label="搜索">
          <el-input
            v-model="searchForm.search"
            placeholder="分类名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>

        <el-form-item style="float: right">
          <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
            批量删除
          </el-button>
          <el-button type="primary" @click="showCreateDialog">
            <el-icon><Plus /></el-icon>
            新建分类
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
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" min-width="120" />
        <el-table-column prop="slug" label="标识(Slug)" min-width="120" />
        
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        
        <el-table-column prop="sort_order" label="排序" width="80" />

        <el-table-column prop="is_active" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.is_active"
              @change="handleToggleActive(row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
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

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="标识(Slug)" prop="slug">
          <el-input v-model="form.slug" placeholder="请输入英文标识，如: nature" />
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="音频" value="audio" />
            <el-option label="视频" value="video" />
            <el-option label="图片" value="image" />
          </el-select>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>

        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="form.sort_order" :min="0" :max="9999" />
        </el-form-item>

        <el-form-item label="状态" prop="is_active">
          <el-switch v-model="form.is_active" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import * as categoriesApi from '@/api/categories'
import type { Category, CategoryCreate, CategoryUpdate } from '@/types'

// 搜索表单
const searchForm = reactive({
  type: '',
  is_active: undefined as boolean | undefined,
  search: '',
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
})

// 表格数据
const loading = ref(false)
const tableData = ref<Category[]>([])
const selectedIds = ref<number[]>([])

// 对话框
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const dialogTitle = computed(() => dialogMode.value === 'create' ? '新建分类' : '编辑分类')
const submitting = ref(false)

// 表单
const formRef = ref<FormInstance>()
const form = reactive<CategoryCreate & { id?: number }>({
  name: '',
  slug: '',
  description: '',
  type: 'audio',
  icon: '',
  sort_order: 0,
  is_active: true,
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' },
  ],
  slug: [
    { required: true, message: '请输入标识', trigger: 'blur' },
    { pattern: /^[a-z0-9_-]+$/, message: '只能包含小写字母、数字、下划线和连字符', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' },
  ],
}

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      type: searchForm.type || undefined,
      is_active: searchForm.is_active,
      search: searchForm.search || undefined,
    }
    const res = await categoriesApi.getCategories(params)
    if (res.success) {
      tableData.value = res.data
      pagination.total = res.total
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchCategories()
}

// 重置
const handleReset = () => {
  searchForm.type = ''
  searchForm.is_active = undefined
  searchForm.search = ''
  pagination.page = 1
  fetchCategories()
}

// 分页
const handleSizeChange = () => {
  pagination.page = 1
  fetchCategories()
}

const handlePageChange = () => {
  fetchCategories()
}

// 选择
const handleSelectionChange = (selection: Category[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 显示创建对话框
const showCreateDialog = () => {
  dialogMode.value = 'create'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Category) => {
  dialogMode.value = 'edit'
  form.id = row.id
  form.name = row.name
  form.slug = row.slug
  form.description = row.description || ''
  form.type = row.type
  form.icon = row.icon || ''
  form.sort_order = row.sort_order
  form.is_active = row.is_active
  dialogVisible.value = true
}

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.resetFields()
  form.id = undefined
  form.name = ''
  form.slug = ''
  form.description = ''
  form.type = 'audio'
  form.icon = ''
  form.sort_order = 0
  form.is_active = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      if (dialogMode.value === 'create') {
        const data: CategoryCreate = {
          name: form.name,
          slug: form.slug,
          description: form.description,
          type: form.type,
          icon: form.icon || undefined,
          sort_order: form.sort_order,
          is_active: form.is_active,
        }
        const res = await categoriesApi.createCategory(data)
        if (res.success) {
          ElMessage.success('创建成功')
          dialogVisible.value = false
          fetchCategories()
        }
      } else {
        const data: CategoryUpdate = {
          name: form.name,
          slug: form.slug,
          description: form.description,
          type: form.type,
          icon: form.icon || undefined,
          sort_order: form.sort_order,
          is_active: form.is_active,
        }
        const res = await categoriesApi.updateCategory(form.id!, data)
        if (res.success) {
          ElMessage.success('更新成功')
          dialogVisible.value = false
          fetchCategories()
        }
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.error || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

// 切换激活状态
const handleToggleActive = async (row: Category) => {
  try {
    const res = await categoriesApi.toggleCategoryActive(row.id)
    if (res.success) {
      ElMessage.success(res.message || '状态已更新')
      fetchCategories()
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '操作失败')
    // 恢复原状态
    row.is_active = !row.is_active
  }
}

// 删除
const handleDelete = async (row: Category) => {
  try {
    await ElMessageBox.confirm(`确定要删除分类"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    const res = await categoriesApi.deleteCategory(row.id)
    if (res.success) {
      ElMessage.success('删除成功')
      fetchCategories()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || '删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个分类吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    const res = await categoriesApi.batchDeleteCategories({ ids: selectedIds.value })
    if (res.success) {
      ElMessage.success(res.message || '删除成功')
      fetchCategories()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || '删除失败')
    }
  }
}

// 工具函数
const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    audio: 'primary',
    video: 'success',
    image: 'warning',
  }
  return colors[type] || ''
}

const getTypeName = (type: string) => {
  const names: Record<string, string> = {
    audio: '音频',
    video: '视频',
    image: '图片',
  }
  return names[type] || type
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.categories-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
