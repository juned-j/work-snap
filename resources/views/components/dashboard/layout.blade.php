@props(['employee', 'title' => 'Dashboard', 'activeRoute' => 'dashboard'])

<div class="min-h-screen bg-slate-100 text-slate-900">
    <x-sidebar :active-route="$activeRoute" />

    <div class="flex min-h-screen flex-col lg:ml-72 xl:ml-80">
        <div class="border-b border-slate-200 bg-white px-6 py-5 lg:px-10">
            <x-header :employee="$employee" :title="$title" />
        </div>

        <main class="flex-1 overflow-y-auto px-6 py-8 lg:px-10">
            {{ $slot }}
        </main>
    </div>
</div>
