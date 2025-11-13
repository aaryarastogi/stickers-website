# Razorpay Payment Configuration - Step by Step

## Current Location
You're on: **Account & Settings → Payment Configuration**

## Next Steps to Enable Domestic Cards

### Step 1: Click "View" Button
1. On the **"Standard payment options"** card (the one with blue outline)
2. Click the blue **"View"** button on the right side
3. This will open detailed payment method settings

### Step 2: In Payment Methods Settings
Once you click "View", you should see:
- List of payment methods (Cards, Netbanking, Wallets, etc.)
- Toggle switches or checkboxes for each method
- Look for:
  - **Domestic Cards** or **Indian Cards**
  - **International Cards** (this might be disabled, which is causing your issue)
  - **Card Types** section

### Step 3: Enable Domestic Cards
1. Find the **Cards** section
2. Look for **"Domestic Cards"** or **"Indian Cards"**
3. Ensure it's **enabled/toggled ON**
4. If you see **"International Cards"**, you can enable it too (but domestic should work first)

### Step 4: Save Changes
1. Click **"Save"** or **"Update"** button
2. Wait for confirmation

## If "View" Button Doesn't Show Payment Methods

### Alternative: Create Custom Configuration
1. Click on **"Create a custom payment configuration"** (the card with + icon)
2. This might give you more control over payment methods
3. Enable domestic cards in the custom configuration

## What to Look For

In the payment methods settings, you should see options like:
- ✅ **Domestic Cards** (should be enabled)
- ❌ **International Cards** (might be disabled - this is okay for INR)
- **Card Types**: Visa, Mastercard, RuPay, etc.
- **Netbanking**
- **Wallets**
- **UPI**

## Expected Result

After enabling domestic cards:
- You should be able to use test cards like `4111 1111 1111 1111` or `5104 0600 0000 0008`
- The "International cards are not supported" error should disappear
- INR payments should work with domestic test cards

## If Still Not Working

If you can't find domestic card settings:
1. Take a screenshot of what you see after clicking "View"
2. Contact Razorpay support with the screenshot
3. Ask them to enable domestic card payments for your test account

---

**Action Required:** Click the blue "View" button on "Standard payment options" card to proceed.

