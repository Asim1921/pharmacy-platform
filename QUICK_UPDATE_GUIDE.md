# Quick Guide: Temporarily Allow Writes to Update Locations

## ⚠️ IMPORTANT: These rules are INSECURE - Use only temporarily!

## Quick Steps

### 1. Go to Firebase Console
- Open: https://console.firebase.google.com/
- Select project: **pharmacy-platform-c659c**
- Click **Firestore Database** → **Rules** tab

### 2. Replace Rules (Temporary)
**Delete all existing rules** and paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY RULES - REVERT AFTER UPDATING!
    
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /pharmacies/{pharmacyId} {
      allow read: if true;
      allow write: if true; // TEMPORARY - allows anyone
    }
    
    match /products/{productId} {
      allow read: if true;
      allow write: if true; // TEMPORARY - allows anyone
    }
    
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

3. Click **Publish**

### 3. Run Update Script
```bash
npm run update-locations
```

### 4. REVERT RULES BACK (Critical!)
1. Go back to Firebase Console → Firestore → Rules
2. Delete temporary rules
3. Copy rules from `firestore.rules` file in your project
4. Paste and click **Publish**

## ⚠️ Security Warning
**DO NOT leave temporary rules active!** They allow anyone to modify data.

