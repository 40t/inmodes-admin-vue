/**
 * 物料资产类型定义
 */
export interface MediaAsset {
  id: number
  title: string
  description?: string
  type: 'audio' | 'video' | 'image'
  category: string
  url: string
  thumbnail?: string
  file_size?: number
  duration?: number
  extra_data?: Record<string, any>
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
