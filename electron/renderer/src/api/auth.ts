import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface Profile {
  id: string
  name: string
  email: string
  role: 'admin' | 'employee'
}

export interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
}

class SupabaseAuthService {
  private authState: AuthState = {
    user: null,
    profile: null,
    session: null,
    loading: true
  }

  private listeners: ((state: AuthState) => void)[] = []

  constructor() {
    // Initialize auth state
    this.initializeAuth()

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)

      this.authState.session = session
      this.authState.user = session?.user || null

      if (session?.user) {
        // Fetch profile when user is authenticated
        await this.fetchProfile(session.user.id)
      } else {
        this.authState.profile = null
      }

      this.authState.loading = false
      this.notifyListeners()
    })
  }

  private async initializeAuth() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error

      this.authState.session = session
      this.authState.user = session?.user || null

      if (session?.user) {
        await this.fetchProfile(session.user.id)
      }

      this.authState.loading = false
      this.notifyListeners()
    } catch (error) {
      console.error('Error initializing auth:', error)
      this.authState.loading = false
      this.notifyListeners()
    }
  }

  private async fetchProfile(userId: string) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      this.authState.profile = profile
    } catch (error) {
      console.error('Error fetching profile:', error)
      this.authState.profile = null
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState))
  }

  // Public methods
  async signUp(email: string, password: string, name: string, role: 'admin' | 'employee' = 'employee') {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    }
  }

  onAuthStateChange(listener: (state: AuthState) => void) {
    this.listeners.push(listener)
    // Immediately call with current state
    listener(this.authState)

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  getCurrentState(): AuthState {
    return { ...this.authState }
  }

  getProfile(): Profile | null {
    return this.authState.profile
  }

  getUser(): User | null {
    return this.authState.user
  }

  isAuthenticated(): boolean {
    return !!this.authState.user
  }

  isAdmin(): boolean {
    return this.authState.profile?.role === 'admin'
  }

  isEmployee(): boolean {
    return this.authState.profile?.role === 'employee'
  }
}

// Export singleton instance
export const authService = new SupabaseAuthService()