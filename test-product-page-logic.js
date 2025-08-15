/**
 * 🎯 SENIOR-LEVEL PRODUCT PAGE LOGIC TESTER
 * Tests all subscription states and edge cases
 */

// Mock user states for testing
const mockUserStates = {
  newTrial: {
    subscription: null,
    isPaidUser: false,
    isTrialing: false,
    isFreeTrialing: true,
    user: { id: 'user1' }
  },
  
  activePro: {
    subscription: {
      subscription_id: 'sub_123',
      price_id: 'price_1Rv4rDBacFXEnBmNDMrhMqOH',
      subscription_status: 'active',
      customer_id: 'cus_123'
    },
    isPaidUser: true,
    isTrialing: false,
    isFreeTrialing: false,
    user: { id: 'user2' }
  },
  
  cancelledPro: {
    subscription: {
      subscription_id: 'sub_123',
      price_id: 'price_1Rv4rDBacFXEnBmNDMrhMqOH',
      subscription_status: 'active',
      cancel_at_period_end: true,
      customer_id: 'cus_123'
    },
    isPaidUser: true,
    isTrialing: false,
    isFreeTrialing: false,
    user: { id: 'user3' }
  },
  
  standardTier: {
    subscription: {
      subscription_id: null,
      subscription_status: 'canceled',
      customer_id: 'cus_123'
    },
    isPaidUser: false,
    isTrialing: false,
    isFreeTrialing: false,
    user: { id: 'user4' }
  },
  
  superAdmin: {
    subscription: null,
    isPaidUser: false,
    isTrialing: false,
    isFreeTrialing: false,
    user: { id: 'stefanjohnmiranda5@gmail.com' } // Admin email as ID
  },
  
  limitedTime: {
    subscription: {
      subscription_id: 'sub_456',
      price_id: 'price_1RwNgiBacFXEnBmNu1PwJnYK',
      subscription_status: 'active',
      customer_id: 'cus_456'
    },
    isPaidUser: true,
    isTrialing: false,
    isFreeTrialing: false,
    user: { id: 'user5' }
  }
};

// Mock products
const mockProducts = [
  {
    id: 'standard_product',
    priceId: 'standard_price',
    name: 'Standard'
  },
  {
    id: 'pro_product',
    priceId: 'price_1Rv4rDBacFXEnBmNDMrhMqOH',
    name: 'Go Pro'
  },
  {
    id: 'limited_time_product',
    priceId: 'price_1RwNgiBacFXEnBmNu1PwJnYK',
    name: 'Limited Time'
  }
];

// Mock admin check function
function isSuperAdmin(userId) {
  return userId === 'stefanjohnmiranda5@gmail.com';
}

// 🎯 BULLETPROOF CURRENT PLAN DETECTION (copied from ProductsPage.tsx)
function isCurrentPlan(product, userState) {
  const { subscription, isPaidUser, isTrialing, isFreeTrialing, user } = userState;
  
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
}

// Test runner
function runTests() {
  console.log('🎯 RUNNING PRODUCT PAGE LOGIC TESTS\n');
  
  const testResults = [];
  
  // Test each user state against each product
  Object.entries(mockUserStates).forEach(([stateName, userState]) => {
    console.log(`\n📋 Testing ${stateName.toUpperCase()}:`);
    
    mockProducts.forEach(product => {
      const result = isCurrentPlan(product, userState);
      const testResult = {
        userState: stateName,
        product: product.name,
        isCurrentPlan: result
      };
      
      testResults.push(testResult);
      console.log(`  ${product.name}: ${result ? '✅ CURRENT' : '❌ NOT CURRENT'}`);
    });
  });
  
  // Validate expected results
  console.log('\n🔍 VALIDATING EXPECTED RESULTS:\n');
  
  const expectedResults = {
    newTrial: { Standard: true, 'Go Pro': false, 'Limited Time': false },
    activePro: { Standard: false, 'Go Pro': true, 'Limited Time': false },
    cancelledPro: { Standard: true, 'Go Pro': false, 'Limited Time': false }, // Will become Standard
    standardTier: { Standard: true, 'Go Pro': false, 'Limited Time': false },
    superAdmin: { Standard: false, 'Go Pro': true, 'Limited Time': false },
    limitedTime: { Standard: false, 'Go Pro': false, 'Limited Time': true }
  };
  
  let allTestsPassed = true;
  
  Object.entries(expectedResults).forEach(([stateName, expected]) => {
    const userResults = testResults.filter(r => r.userState === stateName);
    
    Object.entries(expected).forEach(([productName, expectedCurrent]) => {
      const actualResult = userResults.find(r => r.product === productName);
      const passed = actualResult?.isCurrentPlan === expectedCurrent;
      
      if (!passed) {
        allTestsPassed = false;
        console.log(`❌ FAILED: ${stateName} -> ${productName} (expected: ${expectedCurrent}, got: ${actualResult?.isCurrentPlan})`);
      } else {
        console.log(`✅ PASSED: ${stateName} -> ${productName}`);
      }
    });
  });
  
  console.log(`\n🎯 FINAL RESULT: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return { allTestsPassed, testResults };
}

// Run the tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTests, mockUserStates, isCurrentPlan };
} else {
  runTests();
}
