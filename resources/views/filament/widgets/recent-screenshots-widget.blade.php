<x-filament-widgets::widget>
    <x-filament::section>

        <div class="space-y-4">

            <div class="flex items-center justify-between">
                <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Recent Screenshots
                </h2>
            </div>

            @if($recentScreenshots && count($recentScreenshots) > 0)

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    @foreach($recentScreenshots as $shot)
                        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition">

                            {{-- IMAGE --}}
                            @if($shot->image_url)
                                <img src="{{ $shot->image_url }}"
                                     class="h-40 w-full object-cover"
                                     alt="Screenshot">
                            @else
                                <div class="h-40 flex items-center justify-center text-sm text-slate-400">
                                    No preview
                                </div>
                            @endif

                            {{-- DETAILS --}}
                            <div class="p-4 space-y-2">

                                <p class="text-sm font-semibold text-slate-900">
                                    Session #{{ $shot->session_id ?? 'NA' }}
                                </p>

                                <p class="text-xs text-slate-500">
                                    Employee: {{ $shot->employee?->name ?? 'NA' }}
                                </p>

                                <p class="text-xs text-slate-500">
                                    {{ $shot->captured_at?->format('d M Y, H:i') ?? 'NA' }}
                                </p>

                            </div>

                        </div>
                    @endforeach

                </div>

            @else

                {{-- EMPTY STATE --}}
                <div class="flex items-center justify-center p-10 border border-dashed border-slate-300 rounded-2xl bg-slate-50">
                    <p class="text-sm text-slate-500">NA</p>
                </div>

            @endif

        </div>

    </x-filament::section>
</x-filament-widgets::widget>