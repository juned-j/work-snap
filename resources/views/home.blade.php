<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>WorkSnap - Employee Time Tracking</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="antialiased bg-slate-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <!-- Logo -->
                <div class="flex items-center">
                    <h1 class="text-2xl font-bold text-slate-800">WorkSnap</h1>
                    <span class="ml-2 text-sm text-slate-500">Employee Time Tracking</span>
                </div>

                <!-- Navigation -->
                <nav class="flex items-center space-x-4">
                    <a href="{{ route('filament.admin.auth.login') }}"
                       class="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                        Login
                    </a>
                    <a href="{{ route('filament.admin.auth.register') }}"
                       class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        Register
                    </a>
                </nav>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
            <h2 class="text-4xl font-bold text-slate-900 sm:text-5xl md:text-6xl">
                Track Your Work Time
                <span class="block text-blue-600">Effortlessly</span>
            </h2>

            <p class="mt-3 max-w-md mx-auto text-base text-slate-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                WorkSnap helps you track your work sessions, capture screenshots, and monitor your productivity.
                Get insights into your work patterns and improve your time management.
            </p>

            <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div class="rounded-md shadow">
                    <a href="{{ route('filament.admin.auth.register') }}"
                       class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors">
                        Get Started
                    </a>
                </div>
                <div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                    <a href="{{ route('filament.admin.auth.login') }}"
                       class="w-full flex items-center justify-center px-8 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 md:py-4 md:text-lg md:px-10 transition-colors">
                        Sign In
                    </a>
                </div>
            </div>
        </div>

        <!-- Features -->
        <div class="mt-16">
            <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <!-- Feature 1 -->
                <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-medium text-slate-900">Time Tracking</h3>
                            <p class="mt-2 text-sm text-slate-500">
                                Automatically track your work sessions and monitor your productivity.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Feature 2 -->
                <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-medium text-slate-900">Screenshot Capture</h3>
                            <p class="mt-2 text-sm text-slate-500">
                                Automatic screenshot capture to document your work activities.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Feature 3 -->
                <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-medium text-slate-900">Analytics & Reports</h3>
                            <p class="mt-2 text-sm text-slate-500">
                                Detailed reports and analytics to understand your work patterns.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="text-center text-slate-500 text-sm">
                <p>&copy; 2026 WorkSnap. All rights reserved.</p>
            </div>
        </div>
    </footer>
</body>
</html>