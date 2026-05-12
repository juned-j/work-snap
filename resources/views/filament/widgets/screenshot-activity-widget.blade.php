<div wire:poll.5000ms class="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <p class="text-xs uppercase tracking-[0.24em] text-slate-500">Notifications</p>
            <h2 class="mt-2 text-2xl font-semibold text-slate-900">Live screenshot alerts</h2>
        </div>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">Updating every 5s</span>
    </div>

    <div class="mt-6 grid gap-4">
        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-sm font-semibold text-slate-900">Screenshots today</p>
            <p class="text-3xl font-bold text-slate-900">{{ $todayCount ?? 0 }}</p>
        </div>

        @if($lastScreenshot)
            <div class="rounded-3xl border border-slate-200 bg-white p-4">
                <p class="text-sm text-slate-500">Last captured</p>
                <p class="font-semibold text-slate-900">{{ $lastScreenshot->captured_at?->format('M d, Y H:i') }}</p>
                <p class="text-xs text-slate-500">Employee: {{ $lastScreenshot->user?->name ?? 'Unknown' }}</p>
                <p class="text-xs text-slate-500">Session: #{{ $lastScreenshot->session_id }}</p>
            </div>
        @endif
    </div>
</div>
