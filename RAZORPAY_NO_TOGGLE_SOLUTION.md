# Razorpay - No Toggle Button Solution

## Issue
You're in "Standard payment options" but there's no toggle to enable/disable domestic cards. This is common in test accounts.

## Why This Happens
- Test accounts often have limited configuration options
- Payment methods are pre-configured and can't be changed in test mode
- The account might need activation or support intervention

## Solutions to Try

### Solution 1: Check Card Type Restrictions (If Available)
1. Click on the **"Cards"** card/option
2. Look for any settings about:
   - Card types (Visa, Mastercard, RuPay)
   - Domestic vs International
   - Any restrictions or filters
3. If you see any card type options, ensure all are enabled

### Solution 2: Try Different Test Cards
Since configuration isn't available, try these test cards in order:

**Option A - Mastercard (Most Likely to Work):**
```
Card: 5104 0600 0000 0008
CVV: 123
Expiry: 12/25
```

**Option B - RuPay (Domestic Indian Card):**
```
Card: 6074 8200 0000 0009
CVV: 123
Expiry: 12/25
```

**Option C - Visa Alternative:**
```
Card: 4012 0000 0000 0002
CVV: 123
Expiry: 12/25
```

### Solution 3: Check Account Activation Status
1. Look at the yellow banner at the top
2. It says "Activate your account" - this might be the issue
3. Try activating your account (if possible)
4. Or check if there are any pending verifications

### Solution 4: Contact Razorpay Support (Recommended)
Since you can't configure payment methods, contact support:

**Email:** support@razorpay.com

**Subject:** Test Account - Domestic Cards Not Working

**Message:**
```
Hi Razorpay Team,

I'm using test account Key ID: rzp_test_RfA1p0DJC2RGk4

I'm getting "International cards are not supported" error 
when trying to make INR payments with test cards.

I checked Payment Configuration but there are no toggle 
buttons to enable/disable payment methods in test mode.

Please:
1. Enable domestic card payments for my test account
2. Verify my account is configured for INR transactions
3. Confirm which test cards should work with my account

Thank you!
```

### Solution 5: Check if International Cards are Blocked
The error suggests Razorpay is detecting cards as international. This could mean:
- Your account is restricted to only certain card types
- There's an account-level setting you can't see
- The account needs to be activated/verified

## Most Likely Fix

Since you can't change settings in test mode, the issue is likely:
1. **Account-level restriction** - Only Razorpay support can fix this
2. **Wrong test card** - Try the Mastercard: `5104 0600 0000 0008`
3. **Account needs activation** - The yellow banner suggests activation

## Immediate Action Plan

1. **First:** Try Mastercard test card: `5104 0600 0000 0008`
2. **Second:** If that fails, email Razorpay support (template above)
3. **Third:** Check if you can activate your account (click the yellow banner)

## Why Test Mode is Limited

Razorpay test accounts are intentionally limited to:
- Prevent accidental changes
- Simplify testing
- Require support for account-level changes

This is why you can't see toggle buttons - they're not available in test mode.

---

**Next Step:** Try the Mastercard card first, then contact support if it doesn't work.

