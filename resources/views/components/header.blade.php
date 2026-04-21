@props(['title' => 'Dashboard', 'employee'])

<header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex items-center gap-4">
        <button type="button" onclick="toggleSidebar()" class="inline-flex items-center justify-center rounded-2xl bg-slate-900 p-3 text-white transition hover:bg-slate-800 lg:hidden">
            <span class="sr-only">Open sidebar</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" clip-rule="evenodd"/></svg>
        </button>
        <div>
            <h1 class="text-3xl font-black text-slate-900">{{ $title }}</h1>
            <p class="text-slate-500">Welcome back, {{ $employee->name }}.</p>
        </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-[1fr_auto] lg:w-full">
        <div class="relative max-w-md">
            <label for="search" class="sr-only">Search</label>
            <input id="search" type="search" placeholder="Search dashboard..." class="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            <span class="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 3a6 6 0 014.472 10.121l4.891 4.89a1 1 0 01-1.415 1.415l-4.89-4.89A6 6 0 119 3zm0 2a4 4 0 100 8 4 4 0 000-8z" clip-rule="evenodd"/></svg>
            </span>
        </div>

        <div class="flex items-center justify-between gap-3 sm:justify-end">
            <button type="button" class="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50">
                <span class="sr-only">View notifications</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a5 5 0 00-5 5v2.586l-.707.707A1 1 0 004 12h12a1 1 0 00.707-1.707L15 9.586V7a5 5 0 00-5-5z"/><path d="M8 17a2 2 0 104 0H8z"/></svg>
            </button>
            <div class="inline-flex items-center gap-3 rounded-3xl bg-white px-4 py-3 shadow-sm border border-slate-200">
                <img src="https://ui-avatars.com/api/?name={{ urlencode($employee->name) }}&background=1c64f2&color=fff&size=48" alt="Avatar" class="h-11 w-11 rounded-full object-cover" />
                <div>
                    <p class="text-sm font-semibold text-slate-900">{{ $employee->name }}</p>
                    <p class="text-xs text-slate-500">{{ $employee->email }}</p>
                </div>
            </div>
        </div>
    </div>
</header>
