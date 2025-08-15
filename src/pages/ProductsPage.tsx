import React from 'react';
import { createStripeProducts } from '../stripe-config';
import { ProductCard } from '../components/ProductCard';
import { SubscriptionStatus } from '../components/SubscriptionStatus';
import { TrialTimer } from '../components/TrialTimer';
import { useSubscription } from '../hooks/useSubscription';
import { useProductConfig } from '../hooks/useProductConfig';
import { useUserAccess } from '../hooks/useUserAccess';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProductsPage() {
  const { subscription, loading } = useSubscription();
  const { config: productConfig, loading: configLoading } = useProductConfig();
  const { userAccess, accessStatus, loading: accessLoading, isPaidUser } = useUserAccess();

  if (loading || configLoading || accessLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-black" />
          <span className="text-black font-medium uppercase tracking-wide">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-black hover:text-gray-600 transition-colors font-medium uppercase tracking-wide mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO DASHBOARD
          </Link>
        </div>

        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <img
              src="https://www.axiestudio.se/Axiestudiologo.jpg"
              alt="Axie Studio"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-5xl font-bold text-black mb-2 uppercase tracking-wide">
            AXIE STUDIO
          </h1>
          <h2 className="text-3xl font-bold text-black mb-6 uppercase tracking-wide">
            START YOUR AI JOURNEY
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advanced AI workflow capabilities with flexible subscription options
          </p>
        </div>

        <div className="mb-12 max-w-2xl mx-auto">
          <TrialTimer
            trialEndDate={accessStatus?.trial_end_date || null}
            subscriptionStatus={subscription?.subscription_status || null}
            currentPlan={subscription?.price_id === 'price_1Rv4rDBacFXEnBmNDMrhMqOH' ? 'Pro' :
                        subscription?.price_id === 'price_1RwNgiBacFXEnBmNu1PwJnYK' ? 'Limited Time' :
                        'Standard'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {createStripeProducts(productConfig).map((product) => {
            // 🎯 BULLETPROOF CURRENT PLAN DETECTION
            const isCurrentPlan = (() => {
              // CASE 1: Super Admin always has Pro access
              if (isSuperAdmin(user?.id || '') && product.priceId === 'price_1Rv4rDBacFXEnBmNDMrhMqOH') {
                return true;
              }

              // CASE 2: Standard tier detection
              if (product.id === 'standard_product') {
                // Super admin never shows Standard as current
                if (isSuperAdmin(user?.id || '')) {
                  return false;
                }

                // User is on Standard if:
                // - No active subscription AND not trialing
                // - Cancelled subscription (will become Standard at period end)
                // - Explicitly switched to Standard tier
                return (
                  !subscription?.subscription_id || // No Stripe subscription
                  subscription?.subscription_status === 'canceled' || // Cancelled
                  subscription?.subscription_status === null || // No status
                  subscription?.cancel_at_period_end === true || // Cancelled but still active
                  (!isPaidUser && !isTrialing && !isFreeTrialing) // No access
                );
              }

              // CASE 3: Active paid subscription match
              if (subscription?.price_id === product.priceId) {
                return (
                  (subscription?.subscription_status === 'active' && !subscription?.cancel_at_period_end) ||
                  subscription?.subscription_status === 'trialing'
                );
              }

              // CASE 4: Team subscription detection
              if (subscription?.is_team_member &&
                  ['price_1RwOhVBacFXEnBmNIeWQ1wQe', 'price_1RwP9cBacFXEnBmNsM3xVLL2'].includes(product.priceId)) {
                return true;
              }

              return false;
            })();

            return (
              <ProductCard
                key={product.id}
                product={product}
                isCurrentPlan={isCurrentPlan}
              />
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <div className="bg-white border-2 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-12 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-black mb-6 uppercase tracking-wide">
              WHY CHOOSE PRO?
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Start with a 7-day free trial to explore advanced AI workflow capabilities. 
              Cancel anytime during or after your trial period.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-black font-medium">
              <div className="flex items-center justify-center gap-2 p-3 border border-black rounded-none">
                <span>✓</span>
                <span className="uppercase tracking-wide">7-DAY FREE TRIAL</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 border border-black rounded-none">
                <span>✓</span>
                <span className="uppercase tracking-wide">CANCEL ANYTIME</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 border border-black rounded-none">
                <span>✓</span>
                <span className="uppercase tracking-wide">INSTANT ACCESS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}