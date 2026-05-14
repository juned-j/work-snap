<x-filament-widgets::widget>
    <x-filament::section>
        <div
            wire:poll.10000ms
            x-data="{ open: false, img: null }"
            class="space-y-4"
        >

            {{-- HEADER --}}
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                    <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Recent Screenshots
                    </h2>

                    <p class="text-[10px] text-indigo-500 font-bold uppercase mt-1 flex items-center gap-1">
                        <span class="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                        Live Feed
                    </p>
                </div>
            </div>

            @if($recentScreenshots && $recentScreenshots->count() > 0)

                {{-- GRID (MORE DENSE) --}}
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">

                    @foreach($recentScreenshots as $shot)
                        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white hover:shadow-md transition">

                            {{-- IMAGE --}}
                            <div class="relative group">
                                @if($shot->image_url)
                                    <img
                                        src="{{ $shot->image_url }}"
                                        class="h-28 w-full object-cover cursor-pointer hover:scale-[1.04] transition duration-300"
                                        alt="Screenshot"
                                        @click="open = true; img = '{{ $shot->image_url }}'"
                                    >

                                    <div
                                        @click="open = true; img = '{{ $shot->image_url }}'"
                                        class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
                                    >
                                        <x-filament::icon icon="heroicon-m-magnifying-glass-plus" class="w-6 h-6 text-white" />
                                    </div>
                                @else
                                    <div class="h-28 flex items-center justify-center text-xs text-slate-400 bg-slate-100">
                                        No preview
                                    </div>
                                @endif
                            </div>

                            {{-- DETAILS (COMPACT) --}}
                            <div class="p-2 space-y-1">
                                <div class="flex justify-between items-center">
                                    <p class="text-xs font-semibold text-slate-800 truncate">
                                        {{ $shot->user?->name ?? 'Unknown' }}
                                    </p>

                                    <span class="text-[9px] bg-slate-100 px-2 py-[1px] rounded-full border">
                                        #{{ $shot->session_id ?? 'NA' }}
                                    </span>
                                </div>

                                <p class="text-[10px] text-slate-500 flex items-center gap-1">
                                    <x-filament::icon icon="heroicon-m-clock" class="w-3 h-3" />
                                    {{ $shot->captured_at?->format('d M, h:i A') ?? 'NA' }}
                                </p>
                            </div>

                        </div>
                    @endforeach

                </div>

                {{-- PAGINATION --}}
                <div class="mt-4">
                    {{ $recentScreenshots->links() }}
                </div>

                {{-- LIGHTBOX --}}
                <div
                    x-show="open"
                    x-transition
                    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
                    @click.self="open = false"
                    @keydown.escape.window="open = false"
                    style="display: none;"
                >
                    <button
                        class="absolute top-5 right-5 text-white/70 hover:text-white"
                        @click="open = false"
                    >
                        <x-filament::icon icon="heroicon-m-x-mark" class="w-8 h-8" />
                    </button>

                    <img :src="img" class="max-h-full max-w-full rounded-lg shadow-2xl">
                </div>

            @else
                <div class="flex flex-col items-center justify-center p-10 border border-dashed border-slate-300 rounded-2xl bg-slate-50">
                    <x-filament::icon icon="heroicon-m-photo" class="w-10 h-10 text-slate-300 mb-2" />
                    <p class="text-xs text-slate-500">No screenshots found</p>
                </div>
            @endif

        </div>
    </x-filament::section>
</x-filament-widgets::widget>