<x-filament-panels::page.simple
    :heading="''"
    :subheading="''"
>

    {{ \Filament\Support\Facades\FilamentView::renderHook(
        \Filament\View\PanelsRenderHook::AUTH_LOGIN_FORM_BEFORE,
        scopes: $this->getRenderHookScopes()
    ) }}

    <x-filament-panels::form id="form" wire:submit="authenticate">
        {{ $this->form }}

        <x-filament-panels::form.actions
            :actions="$this->getCachedFormActions()"
            :full-width="$this->hasFullWidthFormActions()"
        />
    </x-filament-panels::form>

    <div class="mt-6 text-center text-sm">
        Don't have an account?

        <a
            href="{{ route('register.gym') }}"
            class="font-semibold text-primary-600 hover:underline"
        >
            Register
        </a>
    </div>

    {{ \Filament\Support\Facades\FilamentView::renderHook(
        \Filament\View\PanelsRenderHook::AUTH_LOGIN_FORM_AFTER,
        scopes: $this->getRenderHookScopes()
    ) }}

</x-filament-panels::page.simple>