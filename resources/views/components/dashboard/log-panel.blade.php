@props(['logs'])

<div class="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
    <div class="border-b border-slate-200 p-6">
        <p class="text-sm font-semibold uppercase tracking-[0.32em] text-slate-400">Activity</p>
        <h2 class="mt-3 text-2xl font-black text-slate-900">Recent logs</h2>
    </div>

    <div class="space-y-4 p-6">
        @forelse ($logs as $log)
            <div class="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <p class="font-semibold text-slate-900">{{ $log->message }}</p>
                <p class="mt-2 text-xs text-slate-500">{{ $log->created_at->diffForHumans() }}</p>
            </div>
        @empty
            <p class="text-sm text-slate-500">No activity logs yet. Start a session to see the recent history here.</p>
        @endforelse
    </div>
</div>
