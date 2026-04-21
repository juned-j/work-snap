import { supabase } from '../supabaseClient'

export const authService = {
  /**
   * Naya user register karta hai aur custom users table mein entry karta hai
   */
  async registerUser(formData: any) {
    // 1. Create Auth User in Supabase
    const { data, error } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password.trim(),
      options: {
        data: { name: formData.name }
      }
    })

    if (error) throw error
    if (!data.user) throw new Error("Registration failed: User not found")

    // 2. Auto-login rokne ke liye session clear karein
    await supabase.auth.signOut()

    // 3. Custom 'users' table mein entry insert karein
    const { error: dbError } = await supabase
      .from('users')
      .upsert({
        id: data.user.id,
        name: formData.name,
        email: formData.email.trim()
      })

    if (dbError) throw dbError

    return data.user
  },

  async login(formData: any) {
     const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password.trim(),
     })
     if (error) throw error
     return data
  }
}