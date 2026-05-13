<x-filament-widgets::widget>
    <x-filament::section>
        {{-- Polling every 10 seconds for new screenshots --}}
        <div
            wire:poll.10000ms
            x-data="{ open: false, img: null }"
            class="space-y-4"
        >

            {{-- HEADER --}}
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                    <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-500">
                        Recent Screenshots
                    </h2>
                    <p class="text-[10px] text-indigo-500 font-bold uppercase mt-1 flex items-center gap-1">
                        <span class="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        Live Feed
                    </p>
                </div>
            </div>

            @if($recentScreenshots && $recentScreenshots->count() > 0)

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    @foreach($recentScreenshots as $shot)
                        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition shadow-sm">

                            {{-- IMAGE (CLICKABLE) --}}
                            <div class="relative group">
                                @if($shot->image_url)
                                    <img
                                        src="{{ $shot->image_url }}"
                                        class="h-40 w-full object-cover cursor-pointer hover:scale-[1.05] transition duration-300"
                                        alt="Screenshot"
                                        @click="open = true; img = '{{ $shot->image_url }}'"
                                    >
                                    <div @click="open = true; img = '{{ $shot->image_url }}'" class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                                        <x-filament::icon icon="heroicon-m-magnifying-glass-plus" class="w-8 h-8 text-white" />
                                    </div>
                                @else
                                    <div class="h-40 flex items-center justify-center text-sm text-slate-400 bg-slate-100">
                                        No preview available
                                    </div>
                                @endif
                            </div>

                            {{-- DETAILS --}}
                            <div class="p-4 space-y-1">
                                <div class="flex justify-between items-start">
                                    <p class="text-sm font-bold text-slate-900 truncate">
                                        {{ $shot->user?->name ?? 'Unknown' }}
                                    </p>
                                    <span class="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200 font-medium">
                                        #{{ $shot->session_id ?? 'NA' }}
                                    </span>
                                </div>

                                <p class="text-[11px] text-slate-500 flex items-center gap-1">
                                    <x-filament::icon icon="heroicon-m-clock" class="w-3 h-3" />
                                    {{ $shot->captured_at?->format('d M, h:i A') ?? 'NA' }}
                                </p>
                            </div>

                        </div>
                    @endforeach

                </div>

                {{-- PAGINATION LINKS --}}
                <div class="mt-6">
                    {{ $recentScreenshots->links() }}
                </div>

                {{-- 🔥 LIGHTBOX MODAL --}}
                <div
                    x-show="open"
                    x-transition:enter="transition ease-out duration-300"
                    x-transition:enter-start="opacity-0"
                    x-transition:enter-end="opacity-100"
                    x-transition:leave="transition ease-in duration-200"
                    x-transition:leave-start="opacity-100"
                    x-transition:leave-end="opacity-0"
                    class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 p-4"
                    @click.self="open = false"
                    @keydown.escape.window="open = false"
                    style="display: none;"
                >
                    <button
                        class="absolute top-5 right-5 text-white/70 hover:text-white transition"
                        @click="open = false"
                    >
                        <x-filament::icon icon="heroicon-m-x-mark" class="w-10 h-10" />
                    </button>

                    <img
                        :src="img"
                        class="max-h-full max-w-full rounded-lg shadow-2xl border-4 border-white/10"
                    >
                </div>

            @else
                <div class="flex flex-col items-center justify-center p-12 border border-dashed border-slate-300 rounded-3xl bg-slate-50">
                    <x-filament::icon icon="heroicon-m-photo" class="w-12 h-12 text-slate-300 mb-3" />
                    <p class="text-sm text-slate-500 font-medium">No screenshots found for this selection</p>
                </div>
            @endif

        </div>
    </x-filament::section>
</x-filament-widgets::widget>