<x-filament-widgets::widget>
    <x-filament::section>

        <div class="space-y-5">

            {{-- HEADER --}}
            <div class="flex items-center justify-between">
                <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Employee Status Overview
                </h2>

                <span class="text-xs text-slate-400">
                    Live System
                </span>
            </div>

            {{-- MAIN CARD --}}
            <div class="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">

                {{-- TOP STATS --}}
                <div class="grid grid-cols-2 gap-4">

                    {{-- ACTIVE --}}
                    <div class="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                               Active Employee
                                </p>
                                <p class="text-2xl font-bold text-emerald-900 mt-1">
                               
                                </p>
                            </div>

                        </div>
                    </div>

                    {{-- INACTIVE --}}
                    <div class="rounded-2xl bg-rose-50 border border-rose-100 p-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                                    Inactive
                                </p>
                                <p class="text-2xl font-bold text-rose-900 mt-1">
                                 
                                </p>
                            </div>

                        </div>
                    </div>

                </div>

                {{-- DIVIDER --}}
                <div class="my-5 border-t border-slate-100"></div>

                {{-- LIST SECTION --}}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {{-- ACTIVE LIST --}}
                    <div>
                        <p class="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
                            Active Employees
                        </p>

               

                    {{-- INACTIVE LIST --}}
                    <div>
                        <p class="text-xs font-semibold text-rose-700 uppercase tracking-wider mb-2">
                            Inactive Employees
                        </p>

                   
                    </div>

                </div>

            </div>

        </div>

    </x-filament::section>
</x-filament-widgets::widget>