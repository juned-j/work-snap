export function normalizeAppName(name: string): string {
  if (!name) return 'Unknown'
  const lower = name.trim().toLowerCase()

  if (lower.includes('visual studio code') || lower.includes('vscode')) return 'Visual Studio Code'
  if (lower.includes('chrome')) return 'Chrome'
  if (lower.includes('edge')) return 'Edge'
  if (lower.includes('firefox')) return 'Firefox'
  if (lower.includes('safari') && !lower.includes('visual studio')) return 'Safari'
  if (lower.includes('notepad')) return 'Notepad'
  if (lower.includes('terminal') || lower.includes('powershell') || lower.includes('cmd')) return 'Terminal'
  if (lower.includes('explorer')) return 'Explorer'

  return name
}

export function parseBrowserUrl(title: string): string | null {
  if (!title) return null

  const urlMatch = title.match(/https?:\/\/[^\s|–-]+/i)
  if (urlMatch) return urlMatch[0]

  const separator = title.includes(' - ') ? ' - ' : title.includes(' | ') ? ' | ' : null
  if (separator) {
    const candidate = title.split(separator).pop()?.trim() || ''
    if (candidate.includes('.') && !candidate.toLowerCase().startsWith('http')) {
      return candidate
    }
  }

  return null
}

export function buildActivityMetadata(payload: any) {
  const appName = normalizeAppName(payload.appName || payload.app || 'Unknown')
  const title = payload.windowTitle || payload.title || 'Unknown'
  const url = parseBrowserUrl(title)

  const metadata: Record<string, any> = {
    app: appName,
    title,
    idle_time: payload.idleTime ?? payload.idle_time ?? null,
    is_active: payload.isActive ?? null,
    status: payload.status ?? null,
    owner_name: payload.owner?.name ?? null,
    owner_path: payload.owner?.path ?? null,
    event_reason: payload.reason ?? null,
    browser_url: url ?? null,
  }

  if (!metadata.browser_url) {
    delete metadata.browser_url
  }

  return metadata
}
