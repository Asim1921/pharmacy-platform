# Temporary Firestore Rules for Updating Locations

## ⚠️ IMPORTANT: These rules are INSECURE - Only use temporarily!

## Step-by-Step Instructions

### Step 1: Backup Current Rules
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **pharmacy-platform-c659c**
3. Go to **Firestore Database** → **Rules** tab
4. **Copy all existing rules** and save them somewhere (or they're in `firestore.rules` file)

### Step 2: Apply Temporary Rules
1. In Firebase Console → Firestore → Rules tab
2. **Delete all existing rules**
3. **Paste these TEMPORARY rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY RULES FOR UPDATING LOCATIONS - REVERT AFTER!
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Pharmacies collection - TEMPORARILY ALLOW ALL WRITES
    match /pharmacies/{pharmacyId} {
      allow read: if true;
      allow write: if true; // TEMPORARY - allows anyone to write
    }
    
    // Products collection - TEMPORARILY ALLOW ALL WRITES  
    match /products/{productId} {
      allow read: if true;
      allow write: if true; // TEMPORARY - allows anyone to write
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         (request.auth != null && 
          exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'));
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
        ((resource.data.userId == request.auth.uid && resource.data.status == 'pending') ||
         (request.auth != null && 
          exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'));
    }
  }
}
```

4. Click **Publish**

### Step 3: Run the Update Script
```bash
npm run update-locations
```

### Step 4: REVERT RULES BACK (CRITICAL!)
1. Go back to Firebase Console → Firestore → Rules
2. **Delete the temporary rules**
3. **Paste back the original rules** from `firestore.rules` file
4. Click **Publish**

## ⚠️ Security Warning

**DO NOT leave these temporary rules active!** They allow anyone to write to pharmacies and products, which is a security risk.

Only use them long enough to run the update script, then immediately revert!

