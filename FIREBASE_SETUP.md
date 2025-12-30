# Firebase Firestore Security Rules Setup

## Issue: "Missing or insufficient permissions"

If you're getting permission errors when trying to load products, you need to update your Firestore security rules.

## Quick Fix (Recommended)

### Option 1: Update Rules in Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `pharmacy-platform-c659c`
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Copy and paste the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Pharmacies collection - public read, admin write
    match /pharmacies/{pharmacyId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Products collection - public read, admin write, users can update quantity on order
    match /products/{productId} {
      allow read: if true;
      // Allow authenticated users to update quantity (for order placement/cancellation)
      // Allow admins full write access
      allow update: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         // Users can only update quantity field (increment or decrement)
         (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['quantity'])));
      // Only admins can create/delete products
      allow create, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders collection
    match /orders/{orderId} {
      // Users can read their own orders, admins can read all
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      // Users can create their own orders
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      // Users can update their own pending orders to cancel them, admins can update any order
      allow update: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         // Users can only cancel their own pending orders
         (resource.data.userId == request.auth.uid &&
          resource.data.status == 'pending' &&
          request.resource.data.status == 'cancelled' &&
          request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'updatedAt'])));
    }
  }
}
```

6. Click **Publish** button
7. Wait a few seconds for rules to deploy
8. Refresh your application

### Option 2: Using Firebase CLI (If you have it installed)

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init firestore
   ```

4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## What These Rules Do

- **Products & Pharmacies**: Anyone can read (public access), only admins can write
- **Users**: Users can read any user, but only write their own data
- **Orders**: Users can read their own orders and create orders, admins can read/update all orders

## Testing

After updating the rules:
1. Refresh your browser
2. Try loading the products page
3. The "Missing or insufficient permissions" error should be gone

## Troubleshooting

### Still Getting Permission Errors?

1. **Check Firestore Mode**: 
   - Go to Firebase Console → Firestore Database
   - Make sure it's in **Production mode** (not Test mode with 30-day expiration)
   - If in Test mode, you need to be authenticated to read

2. **Verify Rules Are Deployed**:
   - Check the Rules tab in Firebase Console
   - Make sure your rules match the ones above
   - Click "Publish" if you see unsaved changes

3. **Clear Browser Cache**:
   - Sometimes cached permission errors persist
   - Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

4. **Check Authentication**:
   - For orders, you need to be logged in
   - Products and pharmacies should work without login

## Development vs Production

**For Development**: The rules above are fine and allow public reading of products/pharmacies.

**For Production**: Consider restricting product reads to authenticated users only:
```javascript
match /products/{productId} {
  allow read: if request.auth != null;  // Require login
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

