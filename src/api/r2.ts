import request from './request'
import type {
  ApiResponse,
  R2ListResponse,
  R2UploadResponse,
  R2Stats,
  R2Object
} from '@/types'

/**
 * 列出 R2 对象
 */
export function listR2Objects(params?: {
  prefix?: string
  max_keys?: number
  continuation_token?: string
}): Promise<ApiResponse<R2ListResponse>> {
  return request.get('/r2/list', { params })
}

/**
 * 获取 R2 对象信息
 */
export function getR2ObjectInfo(key: string): Promise<ApiResponse<R2Object>> {
  return request.get(`/r2/info/${key}`)
}

/**
 * 上传文件到 R2
 */
export function uploadToR2(file: File, category: string): Promise<ApiResponse<R2UploadResponse>> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)

  return request.post('/r2/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 删除 R2 对象
 */
export function deleteR2Object(key: string): Promise<ApiResponse> {
  return request.delete(`/r2/${key}`)
}

/**
 * 批量删除 R2 对象
 */
export function batchDeleteR2Objects(keys: string[]): Promise<ApiResponse> {
  return request.post('/r2/batch-delete', { keys })
}

/**
 * 获取 R2 统计信息
 */
export function getR2Stats(): Promise<ApiResponse<R2Stats>> {
  return request.get('/r2/stats')
}

/**
 * 获取 R2 分类列表
 */
export function getR2Categories(): Promise<ApiResponse<string[]>> {
  return request.get('/r2/categories')
}
