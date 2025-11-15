/**
 * 物料资产类型定义
 */
export interface MediaAsset {
  id: number
  title: string
  description?: string
  type: 'audio' | 'video' | 'image'
  category: string
  file_path: string  // 后端使用 file_path 而不是 url
  thumbnail?: string
  file_size?: number
  extra_metadata?: Record<string, any>  // 后端使用 extra_metadata
  is_active?: boolean  // 新增字段
  sort_order?: number  // 新增字段
  created_at: string
  updated_at: string
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  count: number
  page: number
  total: number
}

/**
 * API 响应
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * 用户信息
 */
export interface User {
  id: number
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'user'
  created_at: string
}

/**
 * 登录表单
 */
export interface LoginForm {
  email: string
  password: string
}

/**
 * 上传文件参数
 */
export interface UploadParams {
  file: File
  title: string
  description?: string
  type: 'audio' | 'video' | 'image'
  category: string
}

/**
 * 批量更新参数
 */
export interface BatchUpdateParams {
  ids: number[]
  is_active?: boolean
  sort_order?: number
  category?: string
}

/**
 * 批量删除参数
 */
export interface BatchDeleteParams {
  ids: number[]
}

/**
 * 物料统计
 */
export interface MediaStats {
  total: number
  active: number
  inactive: number
  by_type: {
    audio: number
    video: number
    image: number
  }
  total_size_bytes: number
  total_size_mb: number
}

/**
 * 分类相关类型
 */
export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  type: 'audio' | 'video' | 'image'
  icon?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CategoryCreate {
  name: string
  slug: string
  description?: string
  type: 'audio' | 'video' | 'image'
  icon?: string
  sort_order?: number
  is_active?: boolean
}

export interface CategoryUpdate {
  name?: string
  slug?: string
  description?: string
  type?: 'audio' | 'video' | 'image'
  icon?: string
  sort_order?: number
  is_active?: boolean
}

/**
 * R2 对象信息
 */
export interface R2Object {
  key: string
  size: number
  etag: string
  last_modified: string
  url: string
}

/**
 * R2 列表响应
 */
export interface R2ListResponse {
  success: boolean
  objects: R2Object[]
  count: number
  is_truncated: boolean
  next_token?: string
  prefix: string
}

/**
 * R2 上传响应
 */
export interface R2UploadResponse {
  key: string
  url: string
  size: number
  content_type: string
  etag: string
}

/**
 * R2 统计
 */
export interface R2Stats {
  total_objects: number
  total_size_bytes: number
  total_size_mb: number
  total_size_gb: number
  bucket_name: string
}
