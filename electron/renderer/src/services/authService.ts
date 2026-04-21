import { supabase } from '../supabaseClient'

export const authService = {

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

    await supabase.auth.signOut()

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
  },


  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return true
  },


  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  }
}