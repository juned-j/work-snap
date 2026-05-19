{{-- resources/views/filament/pages/header.blade.php --}}
<div class="w-full mb-5">
    @if(auth()->user()->canViewAll())
    <div class="overflow-hidden rounded-xl border border-gray-700 bg-slate-900 shadow-sm">
        <div class="bg-slate-800/70 px-5 py-3.5 border-b border-gray-700/60">
            <div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                    <h2 class="text-lg font-bold tracking-tight text-white md:text-xl">
                        {{ $title ?? 'WorkSnap Dashboard' }}
                    </h2>
                    <p class="mt-0.5 text-xs font-medium text-gray-300">
                        {{ $subtitle ?? 'Track productivity and employee engagement with clarity.' }}
                    </p>
                </div>

                <button type="button" wire:click.prevent="resetFilters" wire:loading.attr="disabled"
                    class="hidden rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 md:inline-flex items-center">
                    Reset Filters
                </button>
            </div>
        </div>

        <div class="bg-white px-5 py-4">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div class="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                    <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Employee</label>
                    <select wire:model="selectedUser"
                        class="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 shadow-sm">
                        <option value="">All Employees</option>
                        @foreach(\App\Models\User::all() as $user)
                            <option value="{{ $user->id }}">{{ $user->name }}</option>
                        @endforeach
                    </select>
                </div>

                <div class="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                    <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400">From</label>
                    <input type="date" wire:model="startDate"
                        class="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 shadow-sm">
                </div>

                <div class="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                    <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400">To</label>
                    <input type="date" wire:model="endDate"
                        class="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 shadow-sm">
                </div>
            </div>

            <div class="mt-3 lg:hidden">
                <button type="button" wire:click.prevent="resetFilters" wire:loading.attr="disabled"
                    class="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-gray-800 shadow-sm">
                    Reset Filters
                </button>
            </div>

            <div class="mt-4 pt-3 border-t border-gray-100">
                <div class="flex flex-wrap items-center gap-2">
                    <span class="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                        <span class="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                        <span class="font-bold text-gray-700">User:</span>
                        <span class="text-gray-500">{{ $selectedUser ? \App\Models\User::find($selectedUser)?->name : 'All employees' }}</span>
                    </span>

                    <span class="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        <span class="font-bold text-gray-700">Period:</span>
                        <span class="text-gray-500">{{ $startDate ?? 'Start' }} → {{ $endDate ?? 'End' }}</span>
                    </span>
                </div>
            </div>
        </div>
    </div>
    @endif
</div>