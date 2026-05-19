<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name') }} - Email Verification</title>

    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

    <style>
        body {
            font-family: "Inter", sans-serif;
        }
    </style>
</head>

<body class="bg-gray-50">

<div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex justify-center items-center px-4">

    <div class="w-full max-w-2xl">

        <!-- Card -->
        <div class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">

            <!-- Header -->
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8 text-center">
                <h2 class="text-3xl font-bold text-white">
                    Verify Your Email
                </h2>

                <p class="text-indigo-100 mt-2">
                    We’ve sent a verification link to your email
                </p>
            </div>

            <!-- Body -->
            <div class="p-8 text-center">

                <!-- Icon -->
                <div class="flex justify-center mb-6">
                    <div class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                        <svg class="w-10 h-10 text-indigo-600"
                             fill="none"
                             stroke="currentColor"
                             stroke-width="2"
                             viewBox="0 0 24 24">

                            <path stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="M16 12H8m0 0l4-4m-4 4l4 4" />
                        </svg>
                    </div>
                </div>

                <!-- Message -->
                <p class="text-gray-600 text-lg mb-6">
                    Please check your inbox and click the verification link to activate your account.
                </p>

                <!-- SUCCESS -->
                @if (session('message'))
                    <div class="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                        {{ session('message') }}
                    </div>
                @endif

                <!-- ALREADY VERIFIED -->
                @if (session('already_verified'))
                    <div class="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl">
                        {{ session('already_verified') }}
                    </div>
                @endif

                <!-- ERROR -->
                @if (session('error'))
                    <div class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                        {{ session('error') }}
                    </div>
                @endif

                <!-- VERIFIED MESSAGE -->
                @auth
                    @if(auth()->user()->hasVerifiedEmail())

                        <div class="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                            Your email is already verified ✅
                        </div>

                    @else

                        <!-- Resend Button -->
                        <form method="POST" action="{{ route('verification.send') }}">
                            @csrf

                            <button type="submit"
                                class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:scale-105 transition">
                                Resend Verification Email
                            </button>
                        </form>

                    @endif
                @endauth

                <!-- Back -->
                <div class="mt-6">
                    <a href="{{ route('register.user') }}"
                       class="text-sm text-gray-500 hover:text-indigo-600">
                        ← Back to signup
                    </a>
                </div>

            </div>

        </div>

        <!-- Footer -->
        <p class="text-center text-sm text-gray-500 mt-6">
            Didn’t receive email? Check spam folder or resend it.
        </p>

    </div>

</div>

</body>
</html>