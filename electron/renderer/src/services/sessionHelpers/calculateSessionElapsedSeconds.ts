interface CalculateSessionParams {
  startTime: string
  endTime?: string
  status?: string
  pausedAt?: string
  totalPausedSeconds?: number
  currentUserId?: string
  sessionUserId?: string
  currentSessionId?: number | string
  sessionId?: number | string
}

export function calculateSessionElapsedSeconds({

  startTime,
  endTime,
  status,
  pausedAt,
  totalPausedSeconds = 0,
  currentUserId,
  sessionUserId,
  currentSessionId,
  sessionId

}: CalculateSessionParams): number {

  console.log('🟡 ====================================')
  console.log('🟡 [CALCULATE] FUNCTION ENGINE START')

  console.log('🔹 startTime:', startTime)
  console.log('🔹 endTime:', endTime)
  console.log('🔹 status:', status)
  console.log('🔹 pausedAt:', pausedAt)
  console.log('🔹 totalPausedSeconds:', totalPausedSeconds)

  // =========================================================
  // ✅ USER VALIDATION
  // =========================================================

  if (
    currentUserId &&
    sessionUserId &&
    currentUserId !== sessionUserId
  ) {

    console.log('❌ USER ID MISMATCH')

    return 0
  }

  // =========================================================
  // ✅ SESSION VALIDATION
  // =========================================================

  if (
    currentSessionId &&
    sessionId &&
    String(currentSessionId) !== String(sessionId)
  ) {

    console.log('❌ SESSION ID MISMATCH')

    return 0
  }

  // =========================================================
  // ✅ START DATE
  // =========================================================

  const startDate = new Date(startTime)

  const startMs = startDate.getTime()

  if (isNaN(startMs)) {

    console.log('❌ INVALID START TIME')

    return 0
  }

  // =========================================================
  // ✅ ACTIVE SESSION SAFETY FIX
  // =========================================================

  if (status === 'active') {

    // active session me stale values ignore

    pausedAt = undefined
    endTime = undefined
  }

  // =========================================================
  // ✅ DETERMINE FINAL END TIME
  // =========================================================

  let finalEndTime: string

  const isPaused = status === 'paused'

  if (isPaused) {

    console.log('⏸️ PAUSED SESSION')

    finalEndTime =
      pausedAt ||
      endTime ||
      new Date().toISOString()

  } else {

    console.log('▶️ ACTIVE SESSION')

    // ✅ ALWAYS LIVE TIME
    finalEndTime = new Date().toISOString()
  }

  console.log('🛡️ finalEndTime:', finalEndTime)

  // =========================================================
  // ✅ TIME NORMALIZATION
  // =========================================================

  let normalizedEndTime = finalEndTime

  if (
    normalizedEndTime &&
    !normalizedEndTime.includes('Z') &&
    !normalizedEndTime.includes('+')
  ) {

    normalizedEndTime += 'Z'

    console.log('🛠️ UTC FIX APPLIED:', normalizedEndTime)
  }

  const endDate = new Date(normalizedEndTime)

  let endMs = endDate.getTime()

  if (isNaN(endMs)) {

    console.log('❌ INVALID END TIME')

    return 0
  }

  // =========================================================
  // ✅ BACKWARD TIMELINE FIX
  // =========================================================

  if (endMs < startMs) {

    console.log('⚠️ BACKWARD TIMELINE DETECTED')

    const fixedDate = new Date(
      normalizedEndTime.replace('Z', '')
    )

    const fixedMs = fixedDate.getTime()

    if (fixedMs > startMs) {

      console.log('✅ LOCAL TIME FIX SUCCESS')

      endMs = fixedMs

    } else {

      console.log('❌ INVALID TIMELINE')

      return 0
    }
  }

  // =========================================================
  // ✅ RAW DURATION
  // =========================================================

  const totalRawSeconds = Math.floor(
    (endMs - startMs) / 1000
  )

  console.log('📊 totalRawSeconds:', totalRawSeconds)

  // =========================================================
  // ✅ SAFE PAUSED SECONDS
  // =========================================================

  let safePausedSeconds = Number(
    totalPausedSeconds || 0
  )

  if (safePausedSeconds < 0) {

    console.log('⚠️ NEGATIVE PAUSED SECONDS FIXED')

    safePausedSeconds = 0
  }

  // ✅ CORRUPT DB FIX

  if (safePausedSeconds > totalRawSeconds) {

    console.log('🚨 CORRUPT PAUSED DATA DETECTED')

    console.log(
      `Paused: ${safePausedSeconds} > Raw: ${totalRawSeconds}`
    )

    safePausedSeconds = 0
  }

  console.log('🧮 safePausedSeconds:', safePausedSeconds)

  // =========================================================
  // ✅ FINAL TIME
  // =========================================================

  let finalSeconds =
    totalRawSeconds - safePausedSeconds

  finalSeconds = Math.max(0, finalSeconds)

  console.log('🚀 FINAL SECONDS:', finalSeconds)

  console.log('🟡 ====================================')

  return finalSeconds
}