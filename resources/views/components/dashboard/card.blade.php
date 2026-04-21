@props([
    'title',
    'value',
    'description' => null,
    'icon' => null,
    'badge' => null,
    'class' => '',
])

<div class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm {{ $class }}">
    <div class="flex items-start justify-between gap-4">
        <div>
            <p class="text-sm font-semibold uppercase tracking-[0.32em] text-slate-400">{{ $title }}</p>
            <p class="mt-4 text-3xl font-black text-slate-900">{!! $value !!}</p>
        </div>

        @if ($badge)
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{{ $badge }}</span>
        @endif
    </div>

    @if ($description)
        <p class="mt-4 text-sm text-slate-500">{{ $description }}</p>
    @endif
</div>
