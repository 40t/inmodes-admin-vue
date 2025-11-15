import request from './request'
import type { MediaAsset, PaginatedResponse, ApiResponse, UploadParams } from '@/types'

/**
 * 获取物料资产列表
 */
export function getAssets(params?: {
  page?: number
  limit?: number
  type?: string
  category?: string
  search?: string
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
export function uploadAsset(data: UploadParams): Promise<ApiResponse<MediaAsset>> {
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
