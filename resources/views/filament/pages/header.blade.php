{{-- resources/views/filament/pages/header.blade.php --}}
<div class="flex flex-col md:flex-row md:items-center justify-between gap-5 border border-slate-200 rounded-3xl px-6 py-6 bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 shadow-sm">
    <div>
        <h2 class="text-3xl font-extrabold tracking-tight text-slate-900">
            {{ $title ?? 'Worksnap' }}
        </h2>

        <p class="mt-2 text-sm text-slate-600 max-w-xl">
            {{ $subtitle ?? "Welcome back! Here is what's happening with WorkSnap today." }}
        </p>
    </div>

    <div class="flex items-center gap-3">
        {{-- LIVE BADGE --}}
        <span class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-100 to-green-200 px-4 py-2 text-xs font-bold text-emerald-900 ring-1 ring-emerald-300 shadow-sm">
            <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-700"></span>
            </span>
            Live System
        </span>

        {{-- ACTION BUTTON --}}
        <button class="relative overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg hover:scale-[1.03] transition">
            Export Report
        </button>
    </div>
</div>