<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\SaasPlan;

class BillingController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | SHOW BILLING PLANS
    |--------------------------------------------------------------------------
    */
    public function index()
    {
        Log::info('📄 [BILLING INDEX] START', [
            'auth_user' => auth()->id(),
            'session_id' => session()->getId(),
        ]);

        $plans = SaasPlan::where('is_active', true)->get();

        Log::info('📦 [PLANS LOADED]', [
            'count' => $plans->count(),
            'plan_ids' => $plans->pluck('id'),
        ]);

        return view('billing.plans', compact('plans'));
    }

    /*
    |--------------------------------------------------------------------------
    | SUBSCRIBE
    |--------------------------------------------------------------------------
    */
    public function subscribe(Request $request)
    {
        Log::info('🚀 [SUBSCRIBE START]', [
            'request_data' => $request->all(),
            'auth_user' => auth()->id(),
            'session_id' => $request->session()->getId(),
        ]);

        $planId = $request->saas_plan_id ?? $request->plan_id;

        Log::info('🔎 PLAN CHECK', [
            'plan_id' => $planId,
        ]);

        if (!$planId) {

            Log::warning('⚠️ PLAN NOT SELECTED');

            return back()->with(
                'error',
                'Plan not selected'
            );
        }

        $user = auth()->user();

        if (!$user) {

            Log::error('❌ USER NOT AUTH');

            return redirect()->route('login');
        }

        $plan = SaasPlan::find($planId);

        if (!$plan) {

            Log::error('❌ INVALID PLAN', [
                'plan_id' => $planId,
            ]);

            return back()->with(
                'error',
                'Invalid plan'
            );
        }

        Log::info('📦 PLAN LOADED', $plan->toArray());

        /*
        |--------------------------------------------------------------------------
        | FREE PLAN
        |--------------------------------------------------------------------------
        */
        if ((float) $plan->price === 0.0) {

            Log::info('🆓 FREE PLAN ACTIVATED', [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
            ]);

            $user->update([
                'saas_plan_id' => $plan->id,
            ]);

            return redirect()
                ->route('filament.admin.pages.dashboard')
                ->with(
                    'success',
                    'Free plan activated!'
                );
        }

        /*
        |--------------------------------------------------------------------------
        | STRIPE PAYMENT
        |--------------------------------------------------------------------------
        */
        Log::info('💳 STRIPE INIT', [
            'user_email' => $user->email,
            'plan_id' => $plan->id,
        ]);

        \Stripe\Stripe::setApiKey(
            config('services.stripe.secret')
        );

        try {

            $session = \Stripe\Checkout\Session::create([

                'customer_email' => $user->email,

                'payment_method_types' => ['card'],

                'line_items' => [[
                    'price' => $plan->stripe_price_id,
                    'quantity' => 1,
                ]],

                'mode' => 'subscription',

                'success_url' => route(
                    'billing.success',
                    [
                        'plan_id' => $plan->id,
                    ]
                ),

                'cancel_url' => route('billing.plans'),
            ]);

            Log::info('✅ STRIPE SESSION CREATED', [
                'session_id' => $session->id,
                'url' => $session->url,
            ]);

            return redirect($session->url);

        } catch (\Exception $e) {

            Log::error('❌ STRIPE ERROR', [
                'message' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            return back()->with(
                'error',
                'Payment failed'
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | PAYMENT SUCCESS
    |--------------------------------------------------------------------------
    */
    public function success(Request $request)
    {
        Log::info('🎉 BILLING SUCCESS START', [
            'auth_user' => auth()->id(),
            'plan_id' => $request->get('plan_id'),
        ]);

        $user = auth()->user();

        if (!$user) {

            Log::error('❌ USER NOT FOUND');

            return redirect()->route('login');
        }

        $planId = $request->get('plan_id');

        if (!$planId) {

            Log::error('❌ PLAN ID MISSING');

            return redirect()
                ->route('billing.plans')
                ->with(
                    'error',
                    'Invalid plan'
                );
        }

        $plan = SaasPlan::find($planId);

        if (!$plan) {

            Log::error('❌ PLAN NOT FOUND', [
                'plan_id' => $planId,
            ]);

            return redirect()
                ->route('billing.plans')
                ->with(
                    'error',
                    'Plan not found'
                );
        }

        try {

            /*
            |--------------------------------------------------------------------------
            | SAVE PLAN TO USER
            |--------------------------------------------------------------------------
            */
            $user->update([
                'saas_plan_id' => $plan->id,
            ]);

            Log::info('✅ PLAN SAVED TO USER', [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
            ]);

            return redirect()
                ->to('/admin')
                ->with(
                    'success',
                    'Subscription activated successfully!'
                );

        } catch (\Exception $e) {

            Log::error('❌ BILLING SUCCESS ERROR', [
                'message' => $e->getMessage(),
                'user_id' => $user->id,
            ]);

            return redirect()
                ->route('billing.plans')
                ->with(
                    'error',
                    'Payment verification failed.'
                );
        }
    }
}