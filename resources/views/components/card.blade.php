@props([
    'title',
    'value',
    'icon',
    'meta' => null,
    'change' => null,
])

<div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
    <div class="flex items-center justify-between gap-4">
        <div>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{{ $title }}</p>
            <p class="mt-3 text-3xl font-black text-slate-900">{{ $value }}</p>
        </div>
        <div class="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
            {!! $icon !!}
        </div>
    </div>

    @if ($meta || $change)
        <div class="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <span>{{ $meta }}</span>
            @if ($change)
                <span class="rounded-full bg-emerald-100 px-3 py-1 text-emerald-600">{{ $change }}</span>
            @endif
        </div>
    @endif
</div>
