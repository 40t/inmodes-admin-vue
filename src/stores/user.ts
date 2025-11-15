import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, LoginForm } from '../types'
import * as authApi from '../api/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('admin_token'))

  /**
   * 登录
   */
  async function loginAction(form: LoginForm) {
    const res = await authApi.login(form)
    if (res.success && res.data) {
      token.value = res.data.token
      user.value = res.data.user
      localStorage.setItem('admin_token', res.data.token)
    }
    return res
  }

  /**
   * 获取用户信息
   */
  async function getUserInfo() {
    const res = await authApi.getCurrentUser()
    if (res.success && res.data) {
      user.value = res.data
    }
    return res
  }

  /**
   * 登出
   */
  async function logoutAction() {
    await authApi.logout()
    user.value = null
    token.value = null
    localStorage.removeItem('admin_token')
  }

  return {
    user,
    token,
    loginAction,
    getUserInfo,
    logoutAction,
  }
})
