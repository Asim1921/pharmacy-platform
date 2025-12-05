# Setup Guide for PharmaHub

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Create a `.env.local` file in the root directory
   - Add your Firebase configuration (see `.env.example`)

3. **Set up Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password provider)
   - Create a Firestore database (start in test mode for development)
   - Copy your Firebase config to `.env.local`

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Create Admin User**

   **Option 1: Using Seed Script (Recommended)**
   - Run `npm run seed` to seed the database
   - The script will attempt to create an admin user automatically
   - Default credentials: `admin@pharmacy.com` / `admin123`
   - See `ADMIN_CREDENTIALS.md` for details

   **Option 2: Manual Creation**
   - Register a new account through the UI
   - In Firebase Console → Firestore → `users` collection
   - Find your user document and change `role` field to `"admin"`

## Firebase Firestore Structure

### Collections

#### users
```
{
  name: string,
  email: string,
  role: "user" | "admin",
  createdAt: timestamp
}
```

#### pharmacies
```
{
  name: string,
  address: string,
  city: string,
  state: string,
  zipCode: string,
  phone: string,
  email: string,
  latitude: number,
  longitude: number,
  createdAt: timestamp
}
```

#### products
```
{
  pharmacyId: string,
  name: string,
  category: "prescription" | "over-the-counter" | "wellness" | "vitamins" | "supplements",
  price: number,
  dosage?: string,
  expiryDate: timestamp,
  quantity: number,
  description?: string,
  healthInfo?: string,
  usage?: string,
  sideEffects?: string,
  createdAt: timestamp
}
```

#### orders
```
{
  userId: string,
  items: [
    {
      productId: string,
      productName: string,
      quantity: number,
      price: number,
      pharmacyId: string,
      pharmacyName: string
    }
  ],
  totalAmount: number,
  status: "pending" | "confirmed" | "processing" | "completed" | "cancelled",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Firestore Security Rules (Development)

For development, you can use these rules. **Update for production!**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /pharmacies/{pharmacyId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Testing the Application

1. **As a Regular User:**
   - Register/Login
   - Browse products
   - Search by category/location
   - Add products to cart
   - Remove items from cart (before checkout)
   - Place order
   - View order history

2. **As an Admin:**
   - Login with admin account
   - Access dashboard
   - Add/Edit/Delete pharmacies
   - Add/Edit/Delete products
   - View all orders
   - Monitor inventory levels

3. **Map Feature:**
   - Navigate to Map page
   - Click on pharmacy markers
   - View pharmacy details and products
   - Order directly from map view

## Troubleshooting

### Leaflet Map Not Loading
- Ensure Leaflet CSS is imported (already done in `app/map/page.tsx`)
- Check browser console for errors
- Verify pharmacy data has valid latitude/longitude

### Firebase Connection Issues
- Verify `.env.local` file exists and has correct values
- Check Firebase project settings
- Ensure Firestore is enabled
- Verify Authentication is enabled

### Admin Access Not Working
- Check user role in Firestore `users` collection
- Ensure role field is exactly `"admin"` (lowercase)
- Try logging out and back in

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Update Firestore security rules for production
3. Set environment variables in your hosting platform
4. Deploy to Vercel, Netlify, or your preferred platform

## Notes

- The application uses client-side rendering for maps (Leaflet)
- All data is stored in Firebase Firestore
- Authentication is handled by Firebase Auth
- Cart state is managed in Zustand (client-side only)

