# Razorpay "International Cards Not Supported" - Troubleshooting Guide

## Issue
Even with INR currency selected, you're getting: "International cards are not supported"

## Possible Causes & Solutions

### 1. Razorpay Account Configuration Issue

Your Razorpay test account might not be properly configured for domestic payments.

**Solution:**
1. Log in to Razorpay Dashboard: https://dashboard.razorpay.com
2. Go to **Settings** → **Payment Methods**
3. Check if **Domestic Cards** is enabled
4. Ensure your account is activated for test mode

### 2. Test Card Issue

The card `4111 1111 1111 1111` might be flagged. Try alternative INR test cards:

**Alternative INR Test Cards:**
- `5104 0600 0000 0008` (Mastercard - Domestic)
- `4012 0000 0000 0002` (Visa - Domestic)

**Details:**
- CVV: Any 3 digits (e.g., 123)
- Expiry: Any future date (e.g., 12/25)
- Name: Any name

### 3. Currency Mismatch

Even if you see INR in the UI, verify it's being sent correctly.

**Check:**
1. Open browser console (F12)
2. Look for "Payment Details" log when clicking Pay Now
3. Verify `currency: "INR"` is shown

### 4. Razorpay Account Region

Your Razorpay account might be set up for a different region.

**Solution:**
1. Check your Razorpay account region in dashboard
2. Ensure it's set to India
3. Contact Razorpay support if region is incorrect

### 5. Test Mode Restrictions

Some Razorpay test accounts have restrictions.

**Solution:**
1. Try creating a fresh test account
2. Or contact Razorpay support to enable domestic payments

## Quick Fixes to Try

### Fix 1: Use Alternative Test Card
```
Card: 5104 0600 0000 0008
CVV: 123
Expiry: 12/25
Currency: INR
```

### Fix 2: Check Browser Console
1. Open browser console (F12)
2. Click "Pay Now"
3. Check the "Payment Details" log
4. Verify currency is "INR"

### Fix 3: Verify Razorpay Order
Check what's being sent to Razorpay:
1. Open Network tab in browser console
2. Look for `/api/payments/create-order` request
3. Check the request body - verify `currency: "INR"`

### Fix 4: Test with Different Browser
Sometimes browser extensions or settings can interfere.

## Debug Steps

1. **Check Currency in Console:**
   ```javascript
   // When you click Pay Now, you should see:
   Payment Details: { currency: "INR", amount: ..., originalCurrency: "INR" }
   ```

2. **Check Network Request:**
   - Open Network tab
   - Find `create-order` request
   - Check request payload has `currency: "INR"`

3. **Check Razorpay Response:**
   - Look for Razorpay order creation response
   - Verify it has `currency: "INR"`

## Contact Razorpay Support

If none of the above works, contact Razorpay support:

1. **Email:** support@razorpay.com
2. **Dashboard:** Go to Settings → Support
3. **Mention:**
   - You're using test mode
   - Currency is INR
   - Getting "International cards not supported" error
   - Account ID: rzp_test_RfA1p0DJC2RGk4

## Alternative: Force INR in Code

If you want to always use INR regardless of user selection (for testing):

The code has been updated to log the currency being used. Check the browser console to see what's actually being sent.

## Most Likely Solution

Based on the error, try this **Mastercard test card** for INR:

```
Card Number: 5104 0600 0000 0008
CVV: 123
Expiry: 12/25
Currency: INR
```

This card is specifically for domestic INR payments and should work better than the Visa card.

---

**Next Steps:**
1. Try the Mastercard test card: `5104 0600 0000 0008`
2. Check browser console for currency logs
3. Verify Razorpay dashboard settings
4. Contact Razorpay support if issue persists


