<x-filament-panels::page>
    <script src="https://cdn.tailwindcss.com"></script>

    <div class="space-y-8 p-6 w-full">

        {{-- EXTENDING THE HEADER --}}
        @include('filament.pages.header', [
            
        ])

        {{-- SECTION 1 : FULL WIDTH STATS --}}
        <div class="space-y-5 w-full">
            <div class="flex items-center justify-between px-1">
                <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Employee Overview
                </h3>
            </div>

    
            <div class="w-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        @livewire(\App\Filament\Widgets\ProductivityOverview::class)
    </div>
        </div>

        {{-- SECTION 2 : ACTIVITY + CONTROL --}}
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
            {{-- ACTIVITY HISTORY --}}
            <div class="space-y-5">
                <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-500 px-1">
                    Activity History
                </h3>
                <div class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden h-full">
                    @livewire(\App\Filament\Widgets\ScreenshotActivityWidget::class)
                </div>
            </div>

            {{-- LIVE SESSION CONTROL --}}
            <div class="space-y-5">
                <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-500 px-1">
                    Live Session Control
                </h3>
                <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 h-full">
                    @livewire(\App\Filament\Widgets\SessionControlWidget::class)
                </div>
            </div>
        </div>

        {{-- SECTION 3 : RECENT SCREENSHOTS --}}
        <div class="space-y-5 w-full">
            <div class="flex items-center justify-between px-1">
                <h3 class="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Recent Activity Screenshots
                </h3>
            </div>

            <div class="w-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-2">
                @livewire(\App\Filament\Widgets\RecentScreenshotsWidget::class)
            </div>
            
            <div class="w-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-2">
                @livewire(\App\Filament\Widgets\WorkSnapStats::class)
            </div>
        </div>

    </div>
</x-filament-panels::page>