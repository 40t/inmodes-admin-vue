import request from './request'
import type { Category, CategoryCreate, CategoryUpdate, PaginatedResponse, ApiResponse } from '@/types'

/**
 * 获取分类列表(分页)
 */
export function getCategories(params?: {
  page?: number
  limit?: number
  type?: string
  is_active?: boolean
  search?: string
}) {
  return request.get<PaginatedResponse<Category>>('/categories', { params })
}

/**
 * 获取所有分类(不分页,用于下拉选择)
 */
export function getAllCategories(params?: {
  type?: string
  is_active?: boolean
}) {
  return request.get<ApiResponse<Category[]>>('/categories/all', { params })
}

/**
 * 获取单个分类
 */
export function getCategory(id: number) {
  return request.get<ApiResponse<Category>>(`/categories/${id}`)
}

/**
 * 创建分类
 */
export function createCategory(data: CategoryCreate) {
  return request.post<ApiResponse<Category>>('/categories', data)
}

/**
 * 更新分类
 */
export function updateCategory(id: number, data: CategoryUpdate) {
  return request.put<ApiResponse<Category>>(`/categories/${id}`, data)
}

/**
 * 删除分类
 */
export function deleteCategory(id: number) {
  return request.delete<ApiResponse>(`/categories/${id}`)
}

/**
 * 批量更新分类
 */
export function batchUpdateCategories(data: {
  ids: number[]
  is_active?: boolean
  sort_order?: number
}) {
  return request.post<ApiResponse>('/categories/batch-update', data)
}

/**
 * 批量删除分类
 */
export function batchDeleteCategories(data: { ids: number[] }) {
  return request.post<ApiResponse>('/categories/batch-delete', data)
}

/**
 * 切换分类激活状态
 */
export function toggleCategoryActive(id: number) {
  return request.put<ApiResponse<Category>>(`/categories/${id}/toggle-active`)
}
