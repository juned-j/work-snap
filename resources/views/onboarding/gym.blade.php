<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name') }} - WorkSnap Setup</title>

    <script src="https://cdn.tailwindcss.com"></script>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

    <style>
        body { font-family: "Inter", sans-serif; }
    </style>
</head>

<body class="bg-gray-50">

<div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex justify-center items-center py-12 px-4">

<div class="w-full max-w-4xl">

    <!-- Progress -->
    <div class="mb-8">
        <div class="flex items-center justify-center gap-4">
            <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold shadow-lg">1</div>
                <span class="ml-2 text-sm font-medium text-indigo-600">WorkSnap</span>
            </div>

            <div class="w-16 h-1 bg-gray-200"></div>

            <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-semibold">2</div>
                <span class="ml-2 text-sm font-medium text-gray-400">Admin</span>
            </div>
        </div>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">

        <!-- Header -->
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h2 class="text-3xl font-bold text-white text-center">WorkSnap Setup</h2>
            <p class="text-indigo-100 text-center mt-2">Create your WorkSnap profile</p>
        </div>

        <!-- Form -->
        <form method="POST" action="{{ route('register.gym.store') }}" class="px-8 pb-8">
            @csrf

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                <!-- Gym Name -->
                <div class="md:col-span-2">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        WorkSnap Name <span class="text-red-500">*</span>
                    </label>

                    <input type="text" name="name"
                        value="{{ old('name') }}"
                        class="w-full px-4 py-3 border-2 {{ $errors->has('name') ? 'border-red-500' : 'border-gray-200' }} rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
                        required>

                    @error('name')
                        <p class="text-red-500 text-sm mt-2">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Email -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span class="text-red-500">*</span>
                    </label>

                    <input type="email" name="email"
                        value="{{ old('email') }}"
                        class="w-full px-4 py-3 border-2 {{ $errors->has('email') ? 'border-red-500' : 'border-gray-200' }} rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition"
                        required>

                    @error('email')
                        <p class="text-red-500 text-sm mt-2">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Phone -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Phone</label>

                    <input type="text" name="phone"
                        value="{{ old('phone') }}"
                        class="w-full px-4 py-3 border-2 {{ $errors->has('phone') ? 'border-red-500' : 'border-gray-200' }} rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100">

                    @error('phone')
                        <p class="text-red-500 text-sm mt-2">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Address -->
                <div class="md:col-span-2">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Address</label>

                    <input type="text" name="address"
                        value="{{ old('address') }}"
                        class="w-full px-4 py-3 border-2 {{ $errors->has('address') ? 'border-red-500' : 'border-gray-200' }} rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100">

                    @error('address')
                        <p class="text-red-500 text-sm mt-2">{{ $message }}</p>
                    @enderror
                </div>

                <!-- City -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">City</label>

                    <input type="text" name="city"
                        value="{{ old('city') }}"
                        class="w-full px-4 py-3 border-2 {{ $errors->has('city') ? 'border-red-500' : 'border-gray-200' }} rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100">

                    @error('city')
                        <p class="text-red-500 text-sm mt-2">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Country -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        Country <span class="text-red-500">*</span>
                    </label>

                    <select name="country"
                        class="w-full px-4 py-3 border-2 {{ $errors->has('country') ? 'border-red-500' : 'border-gray-200' }} rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        required>

                        <option value="">Select Country</option>

                        @foreach($countries as $country)
                            <option value="{{ $country->name }}"
                                {{ old('country') == $country->name ? 'selected' : '' }}>
                                {{ $country->name }}
                            </option>
                        @endforeach

                    </select>

                    @error('country')
                        <p class="text-red-500 text-sm mt-2">{{ $message }}</p>
                    @enderror
                </div>

                <!-- Timezone -->
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>

                    <input type="text" name="timezone"
                        value="{{ old('timezone', 'Asia/Kolkata') }}"
                        class="w-full px-4 py-3 border-2 {{ $errors->has('timezone') ? 'border-red-500' : 'border-gray-200' }} rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100">

                    @error('timezone')
                        <p class="text-red-500 text-sm mt-2">{{ $message }}</p>
                    @enderror
                </div>

            </div>

            <!-- Button -->
            <div class="flex justify-end mt-8">
                <button type="submit"
                    class="group flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl px-8 py-4 shadow-lg hover:shadow-xl hover:scale-105 transition">
                    Continue to Admin Setup
                </button>
            </div>

        </form>

    </div>

</div>
</div>

<!-- Bottom -->
<div class="text-center mt-6 text-sm text-gray-600">
    Already have account?
    <a href="{{ route('filament.admin.auth.login') }}" class="text-indigo-600 font-medium">
        Login
    </a>
</div>

</body>
</html>