<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name', 'Laravel') }} - Plan Selection</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-50">

<div class="min-h-screen flex items-center justify-center">
    <div class="bg-white p-10 rounded-xl shadow-lg w-full max-w-4xl">

        <h1 class="text-2xl font-bold mb-6 text-center">Choose Your Plan</h1>

        <form method="POST" action="{{ route('register.plan.store') }}">
            @csrf

            <div class="grid md:grid-cols-3 gap-6">

                @foreach($plans as $plan)
                    <label class="border rounded-xl p-5 cursor-pointer hover:shadow-lg transition">
                        <input type="radio" name="plan_id" value="{{ $plan->id }}" class="hidden" required>

                        <h2 class="text-xl font-semibold">{{ $plan->name }}</h2>

                        <p class="text-indigo-600 text-lg font-bold mt-2">
                            ₹{{ $plan->monthly_price }}
                        </p>

                        <p class="text-sm text-gray-500 mt-2">
                            {{ $plan->description }}
                        </p>

                        @if(!empty($plan->features))
                            <ul class="mt-3 text-sm text-gray-600 list-disc pl-4">
                                @foreach($plan->features as $feature)
                                    <li>{{ is_array($feature) ? ($feature['label'] ?? '') : $feature }}</li>
                                @endforeach
                            </ul>
                        @endif

                    </label>
                @endforeach

            </div>

            <button type="submit"
                class="mt-8 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">
                Continue
            </button>

        </form>

    </div>
</div>

</body>
</html>