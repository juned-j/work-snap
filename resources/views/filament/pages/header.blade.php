{{-- resources/views/filament/pages/header.blade.php --}}
<div class="w-full">
    @if(auth()->user()->canViewAll())
    <div class="overflow-hidden rounded-[28px] border border-slate-800/50 bg-slate-950 shadow-[0_28px_60px_-28px_rgba(15,23,42,0.9)]">
        <div class="bg-gradient-to-r from-sky-700 via-slate-900 to-slate-800 px-6 py-5 text-white">
            <div class="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                    <h2 class="text-2xl font-semibold tracking-tight text-white md:text-3xl">
                        {{ $title ?? 'WorkSnap Dashboard' }}
                    </h2>
                    <p class="mt-1 text-sm text-slate-200 md:text-base">
                        {{ $subtitle ?? 'Track productivity and employee engagement with clarity.' }}
                    </p>
                </div>

                <button type="button" wire:click.prevent="resetFilters" wire:loading.attr="disabled"
                    class="hidden rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 md:inline-flex">
                    Reset Filters
                </button>
            </div>
        </div>

        <div class="bg-slate-950 px-6 py-6">
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div class="rounded-3xl border border-slate-800/70 bg-slate-900/95 p-4 shadow-sm">
                    <label class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Employee</label>
                    <select wire:model="selectedUser"
                        class="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
                        <option value="">All Employees</option>
                        @foreach(\App\Models\User::all() as $user)
                            <option value="{{ $user->id }}">{{ $user->name }}</option>
                        @endforeach
                    </select>
                </div>

                <div class="rounded-3xl border border-slate-800/70 bg-slate-900/95 p-4 shadow-sm">
                    <label class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">From</label>
                    <input type="date" wire:model="startDate"
                        class="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
                </div>

                <div class="rounded-3xl border border-slate-800/70 bg-slate-900/95 p-4 shadow-sm">
                    <label class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">To</label>
                    <input type="date" wire:model="endDate"
                        class="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
                </div>
            </div>

            <div class="mt-4 lg:hidden">
                <button type="button" wire:click.prevent="resetFilters" wire:loading.attr="disabled"
                    class="w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500">
                    Reset Filters
                </button>
            </div>

            <div class="mt-6 rounded-3xl border border-slate-800/70 bg-slate-900/95 px-5 py-4 text-sm text-slate-300 shadow-sm">
                <div class="flex flex-wrap items-center gap-3">
                    <span class="inline-flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">
                        <span class="h-2.5 w-2.5 rounded-full bg-sky-400"></span>
                        <span class="font-semibold text-white">User</span>
                        <span class="text-slate-400">{{ $selectedUser ? \App\Models\User::find($selectedUser)?->name : 'All employees' }}</span>
                    </span>

                    <span class="inline-flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">
                        <span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                        <span class="font-semibold text-white">Period</span>
                        <span class="text-slate-400">{{ $startDate ?? 'Start' }} → {{ $endDate ?? 'End' }}</span>
                    </span>
                </div>
            </div>
        </div>
    </div>
    @endif
</div>