import { sessionService } from '../sessionService'
import { isSameCalendarDay } from './isSameCalendarDay'
import { getEndOfDayISOString } from './getEndOfDayISOString'
import { calculateSessionElapsedSeconds } from './calculateSessionElapsedSeconds'

export async function loadSessionState(userId: string) {

  console.log('🟡 ========================================================')
  console.log('🟡 [LOAD STATE] ENGINE TRIGGERED')
  console.log('👤 Target userId:', userId)

  const latest = await sessionService.getLatestSession(userId)

  console.log('📦 [DB FRESH FETCHED DATA]:', JSON.stringify(latest, null, 2))

  // =========================================================
  // ✅ NO SESSION FOUND
  // =========================================================
  if (!latest) {
    console.log('⚪ [LOAD STATE] Zero session rows returned from service layer.')
    return {
      session: null,
      status: 'idle' as const,
      elapsedTime: 0
    }
  }

  // =========================================================
  // ✅ SESSION DATE VALIDATION
  // =========================================================
  const sessionDate = new Date(latest.start_time)
  const today = new Date()

  console.log('📅 [RAW DATA TIMESTAMPS]:')
  console.log('   👉 latest.start_time (String):', latest.start_time)
  console.log('   👉 sessionDate (Parsed JS Date):', sessionDate.toISOString())
  console.log('   👉 sessionDate.getTime() (Epoch):', sessionDate.getTime())
  console.log('   👉 Current Time (Date.now()):', Date.now(), ' -> ', today.toISOString())

  const isToday = isSameCalendarDay(sessionDate, today)
  console.log('✅ [LOAD STATE] isToday:', isToday)

  // =========================================================
  // ✅ AUTO STOP OLD DAY SESSION
  // =========================================================
  if (!isToday) {
    console.log('🛑 [LOAD STATE] Old session detected. Auto stopping.')
    const endOfDay = getEndOfDayISOString(sessionDate)
    console.log('Midnight [LOAD STATE] endOfDay:', endOfDay)

    await sessionService.updateSession(latest.id, {
      end_time: endOfDay,
      is_active: false,
      status: 'stopped'
    })

    console.log('✅ [LOAD STATE] Old session auto stopped.')
    return {
      session: null,
      status: 'idle' as const,
      elapsedTime: 0
    }
  }

  // =========================================================
  // ✅ STATE NORMALIZATION
  // =========================================================
  const isPaused = latest.status === 'paused' && !latest.is_active
  const isActive = latest.status === 'active' && latest.is_active

  console.log('🎯 [DB STATUS NORMALIZATION]:')
  console.log('   👉 latest.status from DB:', latest.status)
  console.log('   👉 latest.is_active from DB:', latest.is_active)
  console.log('   👉 Evaluated -> isPaused:', isPaused)
  console.log('   👉 Evaluated -> isActive:', isActive)

  let safeEndTime: string | undefined = undefined
  let safePausedAt: string | undefined = undefined

  // =========================================================
  // ✅ CACHE RECOVERY
  // =========================================================
  const cacheKey = `worksnap_elapsed_${latest.id}`
  let cachedElapsedSeconds = 0
  let cachedSavedAt = 0

  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(cacheKey)
      console.log('💾 [BROWSER CACHE CHECK]: Raw data string from sessionStorage:', raw)

      if (raw) {
        const parsed = JSON.parse(raw)
        cachedElapsedSeconds = Number(parsed?.elapsedSeconds || 0)
        cachedSavedAt = Number(parsed?.savedAt || 0)
        
        console.log('💾 [BROWSER CACHE PARSED]:')
        console.log('   👉 cachedElapsedSeconds (Screen Time stored):', cachedElapsedSeconds)
        console.log('   👉 cachedSavedAt (Last updated timestamp):', cachedSavedAt)
      }
    } catch (err) {
      console.warn('⚠️ [LOAD STATE] Invalid cached elapsed data ignored.', err)
    }
  }

  // =========================================================
  // ✅ SAFE PAUSED SECONDS + AUTO DATABASE HEALING 🔥
  // =========================================================
  const sessionAgeSeconds = Math.max(
    0,
    Math.floor((Date.now() - sessionDate.getTime()) / 1000)
  )

  console.log('📊 [CRITICAL RAW TIMELINE METRICS]:')
  console.log('   👉 sessionAgeSeconds (Total gap since day start till now):', sessionAgeSeconds)
  console.log('   👉 latest.total_paused_seconds from DB:', latest.total_paused_seconds)

  let safePausedSeconds = Number(latest.total_paused_seconds || 0)
  let needsDbHealing = false

  // invalid number protection
  if (!Number.isFinite(safePausedSeconds) || safePausedSeconds < 0) {
    console.warn('🚨 [LOAD STATE] Invalid paused seconds detected.')
    safePausedSeconds = 0
    needsDbHealing = true
  }

  // corruption protection (Jo aapka 3 lakh seconds ka bug handle kar raha hai)
  if (safePausedSeconds > sessionAgeSeconds) {
    console.warn('🚨 [LOAD STATE] Corrupted paused seconds detected on reload. Triggering DB self-healing sync...')
    safePausedSeconds = 0
    needsDbHealing = true
  }
  
  // 🔥 AUTO HEAL THE DB ROW IMMEDIATELY!
  if (needsDbHealing) {
    try {
      console.log(`🩹 [SELF-HEALING] Syncing fixed safePausedSeconds (0) to DB for Session #${latest.id}...`);
      await sessionService.updateSession(latest.id, {
        total_paused_seconds: 0
      });
      latest.total_paused_seconds = 0;
      console.log('✅ [SELF-HEALING SUCCESS] Database successfully synchronized and repaired!');
    } catch (healError) {
      console.error('❌ [SELF-HEALING FAILED] Could not repair the DB corrupt row:', healError);
    }
  }
  
  console.log('   👉 safePausedSeconds (After validation cleanup):', safePausedSeconds)

  // =========================================================
  // ✅ PAUSED SESSION
  // =========================================================
  if (isPaused) {
    console.log('⏸️ [LOAD STATE] PAUSED SESSION DETECTED')
    safePausedAt = latest.paused_at || latest.updated_at || latest.end_time
    safeEndTime = safePausedAt
    console.log('🛡️ [LOAD STATE] Pause freeze boundary:', safePausedAt)
  }

  // =========================================================
  // ✅ ACTIVE SESSION + RESUME JUMP FLUSHING ENGINE 🚀
  // =========================================================
  if (isActive) {
    console.log('▶️ [LOAD STATE] ACTIVE SESSION DETECTED')
    safePausedAt = undefined
    safeEndTime = undefined
    console.log('🧹 [LOAD STATE] Cleared stale paused/end references.')

    if (cachedElapsedSeconds > 0 && cachedSavedAt > 0) {
      const extraSeconds = Math.max(0, Math.floor((Date.now() - cachedSavedAt) / 1000))
      const reloadSafeElapsed = cachedElapsedSeconds + extraSeconds
      const finalReloadElapsed = Math.min(reloadSafeElapsed, sessionAgeSeconds)

      const dbDrivenTimelineTime = Math.max(0, sessionAgeSeconds - safePausedSeconds)
      const variance = Math.abs(finalReloadElapsed - dbDrivenTimelineTime)

      console.log('🚨 [MATH SYNC OVER-LOGGING BLOCKS]:')
      console.log('   👉 extraSeconds (Time spent inside reload black hole):', extraSeconds)
      console.log('   👉 reloadSafeElapsed (Cache + Reload gap):', reloadSafeElapsed)
      console.log('   👉 finalReloadElapsed (Guarded cache time):', finalReloadElapsed)
      console.log('   👉 dbDrivenTimelineTime (Formula Math: Age - DB Paused):', dbDrivenTimelineTime)
      console.log('   👉 VARIANCE DETECTED (Difference between Cache & DB):', variance, 'seconds')

      // 🚨 AGAR VARIANCE 15 SECONDS SE BADHA HAI (JUST RESUMED AND RELOADED LOOPHOLE)
      if (variance > 15) {
        console.warn(`🚨 [CRITICAL ALERT] VARIANCE HIT IS ${variance}s (> 15s)!`);

        // 🔥 CHECK: Agar cache time chota hai DB formula time se, iska matlab DB me pause time add ho gaya hai!
        if (finalReloadElapsed < dbDrivenTimelineTime && finalReloadElapsed > 0) {
          console.log('🚀 [RESUME RELOAD DETECTED] Cache is safer to avoid massive time jump. Returning Cache Time:', finalReloadElapsed);
          
          // Background me DB ko real mathematically correct pause seconds bhej kar fix karo
          const correctedPausedSeconds = Math.max(0, sessionAgeSeconds - finalReloadElapsed);
          sessionService.updateSession(latest.id, {
            total_paused_seconds: correctedPausedSeconds
          }).then(() => {
            console.log(`🩹 [DB RESUME SYNC] Successfully synced missing pause gap (${correctedPausedSeconds}s) to DB.`);
          }).catch(err => {
            console.error("❌ [DB RESUME SYNC FAILED] Couldn't auto-sync paused seconds:", err);
          });

          console.log('🟡 ========================================================')
          return {
            session: { ...latest, total_paused_seconds: correctedPausedSeconds },
            status: 'active' as const,
            elapsedTime: finalReloadElapsed
          }
        }

        // Fallback agar cache available nahi thi ya corrupted thi
        console.log('🚀 Returning DB Driven Time as last resort:', dbDrivenTimelineTime)
        console.log('🟡 ========================================================')
        return {
          session: latest,
          status: 'active' as const,
          elapsedTime: dbDrivenTimelineTime
        }
      }

      console.log('💾 [LOAD STATE - CACHE VERIFIED SUCCESSFUL]')
      return {
        session: latest,
        status: 'active' as const,
        elapsedTime: finalReloadElapsed
      }
    } else {
      console.log('⚠️ [CACHE MISS] active session block has no valid cachedElapsedSeconds or cachedSavedAt.')
    }
  }

  console.log('🛡️ [LOAD STATE] Final safeEndTime:', safeEndTime)
  console.log('🛡️ [LOAD STATE] Final safePausedAt:', safePausedAt)

  // =========================================================
  // ✅ CALCULATE TIMER (FALLBACK ENGINE)
  // =========================================================
  console.log('🔄 [FALLBACK ENGINE HIT] Triggering calculateSessionElapsedSeconds function...')

  const elapsedTime = calculateSessionElapsedSeconds({
    startTime: latest.start_time,
    endTime: safeEndTime,
    status: latest.status,
    pausedAt: safePausedAt,
    totalPausedSeconds: safePausedSeconds,
    currentUserId: userId,
    sessionUserId: latest.user_id,
    currentSessionId: latest.id,
    sessionId: latest.id
  })

  console.log('⏱️ [FALLBACK ENGINE RETURNED VALUE] elapsedTime:', elapsedTime)

  // =========================================================
  // ✅ FINAL STATUS
  // =========================================================
  let status: 'active' | 'paused' | 'idle'
  if (isPaused) {
    status = 'paused'
  } else if (isActive) {
    status = 'active'
  } else {
    status = 'idle'
  }

  console.log('🎯 [LOAD STATE] Final status:', status)

  const result = {
    session: latest,
    status,
    elapsedTime
  }

  console.log('✅ [LOAD STATE] Final payload:', result)
  console.log('🟡 ========================================================')

  return result
}