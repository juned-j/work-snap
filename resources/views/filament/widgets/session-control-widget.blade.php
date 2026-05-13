<div
    x-data="{ showModal: @entangle('showConfirmModal') }"
    class="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm"
>

    <!-- HEADER -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <p class="text-xs uppercase tracking-[0.24em] text-slate-500 font-bold">
                Session Control
            </p>

            <h2 class="mt-2 text-2xl font-semibold text-slate-900">
                Active Work Sessions
            </h2>

            <p class="text-sm text-slate-500 mt-1">
                Total Active Today: <span class="text-indigo-600 font-bold">{{ $activeCount }}</span>
            </p>
        </div>
    </div>

    <!-- LIST -->
    <div class="mt-6 space-y-3">
        @forelse($activeSessions as $session)
            <div class="flex items-center justify-between rounded-2xl border border-slate-100 p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">

                <div class="flex items-center gap-3">
                    {{-- User Avatar Placeholder --}}
                    <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                        {{ substr($session['user_name'] ?? 'U', 0, 1) }}
                    </div>
                    
                    <div>
                        <p class="font-bold text-slate-900">
                            {{ $session['user_name'] }}
                        </p>

                        <p class="text-[11px] text-slate-500 flex items-center gap-1">
                            <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Started: {{ \Carbon\Carbon::parse($session['start_time'])->timezone('Asia/Kolkata')->format('h:i A') }}
                        </p>
                    </div>
                </div>

                <!-- WORKED HOURS -->
                <div class="text-right">
                    <p class="text-indigo-600 font-extrabold text-lg">
                        {{ number_format($session['hours'], 2) }}<span class="text-[10px] ml-0.5">h</span>
                    </p>

                    <p class="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        Worked
                    </p>
                </div>

            </div>

        @empty
            <div class="py-10 text-center border-2 border-dashed border-slate-100 rounded-[24px]">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3">
                    <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p class="text-sm text-slate-400 font-medium">
                    No active sessions found for today
                </p>
            </div>
        @endforelse
    </div>
</div>