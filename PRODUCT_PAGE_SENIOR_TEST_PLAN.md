# 🎯 SENIOR-LEVEL PRODUCT PAGE TEST PLAN

## **CRITICAL SUBSCRIPTION STATES TO TEST**

### **1. NEW USER (Never Subscribed)**
**Expected State:**
- Trial Timer: Shows 7-day countdown
- Standard Card: "CURRENT PLAN" (disabled)
- Pro Card: "GET GO PRO" (enabled)
- Limited Time Card: "GET LIMITED TIME" (enabled)

**Test Cases:**
```
✅ User sees trial countdown
✅ Standard is marked as current plan
✅ Can click Pro/Limited Time to subscribe
✅ Cannot click Standard (already on it)
```

### **2. ACTIVE PRO SUBSCRIBER**
**Expected State:**
- Trial Timer: "PRO SUBSCRIPTION ACTIVE"
- Standard Card: "SWITCH TO STANDARD" (enabled)
- Pro Card: "CURRENT PLAN" (disabled)
- Limited Time Card: "GET LIMITED TIME" (enabled)

**Test Cases:**
```
✅ Pro is marked as current plan
✅ Can switch to Standard (pause subscription)
✅ Can upgrade to Limited Time
✅ Cannot click Pro (already on it)
```

### **3. CANCELLED PRO SUBSCRIBER (Still in Period)**
**Expected State:**
- Trial Timer: Shows cancellation notice + period end date
- Standard Card: "CURRENT PLAN" (disabled) - will become Standard at period end
- Pro Card: "GET GO PRO" (enabled) - can resubscribe
- Limited Time Card: "GET LIMITED TIME" (enabled)

**Test Cases:**
```
✅ Shows cancellation notice
✅ Standard shows as current (future state)
✅ Can resubscribe to Pro
✅ Can switch to Limited Time
```

### **4. STANDARD TIER USER (Paused)**
**Expected State:**
- Trial Timer: "STANDARD TIER - ACCOUNT PAUSED"
- Standard Card: "CURRENT PLAN" (disabled)
- Pro Card: "GET GO PRO" (enabled)
- Limited Time Card: "GET LIMITED TIME" (enabled)

**Test Cases:**
```
✅ Shows paused status
✅ Standard is current plan
✅ Can subscribe to Pro
✅ Can subscribe to Limited Time
```

### **5. SUPER ADMIN**
**Expected State:**
- Trial Timer: "PRO SUBSCRIPTION ACTIVE - ADMIN"
- Standard Card: "SWITCH TO STANDARD" (enabled)
- Pro Card: "CURRENT PLAN" (disabled)
- Limited Time Card: "GET LIMITED TIME" (enabled)

**Test Cases:**
```
✅ Admin has infinite Pro access
✅ Pro is marked as current
✅ Can still switch to Standard if needed
✅ Can get Limited Time
```

### **6. TEAM MEMBER**
**Expected State:**
- Depends on team admin's subscription status
- If admin has Team Pro: Member gets Pro access
- If admin cancelled: Member gets Standard access

**Test Cases:**
```
✅ Team member access reflects admin status
✅ Correct plan marked as current
✅ Cannot independently subscribe (team managed)
```

## **EDGE CASES TO TEST**

### **A. Subscription State Transitions**
```
1. Pro → Cancel → Resubscribe
2. Trial → Pro → Cancel → Standard
3. Standard → Pro → Limited Time
4. Limited Time → Cancel → Standard
```

### **B. Data Inconsistency Scenarios**
```
1. User has subscription_id but status is null
2. User has customer_id but no subscription_id
3. User has cancelled subscription but still shows active
4. User has expired trial but no subscription
```

### **C. Race Condition Tests**
```
1. User clicks multiple subscription buttons rapidly
2. Subscription status changes while on product page
3. Trial expires while viewing products
4. Admin changes user status while user is active
```

## **AUTOMATED TEST SCENARIOS**

### **Test 1: Current Plan Detection Logic**
```javascript
// Test all user states and verify correct plan detection
const testCases = [
  { userState: 'new_trial', expectedCurrent: 'standard' },
  { userState: 'active_pro', expectedCurrent: 'pro' },
  { userState: 'cancelled_pro', expectedCurrent: 'standard' },
  { userState: 'standard_tier', expectedCurrent: 'standard' },
  { userState: 'admin', expectedCurrent: 'pro' }
];
```

### **Test 2: Button State Validation**
```javascript
// Verify button states for each user type
const buttonTests = [
  { userState: 'new_trial', standardButton: 'disabled', proButton: 'enabled' },
  { userState: 'active_pro', standardButton: 'enabled', proButton: 'disabled' },
  { userState: 'cancelled_pro', standardButton: 'disabled', proButton: 'enabled' }
];
```

### **Test 3: Subscription Flow Testing**
```javascript
// Test complete subscription flows
const flowTests = [
  'trial_to_pro_subscription',
  'pro_to_standard_switch',
  'standard_to_pro_resubscribe',
  'pro_to_limited_time_upgrade'
];
```

## **CRITICAL BUGS TO WATCH FOR**

### **🚨 High Priority Issues**
1. **Double Subscription**: User can subscribe to multiple plans
2. **Wrong Current Plan**: Incorrect plan marked as current
3. **Button State Mismatch**: Enabled buttons when should be disabled
4. **Timer Confusion**: Wrong timer state for user's actual status

### **⚠️ Medium Priority Issues**
1. **UI Inconsistency**: Different styling for same states
2. **Loading States**: Buttons not showing loading properly
3. **Error Handling**: Poor error messages for failed actions

### **ℹ️ Low Priority Issues**
1. **Text Clarity**: Confusing button text
2. **Visual Polish**: Minor styling inconsistencies

## **TESTING CHECKLIST**

### **Before Release:**
- [ ] Test all 6 main user states
- [ ] Verify all edge cases work
- [ ] Test subscription transitions
- [ ] Validate button states
- [ ] Check timer accuracy
- [ ] Test error scenarios
- [ ] Verify admin overrides
- [ ] Test team functionality

### **Post-Release Monitoring:**
- [ ] Monitor subscription creation errors
- [ ] Track user confusion metrics
- [ ] Watch for support tickets about pricing
- [ ] Monitor cancellation/resubscription flows

## **SUCCESS CRITERIA**

✅ **Zero subscription state confusion**
✅ **Correct current plan detection 100% of time**
✅ **No double subscriptions possible**
✅ **Clear user journey for all states**
✅ **Proper error handling for all edge cases**
