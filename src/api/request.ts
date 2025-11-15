import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

// 自定义 Axios 实例类型，响应拦截器返回 response.data
interface CustomAxiosInstance extends AxiosInstance {
  get<T = any>(url: string, config?: any): Promise<T>
  post<T = any>(url: string, data?: any, config?: any): Promise<T>
  put<T = any>(url: string, data?: any, config?: any): Promise<T>
  delete<T = any>(url: string, config?: any): Promise<T>
}

/**
 * 计算基础接口地址
 * - 优先使用环境变量
 * - 自动把旧端口（8080 / 8882 之前的 882）转换成最新约定
 * - 如果没有配置，则根据当前页面端口推导
 */
function resolveBaseURL() {
  const envBase = import.meta.env.VITE_API_URL as string | undefined
  if (envBase) {
    return envBase
      .replace('localhost:8080', 'localhost:8882')
      .replace('localhost:882', 'localhost:8882')
  }

  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    if (origin.includes(':8881')) {
      return origin.replace(':8881', ':8882') + '/api/v1'
    }
  }

  return 'http://localhost:8882/api/v1'
}

/**
 * 创建 Axios 实例
 */
const request = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
}) as CustomAxiosInstance

/**
 * 请求拦截器
 */
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 */
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      '请求失败'

    // 401 跳转登录
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    } else {
      ElMessage.error(message)
    }

    return Promise.reject(error)
  }
)

export default request
