@props(['activeRoute' => 'dashboard'])

<aside id="desktopSidebar" class="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col lg:w-72 xl:w-80 bg-slate-950 text-white p-6 space-y-8 overflow-y-auto">
    <div class="space-y-2">
        <div class="text-2xl font-black text-blue-400 mb-1 italic">WorkSnap</div>
        <p class="text-slate-400 text-sm">Employee productivity manager with clean analytics.</p>
    </div>

    <nav class="space-y-2">
        @php
            $navItems = [
                ['label' => 'Dashboard', 'url' => route('dashboard'), 'icon' => 'dashboard', 'isAnchor' => false],
                ['label' => 'Activity Logs', 'url' => '#logs', 'icon' => 'clipboard-list', 'isAnchor' => true],
            ];
        @endphp

        @foreach ($navItems as $item)
            @php
                $isActive = !$item['isAnchor'] && $activeRoute === 'dashboard';
            @endphp
            <a href="{{ $item['url'] }}" class="flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors duration-200 {{ $isActive ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900 hover:text-white' }}">
                <span class="w-6 h-6 inline-flex items-center justify-center bg-slate-800 rounded-xl">
                    @if ($item['icon'] === 'dashboard')
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M3 3a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V3zM3 11a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zM10 3a1 1 0 011-1h3a1 1 0 011 1v7a1 1 0 01-1 1h-3a1 1 0 01-1-1V3zM10 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z"/></svg>
                    @elseif ($item['icon'] === 'clipboard-list')
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-1 1v1H5.5A1.5 1.5 0 004 5.5v11A1.5 1.5 0 005.5 18h9a1.5 1.5 0 001.5-1.5v-11A1.5 1.5 0 0014.5 4H12V3a1 1 0 00-1-1H9zM9 3h2v1H9V3zm-2 6a1 1 0 011-1h4a1 1 0 011 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1V9zm0 4a1 1 0 011-1h4a1 1 0 011 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1v-1z" clip-rule="evenodd"/></svg>
                    @elseif ($item['icon'] === 'users')
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13 7a3 3 0 11-6 0 3 3 0 016 0z"/><path fill-rule="evenodd" d="M4 14s1-1 4-1 4 1 4 1v1H4v-1zm8 0s-1-1-4-1-4 1-4 1v1h8v-1z" clip-rule="evenodd"/></svg>
                    @elseif ($item['icon'] === 'adjustments')
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a1 1 0 011 1v2a1 1 0 11-2 0V4a1 1 0 011-1zm12 0a1 1 0 011 1v2a1 1 0 11-2 0V4a1 1 0 011-1zM5 11a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm10 0a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM7 7a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1zm6 0a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1z"/></svg>
                    @else
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M3 3h14v14H3V3z"/></svg>
                    @endif
                </span>
                <span class="font-medium">{{ $item['label'] }}</span>
            </a>
        @endforeach
    </nav>

    <div class="mt-auto text-slate-500 text-sm">
        <div class="font-semibold text-slate-100">Need help?</div>
        <p class="mt-2 leading-relaxed">Open reports or review recent activity anytime.</p>
    </div>
</aside>

<div id="mobileSidebar" class="fixed inset-y-0 left-0 z-50 w-72 transform -translate-x-full overflow-y-auto bg-slate-950 text-white p-6 transition-transform duration-300 lg:hidden" aria-hidden="true">
    <div class="flex items-center justify-between mb-6">
        <div class="text-xl font-black text-blue-400">WorkSnap</div>
        <button type="button" onclick="toggleSidebar()" class="rounded-full bg-slate-800 p-2 text-slate-200 hover:bg-slate-700">
            <span class="sr-only">Close sidebar</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
        </button>
    </div>
    <nav class="space-y-2">
        @foreach ($navItems as $item)
            <a href="{{ $item['url'] }}" class="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-300 transition-colors duration-200 hover:bg-slate-800 hover:text-white">
                <span class="w-6 h-6 inline-flex items-center justify-center rounded-xl bg-slate-800 text-slate-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm0 8a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm6-8a1 1 0 011-1h3a1 1 0 011 1v7a1 1 0 01-1 1h-3a1 1 0 01-1-1V3zm0 10a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z"/></svg>
                </span>
                <span class="font-medium">{{ $item['label'] }}</span>
            </a>
        @endforeach
    </nav>
</div>

<div id="pageOverlay" class="fixed inset-0 z-40 hidden bg-black/40 lg:hidden" onclick="toggleSidebar()"></div>
