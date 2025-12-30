# Deploy Firestore Rules - IMPORTANT

## Current Issue: Permission Errors

If you're getting "Missing or insufficient permissions" errors when canceling orders, you need to **deploy the updated Firestore rules** to Firebase.

## Quick Steps to Deploy Rules

### Step 1: Copy the Rules

Open `firestore.rules` in your project and copy ALL the content.

### Step 2: Deploy to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **pharmacy-platform-c659c**
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab at the top
5. **Delete all existing rules** and paste the new rules from `firestore.rules`
6. Click **Publish** button (top right)
7. Wait for the confirmation message

### Step 3: Verify

After publishing, try canceling an order again. It should work now.

## What the Rules Allow

- ✅ Users can cancel their own pending orders
- ✅ Users can update product quantities (for order placement/cancellation)
- ✅ Admins have full access to all collections
- ✅ Users can only read their own orders

## If It Still Doesn't Work

1. **Check the Rules Tab**: Make sure the rules were published successfully (you should see a timestamp)
2. **Clear Browser Cache**: Sometimes cached permission errors persist
3. **Check Console**: Look for specific error messages in the browser console
4. **Verify User Role**: Make sure you're logged in and the user document exists in Firestore

## Current Rules (for reference)

The rules are in `firestore.rules` file. Key points:
- Orders: Users can update their own pending orders to cancel them
- Products: Users can update quantity field (increment/decrement)
- All other operations require admin role

