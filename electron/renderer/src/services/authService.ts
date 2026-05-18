import { supabase } from '../api/supabase'
import { login as laravelLogin, register as laravelRegister, logout as laravelLogout } from '../api/laravel'

export const authService = {

  async registerUser(formData: any) {
    const response = await laravelRegister(
      formData.name.trim(),
      formData.email.trim(),
      formData.password.trim()
    )

    sessionStorage.setItem('auth_token', response.token)
    sessionStorage.setItem('auth_user', JSON.stringify(response.user))

    return response
  },

  async login(formData: any) {
    const response = await laravelLogin(formData.email.trim(), formData.password.trim())

    sessionStorage.setItem('auth_token', response.token)
    sessionStorage.setItem('auth_user', JSON.stringify(response.user))

    return response
  },

  async verifyEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.trim())
      .maybeSingle()

    if (error) throw error
    return Boolean(data)
  },

  async sendPasswordReset(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim())
    if (error) throw error
    return data
  },

  async logout() {
    try {
      await laravelLogout()
    } catch (error) {
      console.warn('Laravel logout failed:', error)
    }

    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_user')

    return true
  },

  async getCurrentSession() {
    const token = sessionStorage.getItem('auth_token')
    const userJson = sessionStorage.getItem('auth_user')
    const user = userJson ? JSON.parse(userJson) : null

    return { token, user }
  }
}