import request from './request'
import type { LoginForm, User, ApiResponse } from '../types'

/**
 * 登录
 */
export function login(data: LoginForm): Promise<ApiResponse<{ token: string; user: User }>> {
  return request.post('/auth/login', data)
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): Promise<ApiResponse<User>> {
  return request.get('/auth/me')
}

/**
 * 登出
 */
export function logout(): Promise<ApiResponse> {
  return request.post('/auth/logout')
}
