import { supabase } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface WorkSession {
  id: string
  user_id: string
  start_time: string
  end_time?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Screenshot {
  id: string
  session_id: string
  user_id: string
  image_url: string
  captured_at: string
  created_at: string
}

class SupabaseSessionService {
  private currentSession: WorkSession | null = null
  private realtimeChannel: RealtimeChannel | null = null

  // Session Management
  async startSession(): Promise<{ session: WorkSession | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if there's already an active session
      const { data: existingSession } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (existingSession) {
        this.currentSession = existingSession
        return { session: existingSession, error: null }
      }

      // Create new session
      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          start_time: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      this.currentSession = session
      this.setupRealtimeSubscription(session.id)

      return { session, error: null }
    } catch (error) {
      console.error('Error starting session:', error)
      return { session: null, error }
    }
  }

  async pauseSession(): Promise<{ success: boolean; error: any }> {
    if (!this.currentSession) return { success: false, error: 'No active session' }

    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentSession.id)

      if (error) throw error

      this.currentSession.is_active = false
      return { success: true, error: null }
    } catch (error) {
      console.error('Error pausing session:', error)
      return { success: false, error }
    }
  }

  async resumeSession(): Promise<{ success: boolean; error: any }> {
    if (!this.currentSession) return { success: false, error: 'No active session' }

    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentSession.id)

      if (error) throw error

      this.currentSession.is_active = true
      return { success: true, error: null }
    } catch (error) {
      console.error('Error resuming session:', error)
      return { success: false, error }
    }
  }

  async stopSession(): Promise<{ success: boolean; error: any }> {
    if (!this.currentSession) return { success: false, error: 'No active session' }

    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          is_active: false,
          end_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentSession.id)

      if (error) throw error

      this.cleanupRealtimeSubscription()
      this.currentSession = null

      return { success: true, error: null }
    } catch (error) {
      console.error('Error stopping session:', error)
      return { success: false, error }
    }
  }

  async getCurrentSession(): Promise<{ session: WorkSession | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { session: null, error: 'Not authenticated' }

      const { data: session, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows

      this.currentSession = session || null
      if (session) {
        this.setupRealtimeSubscription(session.id)
      }

      return { session: session || null, error: null }
    } catch (error) {
      console.error('Error getting current session:', error)
      return { session: null, error }
    }
  }

  // Screenshot Management
  async uploadScreenshot(imageData: string, sessionId?: string): Promise<{ screenshot: Screenshot | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const currentSessionId = sessionId || this.currentSession?.id
      if (!currentSessionId) throw new Error('No active session')

      // Convert base64 to blob
      const base64Data = imageData.replace(/^data:image\/png;base64,/, '')
      const binaryData = atob(base64Data)
      const bytes = new Uint8Array(binaryData.length)
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'image/png' })

      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `screenshots/${user.id}/${timestamp}.png`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filename, blob, {
          contentType: 'image/png',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filename)

      // Save screenshot record to database
      const { data: screenshot, error: dbError } = await supabase
        .from('screenshots')
        .insert({
          session_id: currentSessionId,
          user_id: user.id,
          image_url: publicUrl,
          captured_at: new Date().toISOString()
        })
        .select()
        .single()

      if (dbError) throw dbError

      return { screenshot, error: null }
    } catch (error) {
      console.error('Error uploading screenshot:', error)
      return { screenshot: null, error }
    }
  }

  // Get session screenshots
  async getSessionScreenshots(sessionId: string): Promise<{ screenshots: Screenshot[]; error: any }> {
    try {
      const { data: screenshots, error } = await supabase
        .from('screenshots')
        .select('*')
        .eq('session_id', sessionId)
        .order('captured_at', { ascending: false })

      if (error) throw error

      return { screenshots: screenshots || [], error: null }
    } catch (error) {
      console.error('Error getting session screenshots:', error)
      return { screenshots: [], error }
    }
  }

  // Get user sessions
  async getUserSessions(limit = 50): Promise<{ sessions: WorkSession[]; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { sessions: [], error: 'Not authenticated' }

      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return { sessions: sessions || [], error: null }
    } catch (error) {
      console.error('Error getting user sessions:', error)
      return { sessions: [], error }
    }
  }

  // Real-time subscription for session updates
  private setupRealtimeSubscription(sessionId: string) {
    this.cleanupRealtimeSubscription()

    this.realtimeChannel = supabase
      .channel(`session-${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`
      }, (payload) => {
        console.log('Session update:', payload)
        if (payload.new) {
          this.currentSession = payload.new as WorkSession
        }
      })
      .subscribe()
  }

  private cleanupRealtimeSubscription() {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel)
      this.realtimeChannel = null
    }
  }

  // Cleanup
  destroy() {
    this.cleanupRealtimeSubscription()
    this.currentSession = null
  }

  getCurrentSessionData(): WorkSession | null {
    return this.currentSession
  }
}

// Export singleton instance
export const sessionService = new SupabaseSessionService()