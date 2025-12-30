# 🚨 URGENT: Deploy Firestore Rules to Fix Cancel Order

## The Problem
Users cannot cancel orders because Firestore rules haven't been deployed or are too strict.

## The Solution
Copy and paste these EXACT rules into Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Pharmacies collection - public read, admin write
    match /pharmacies/{pharmacyId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Products collection - public read, admin write, users can update quantity
    match /products/{productId} {
      allow read: if true;
      // Allow authenticated users to update quantity (for order placement/cancellation)
      allow update: if request.auth != null && 
        (isAdmin() || request.resource.data.diff(resource.data).affectedKeys().hasOnly(['quantity']));
      // Only admins can create/delete products
      allow create, delete: if isAdmin();
    }
    
    // Orders collection
    match /orders/{orderId} {
      // Users can read their own orders, admins can read all
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || isAdmin());
      // Users can create their own orders
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      // Users can update their own pending orders, admins can update any order
      allow update: if request.auth != null && 
        (isAdmin() || (resource.data.userId == request.auth.uid && resource.data.status == 'pending'));
    }
  }
}
```

## Step-by-Step Deployment

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Select project: **pharmacy-platform-c659c**

2. **Navigate to Firestore Rules**
   - Click **Firestore Database** (left sidebar)
   - Click **Rules** tab (top of page)

3. **Replace Rules**
   - Select ALL existing rules (Ctrl+A / Cmd+A)
   - DELETE them
   - PASTE the rules above (entire block)

4. **Publish**
   - Click **Publish** button (top right, blue button)
   - Wait for "Rules published successfully" message

5. **Test**
   - Refresh your browser
   - Try canceling an order
   - It should work now! ✅

## What These Rules Do

✅ **Users can cancel their own pending orders** - This is the key fix!
✅ Users can update product quantities (for orders)
✅ Admins have full access
✅ All other security remains intact

## If It Still Doesn't Work

1. **Check Rules Were Published**: Look for timestamp in Firebase Console
2. **Hard Refresh Browser**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Check User is Logged In**: Make sure you're authenticated
4. **Check Order Status**: Only 'pending' orders can be canceled
5. **Check Order Ownership**: You can only cancel your own orders

## Verification

After deploying, you should see in Firebase Console:
- Rules tab shows the new rules
- "Last published: [timestamp]"
- No syntax errors (red indicators)

