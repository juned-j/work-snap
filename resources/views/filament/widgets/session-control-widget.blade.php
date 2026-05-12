<div
    x-data="{ showModal: @entangle('showConfirmModal') }"
    class="rounded-[28px] border border-slate-200/70 bg-white p-6 shadow-sm"
>

    <!-- HEADER -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
            <p class="text-xs uppercase tracking-[0.24em] text-slate-500">
                Session Control
            </p>

            <h2 class="mt-2 text-2xl font-semibold text-slate-900">
                Active Work Sessions
            </h2>

            <p class="text-sm text-slate-500 mt-1">
                Total Active: {{ $activeCount }}
            </p>
        </div>

    </div>

    <!-- LIST -->
    <div class="mt-6 space-y-3">

        @forelse($activeSessions as $session)

            <div class="flex items-center justify-between rounded-xl border p-3 bg-slate-50">

                <div>
                    <p class="font-medium text-slate-900">
                        {{ $session['user'] }}
                    </p>

                    <p class="text-xs text-slate-500">
                        Started: {{ $session['start_time'] }}
                    </p>
                </div>

                <!-- WORKED HOURS -->
                <div class="text-right">
                    <p class="text-indigo-600 font-bold">
                        {{ $session['hours'] }} hrs
                    </p>

                    <p class="text-xs text-slate-500">
                        Working
                    </p>
                </div>

            </div>

        @empty
            <p class="text-sm text-slate-500">
                No active sessions
            </p>
        @endforelse

    </div>

</div>