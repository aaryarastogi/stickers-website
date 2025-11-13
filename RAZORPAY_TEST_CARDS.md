# Razorpay Test Cards Guide

## ⚠️ Important: Currency Matters!

Razorpay test cards work differently based on the currency you're using:

### For INR (Indian Rupee) - Domestic Payments

Use these cards for **INR currency only**:

| Card Number | Card Type | Result |
|------------|-----------|--------|
| `4111 1111 1111 1111` | Visa | ✅ Success |
| `5104 0600 0000 0008` | Mastercard | ✅ Success |
| `4000 0000 0000 0002` | Visa | ❌ Failure |
| `4000 0000 0000 9995` | Visa | ❌ Insufficient Funds |

**Details:**
- CVV: Any 3 digits (e.g., 123)
- Expiry: Any future date (e.g., 12/25)
- Name: Any name

### For International Currencies (USD, GBP, EUR, etc.)

Use these cards for **non-INR currencies**:

| Card Number | Card Type | Result |
|------------|-----------|--------|
| `5555 5555 5555 4444` | Mastercard | ✅ Success (International) |
| `4012 8888 8888 1881` | Visa | ✅ Success (International) |
| `4000 0000 0000 0002` | Visa | ❌ Failure |
| `4000 0000 0000 9995` | Visa | ❌ Insufficient Funds |

**Details:**
- CVV: Any 3 digits (e.g., 123)
- Expiry: Any future date (e.g., 12/25)
- Name: Any name

## 🔧 Solution for Your Issue

Since you're getting "International cards are not supported" error, you have two options:

### Option 1: Use INR Currency (Recommended for Testing)

1. Change your currency to INR in the frontend
2. Use the domestic test card: `4111 1111 1111 1111`

### Option 2: Use International Test Cards

1. Keep your selected currency (USD, GBP, etc.)
2. Use international test card: `5555 5555 5555 4444` or `4012 8888 8888 1881`

## 📝 Quick Test Steps

1. **For INR payments:**
   - Select INR currency
   - Use: `4111 1111 1111 1111`
   - CVV: 123
   - Expiry: 12/25

2. **For USD/GBP/EUR payments:**
   - Select your currency
   - Use: `5555 5555 5555 4444`
   - CVV: 123
   - Expiry: 12/25

## ⚙️ Enable International Payments in Razorpay

If you want to accept international payments in production:

1. Log in to Razorpay Dashboard
2. Go to **Settings** → **Payment Methods**
3. Enable **International Cards**
4. Complete any required verification

**Note:** International payments may require additional account verification.

## 🧪 All Test Cards Summary

### Success Cards
- **Domestic (INR)**: `4111 1111 1111 1111`, `5104 0600 0000 0008`
- **International**: `5555 5555 5555 4444`, `4012 8888 8888 1881`

### Failure Cards
- `4000 0000 0000 0002` - Payment failed
- `4000 0000 0000 9995` - Insufficient funds

## 📞 Need Help?

- Razorpay Test Cards: https://razorpay.com/docs/payments/test-cards/
- Razorpay Support: support@razorpay.com

---

**Current Issue**: Using `4111 1111 1111 1111` with non-INR currency causes "International cards not supported" error.

**Solution**: Either switch to INR currency OR use international test cards (`5555 5555 5555 4444`).


