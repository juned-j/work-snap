<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

use App\Models\Country;
use App\Models\User;
use App\Models\SaasPlan;
use App\Models\Role;

class WorkSnapOnboardingController extends Controller
{
    public function showGymStep()
    {
        $countries = Country::orderBy('name')->get();

        return view('onboarding.gym', compact('countries'));
    }

    public function storeGym(Request $request)
    {
        Log::info('🚀 storeGym started', [
            'input' => $request->all()
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:100|min:3',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:20|regex:/^[0-9+\-\s]+$/',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:50',
            'country' => 'required|string|max:50',
            'timezone' => 'nullable|string|max:50',
        ]);

        // ✅ STORE TEMP DATA
        Session::put('gym_data', $validated);

        return redirect()
            ->route('register.user')
            ->with('success', 'Gym details saved. Now create admin account!');
    }

    public function showUserStep()
    {
        if (!Session::has('gym_data')) {

            return redirect()
                ->route('register.gym')
                ->with('error', 'Please complete gym step first');
        }

        return view('onboarding.user');
    }

    public function storeUser(Request $request)
    {
        Log::info('🚀 storeUser started', [
            'input' => $request->all(),
        ]);

        if (!Session::has('gym_data')) {

            return redirect()
                ->route('register.gym')
                ->with('error', 'Session expired. Please start again.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:50',

            'email' => 'required|email|unique:users,email',

            'password' => [
                'required',
                'confirmed',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
            ],
        ]);

        try {

            // ✅ FIND ADMIN ROLE
            $adminRole = Role::where('name', 'admin')->first();

            if (!$adminRole) {

                Log::error('❌ Admin role not found');

                return back()
                    ->withInput()
                    ->with('error', 'Admin role not found.');
            }

            // ✅ CREATE ADMIN USER
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'], // auto hash in model
                'role_id' => $adminRole->id,
            ]);

            Log::info('✅ Admin user created', [
                'user_id' => $user->id,
            ]);

            // ✅ AUTO LOGIN
            Auth::login($user);

            // ✅ REMOVE SESSION
            Session::forget('gym_data');

            // ✅ SEND EMAIL VERIFICATION
            if (method_exists($user, 'sendEmailVerificationNotification')) {
                $user->sendEmailVerificationNotification();
            }

            return redirect()
                ->route('verification.notice')
                ->with('success', 'Admin account created successfully.');

        } catch (\Exception $e) {

            Log::error('❌ storeUser failed', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);

            return back()
                ->withInput()
                ->with('error', 'Something went wrong.');
        }
    }

    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!$request->hasValidSignature()) {
            abort(403);
        }

        if (!hash_equals($hash, sha1($user->getEmailForVerification()))) {
            abort(403);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        Auth::login($user);

        return redirect()->route('billing.plans');
    }

    public function resendVerification(Request $request)
    {
        try {

            if (!auth()->check()) {

                return back()->with(
                    'error',
                    'Session expired. Please login again.'
                );
            }

            $user = auth()->user();

            if ($user->hasVerifiedEmail()) {

                return back()->with(
                    'already_verified',
                    'User already verified.'
                );
            }

            $user->sendEmailVerificationNotification();

            return back()->with(
                'message',
                'Verification link sent!'
            );

        } catch (\Exception $e) {

            Log::error('❌ resendVerification failed', [
                'message' => $e->getMessage(),
            ]);

            return back()->with(
                'error',
                'Something went wrong.'
            );
        }
    }

    public function showPlans()
    {
        $plans = SaasPlan::where('is_active', true)->get();

        return view('onboarding.plans', compact('plans'));
    }

    public function storePlan(Request $request)
    {
        $request->validate([
            'saas_plan_id' => 'required|exists:saas_plans,id',
        ]);

        $user = auth()->user();

        $user->update([
            'saas_plan_id' => $request->saas_plan_id,
        ]);

        return redirect()
            ->route('home')
            ->with('success', 'Plan selected successfully!');
    }
}