<x-filament-panels::page>
    <script src="https://cdn.tailwindcss.com"></script>

    <div class="space-y-8 p-6">
        
        {{-- TOP HEADER SECTION --}}
       <div class="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-200 pb-6 rounded-2xl px-5 py-6
bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 shadow-sm">

    {{-- LEFT --}}
    <div>
        <h2 class="text-3xl font-extrabold tracking-tight text-slate-900">
            Dashboard Overview
        </h2>

        <p class="mt-2 text-sm text-slate-600 max-w-xl">
            Welcome back! Here is what's happening with WorkSnap today.
        </p>
    </div>

    {{-- RIGHT --}}
    <div class="flex items-center gap-3">

        {{-- LIVE BADGE --}}
        <span class="inline-flex items-center gap-2 rounded-full
            bg-gradient-to-r from-emerald-100 to-green-200
            px-4 py-2 text-xs font-bold text-emerald-900
            ring-1 ring-emerald-300 shadow-sm">

            <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-700"></span>
            </span>

            Live System
        </span>

        {{-- BUTTON --}}
        <button class="relative overflow-hidden rounded-full
            bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600
            px-5 py-2 text-sm font-semibold text-white shadow-lg
            hover:scale-[1.03] transition">

            Export Report
        </button>

    </div>
</div>

        {{-- SECTION 1: ACTIVITY & MONITORING (Ab ye upar hai) --}}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {{-- LEFT: ACTIVITY LOGS --}}
            <div class="space-y-6">
                <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-500 px-1">
                    Activity Logs
                </h3>
                <div class="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-200">
                    @livewire(\App\Filament\Widgets\RecentSessionsWidget::class)
                </div>
                <div class="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-200">
                    @livewire(\App\Filament\Widgets\RecentScreenshotsWidget::class)
                </div>
            </div>

            {{-- RIGHT: ACTIVE MONITORING --}}
            <div class="space-y-6">
                <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-500 px-1">
                    Active Monitoring
                </h3>
                <div class="bg-white rounded-3xl shadow-sm p-2 border border-slate-200">
                    @livewire(\App\Filament\Widgets\SessionControlWidget::class)
                </div>

                <div class="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-200">
                    @livewire(\App\Filament\Widgets\ScreenshotActivityWidget::class)
                </div>
            </div>
        </div>

{{-- SECTION 2: STATS (MATCHING UPPER SECTION STYLE) --}}
<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">

    {{-- LEFT --}}
    @livewire(\App\Filament\Widgets\WorkSnapStats::class)

    {{-- RIGHT --}}
    @livewire(\App\Filament\Widgets\TotalSessionsWidget::class)

</div>

    </div>
</x-filament-panels::page>