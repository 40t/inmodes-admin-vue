import request from './request'
import type {
  MediaAsset,
  PaginatedResponse,
  ApiResponse,
  UploadParams,
  BatchUpdateParams,
  BatchDeleteParams,
  MediaStats
} from '@/types'

/**
 * 获取物料资产列表
 */
export function getAssets(params?: {
  page?: number
  limit?: number
  type?: string
  category?: string
  search?: string
  is_active?: boolean
  order_by?: string
  order_dir?: 'asc' | 'desc'
}): Promise<PaginatedResponse<MediaAsset>> {
  return request.get('/media', { params })
}

/**
 * 获取单个物料资产
 */
export function getAsset(id: number): Promise<ApiResponse<MediaAsset>> {
  return request.get(`/media/${id}`)
}

/**
 * 上传物料资产
 */
export function uploadAsset(
  data: UploadParams,
  onProgress?: (progressEvent: any) => void
): Promise<ApiResponse<MediaAsset>> {
  const formData = new FormData()
  formData.append('file', data.file)
  formData.append('title', data.title)
  if (data.description) formData.append('description', data.description)
  formData.append('type', data.type)
  formData.append('category', data.category)

  return request.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 300000, // 5分钟超时
    onUploadProgress: onProgress,
  })
}

/**
 * 重新上传物料文件
 */
export function reuploadAsset(
  id: number,
  file: File,
  onProgress?: (progressEvent: any) => void
): Promise<ApiResponse<MediaAsset>> {
  const formData = new FormData()
  formData.append('file', file)

  return request.post(`/media/${id}/reupload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 300000, // 5分钟超时
    onUploadProgress: onProgress,
  })
}

/**
 * 更新物料资产
 */
export function updateAsset(
  id: number,
  data: Partial<MediaAsset>
): Promise<ApiResponse<MediaAsset>> {
  return request.put(`/media/${id}`, data)
}

/**
 * 删除物料资产
 */
export function deleteAsset(id: number): Promise<ApiResponse> {
  return request.delete(`/media/${id}`)
}

/**
 * 批量更新物料资产
 */
export function batchUpdateAssets(data: BatchUpdateParams): Promise<ApiResponse> {
  return request.post('/media/batch-update', data)
}

/**
 * 批量删除物料资产
 */
export function batchDeleteAssets(data: BatchDeleteParams): Promise<ApiResponse> {
  return request.post('/media/batch-delete', data)
}

/**
 * 切换物料激活状态
 */
export function toggleAssetActive(id: number): Promise<ApiResponse<MediaAsset>> {
  return request.put(`/media/${id}/toggle-active`)
}

/**
 * 更新物料排序
 */
export function updateAssetSortOrder(id: number, sortOrder: number): Promise<ApiResponse<MediaAsset>> {
  return request.put(`/media/${id}/sort-order`, null, {
    params: { sort_order: sortOrder }
  })
}

/**
 * 获取物料分类列表
 */
export function getCategories(type?: string): Promise<ApiResponse<string[]>> {
  return request.get('/media/categories', { params: { type } })
}

/**
 * 获取物料统计信息
 */
export function getMediaStats(): Promise<ApiResponse<MediaStats>> {
  return request.get('/media/stats')
}
