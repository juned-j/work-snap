@props(['sessionId', 'isRunning' => false, 'isPaused' => false])

<div class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
            <p class="text-sm font-semibold uppercase tracking-[0.32em] text-slate-400">Session control</p>
            <h2 class="mt-3 text-2xl font-black text-slate-900">Manage work flow</h2>
            <p class="mt-2 text-sm text-slate-500">Start, pause, resume, or stop the current session with one tap.</p>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
            <button id="startButton" type="button" class="inline-flex items-center justify-center rounded-3xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 {{ $isRunning ? 'hidden' : '' }}">
                Start Work
            </button>
            <button id="pauseButton" type="button" class="inline-flex items-center justify-center rounded-3xl bg-sky-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60 {{ $isRunning ? '' : 'hidden' }}">
                {{ $isPaused ? 'Resume' : 'Pause' }}
            </button>
            <button id="stopButton" type="button" class="inline-flex items-center justify-center rounded-3xl bg-rose-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60 {{ $isRunning ? '' : 'hidden' }}">
                Stop Work
            </button>
        </div>
    </div>

    <div class="mt-8 grid gap-3 sm:grid-cols-3">
        <div class="rounded-3xl bg-slate-50 p-4 text-center">
            <p class="text-sm font-semibold text-slate-500">Started</p>
            <p id="startedAt" class="mt-2 text-lg font-bold text-slate-900">--:--</p>
        </div>
        <div class="rounded-3xl bg-slate-50 p-4 text-center">
            <p class="text-sm font-semibold text-slate-500">Elapsed time</p>
            <p id="workTimer" class="mt-2 text-lg font-bold text-slate-900">00:00:00</p>
        </div>
        <div class="rounded-3xl bg-slate-50 p-4 text-center">
            <p class="text-sm font-semibold text-slate-500">Screenshot count</p>
            <p id="screenshotCount" class="mt-2 text-lg font-bold text-slate-900">0</p>
        </div>
    </div>
</div>
