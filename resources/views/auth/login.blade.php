@extends('layouts.app')

@section('title', 'Login - WorkSnap')

@section('content')
<div class="min-h-screen flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
        <h1 class="text-3xl font-bold mb-6 text-slate-900">Employee Login</h1>

        @if($errors->any())
            <div class="mb-4 p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
                {{ $errors->first() }}
            </div>
        @endif

        <form method="POST" action="{{ route('login.post') }}" class="space-y-4">
            @csrf
            <label class="block text-slate-700">
                <span class="text-sm font-semibold">Email</span>
                <input name="email" type="email" value="{{ old('email') }}" required class="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-slate-500 focus:outline-none" />
            </label>
            <label class="block text-slate-700">
                <span class="text-sm font-semibold">Password</span>
                <input name="password" type="password" required class="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-slate-500 focus:outline-none" />
            </label>
            <button type="submit" class="w-full bg-slate-900 text-white rounded-2xl px-4 py-3 font-bold hover:bg-slate-700">Login</button>
        </form>

        <p class="mt-6 text-sm text-slate-500">New employee? <a href="{{ route('register') }}" class="text-slate-900 font-semibold">Register here</a></p>
    </div>
</div>
@endsection
