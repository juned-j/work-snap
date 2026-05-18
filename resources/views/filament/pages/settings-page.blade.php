<head>
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />

    <script src="https://cdn.tailwindcss.com"></script>

    <style>
        .bg-yellow-500 {
            background-color: #eab308;
        }

        .text-white {
            color: white;
        }

        .p-3 {
            padding: 0.75rem;
        }

        .shadow {
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .hover\:shadow-md:hover {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        }
    </style>
</head>

<div class="container mx-auto p-4 space-y-10">

    <!-- Master Data -->
    <h1 class="text-2xl font-bold text-center text-gray-700">
        Master's
    </h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

        <div
            class="bg-yellow-500 text-white p-3 rounded-lg shadow border border-gray-300 hover:bg-yellow-600 hover:shadow-md transition duration-200">

            <a href="{{ route('filament.admin.resources.currencies.index') }}"
                class="flex items-center space-x-2">

                <i class="fas fa-coins text-xl"></i>

                <span class="text-lg font-semibold">
                    Currencies
                </span>
            </a>
        </div>
 <div
    class="bg-blue-500 text-white p-3 rounded-lg shadow border border-gray-300 hover:bg-blue-600 hover:shadow-md transition duration-200">

    <a href="{{ route('filament.admin.resources.countries.index') }}"
        class="flex items-center space-x-2">

        <i class="fas fa-globe-asia text-xl"></i>

        <span class="text-lg font-semibold">
            Countries
        </span>
    </a>
</div>

</div>