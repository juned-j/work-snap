import { supabase } from '../api/supabase'

const ACTIVITY_INCREMENT_SECONDS = 5

export interface ActivityLogRecord {
  id: number | string
  metadata: Record<string, any>
}

export async function insertActivityEvent(event: {
  userId: string
  sessionId: number
  eventType: string
  metadata: Record<string, any>
}) {
  const timestamp = new Date().toISOString()

  const payload = {
    user_id: event.userId,
    session_id: event.sessionId,
    event_type: event.eventType,
    metadata: {
      ...event.metadata,
      last_update: timestamp
    },
    created_at: timestamp,
    updated_at: timestamp
  }

  const { data, error } = await supabase
    .from('activity_logs')
    .insert(payload)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function insertActivityEvents(events: Array<{
  user_id: string
  session_id: number
  event_type: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}>) {
  if (events.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('activity_logs')
    .insert(events)
    .select()

  if (error) {
    throw error
  }

  return data
}

export async function findAppUsageLog(userId: string, sessionId: number, appName: string, title: string) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('id, metadata')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .eq('event_type', 'app_usage')
    .contains('metadata', { app: appName, title })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as ActivityLogRecord | null
}

export async function updateActivityLog(logId: number | string, metadata: Record<string, any>) {
  const { data, error } = await supabase
    .from('activity_logs')
    .update({
      metadata,
      updated_at: new Date().toISOString()
    })
    .eq('id', logId)
    .select()

  if (error) {
    throw error
  }

  // If no rows were updated, the record might not exist anymore
  if (!data || data.length === 0) {
    console.warn('⚠️ No activity log found to update with ID:', logId)
    return null
  }

  return data[0]
}

export async function upsertAppUsage(params: {
  userId: string
  sessionId: number
  appName: string
  title: string
  idleTime: number
  isActive: boolean
  status: string
  durationSeconds?: number
}) {
  const durationSeconds = params.durationSeconds ?? ACTIVITY_INCREMENT_SECONDS

  // For now, always create new records to avoid RLS update issues
  // TODO: Implement proper upsert when RLS policies are fixed
  console.log('📝 Creating new activity log record (bypassing update for now)')

  return insertActivityEvent({
    userId: params.userId,
    sessionId: params.sessionId,
    eventType: 'app_usage',
    metadata: {
      app: params.appName,
      title: params.title,
      duration: durationSeconds,
      idle_time: params.idleTime,
      is_active: params.isActive,
      status: params.status,
      started_at: new Date().toISOString()
    }
  })
}
