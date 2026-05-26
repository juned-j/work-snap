export function calculateSessionElapsedSeconds(
  startTime: string,
  endTime?: string,
  status?: string,
  pausedAt?: string,
  totalPausedSeconds: number = 0,

  // ✅ VALIDATION
  currentUserId?: string,
  sessionUserId?: string,
  currentSessionId?: number | string,
  sessionId?: number | string
): number {

  console.log('🟡 ====================================')
  console.log('🟡 CALCULATE SESSION START')

  console.log('🟡 startTime:', startTime)
  console.log('🟡 endTime:', endTime)
  console.log('🟡 status:', status)
  console.log('🟡 pausedAt:', pausedAt)
  console.log('🟡 totalPausedSeconds:', totalPausedSeconds)

  console.log('🟣 currentUserId:', currentUserId)
  console.log('🟣 sessionUserId:', sessionUserId)

  console.log('🟣 currentSessionId:', currentSessionId)
  console.log('🟣 sessionId:', sessionId)

  // ✅ USER VALIDATION
  if (
    currentUserId &&
    sessionUserId &&
    currentUserId !== sessionUserId
  ) {

    console.log('❌ USER ID MISMATCH')
    console.log('❌ TIMER BLOCKED')

    return 0
  }

  // ✅ SESSION VALIDATION
  if (
    currentSessionId &&
    sessionId &&
    String(currentSessionId) !== String(sessionId)
  ) {

    console.log('❌ SESSION ID MISMATCH')
    console.log('❌ TIMER BLOCKED')

    return 0
  }

  // ✅ START TIME
  const startDate = new Date(startTime)

  console.log('🟢 startDate:', startDate)
  console.log('🟢 startDate ISO:', startDate.toISOString())

  const startMs = startDate.getTime()

  console.log('🟢 startMs:', startMs)

  // ❌ INVALID START
  if (isNaN(startMs)) {

    console.log('❌ INVALID START TIME')

    return 0
  }

  let finalEndTime: string | undefined

  // ✅ PAUSED SESSION
  if (
    status === 'paused' &&
    pausedAt
  ) {

    console.log('⏸️ PAUSED SESSION DETECTED')

    finalEndTime = pausedAt

  } else if (endTime) {

    console.log('🛑 USING endTime')

    finalEndTime = endTime

  } else {

    console.log('▶️ ACTIVE SESSION USING CURRENT TIME')

    finalEndTime = new Date().toISOString()
  }

  console.log('🛡️ finalEndTime RAW:', finalEndTime)

  // ✅ IMPORTANT FIX
  // DB time without timezone issue fix
  let normalizedEndTime = finalEndTime

  if (
    normalizedEndTime &&
    !normalizedEndTime.includes('Z') &&
    !normalizedEndTime.includes('+')
  ) {

    normalizedEndTime =
      normalizedEndTime + 'Z'

    console.log(
      '🛠️ Added UTC timezone to endTime:',
      normalizedEndTime
    )
  }

  const endDate = new Date(
    normalizedEndTime as string
  )

  console.log('🟢 endDate:', endDate)
  console.log('🟢 endDate ISO:', endDate.toISOString())

  const endMs = endDate.getTime()

  console.log('🟢 endMs:', endMs)

  // ❌ INVALID END
  if (isNaN(endMs)) {

    console.log('❌ INVALID END TIME')

    return 0
  }

  // ✅ MAIN FIX
  // timezone issue detection
  if (endMs < startMs) {

    console.log('❌ END TIME SMALLER THAN START TIME')
    console.log('❌ startMs:', startMs)
    console.log('❌ endMs:', endMs)

    console.log(
      '🛠️ POSSIBLE TIMEZONE ISSUE DETECTED'
    )

    // TRY LOCAL TIME FIX
    const fixedEndDate =
      new Date(
        normalizedEndTime!.replace('Z', '')
      )

    const fixedEndMs =
      fixedEndDate.getTime()

    console.log('🛠️ fixedEndDate:', fixedEndDate)
    console.log('🛠️ fixedEndMs:', fixedEndMs)

    if (fixedEndMs > startMs) {

      console.log(
        '✅ LOCAL TIME FIX SUCCESS'
      )

      let fixedSeconds =
        Math.floor(
          (fixedEndMs - startMs) / 1000
        )

      console.log(
        '🟢 FIXED RAW SECONDS:',
        fixedSeconds
      )

      fixedSeconds -= Number(
        totalPausedSeconds || 0
      )

      console.log(
        '🟢 FIXED AFTER PAUSED SUBTRACT:',
        fixedSeconds
      )

      fixedSeconds =
        Math.max(0, fixedSeconds)

      console.log(
        '✅ FINAL FIXED TOTAL SECONDS:',
        fixedSeconds
      )

      console.log('🟡 ====================================')

      return fixedSeconds
    }

    console.log(
      '❌ LOCAL TIME FIX FAILED'
    )

    return 0
  }

  // ✅ NORMAL FLOW
  let totalSeconds =
    Math.floor(
      (endMs - startMs) / 1000
    )

  console.log(
    '🟢 RAW TOTAL SECONDS:',
    totalSeconds
  )

  // ✅ REMOVE PAUSED TIME
  totalSeconds -= Number(
    totalPausedSeconds || 0
  )

  console.log(
    '🟢 AFTER PAUSED SUBTRACT:',
    totalSeconds
  )

  totalSeconds =
    Math.max(0, totalSeconds)

  console.log(
    '✅ FINAL TOTAL SECONDS:',
    totalSeconds
  )

  console.log('🟡 ====================================')

  return totalSeconds
}