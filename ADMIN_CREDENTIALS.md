# Admin User Credentials

## Default Admin Account

After running the seed script, you can use these credentials to login as an admin:

**Email:** `admin@pharmacy.com`  
**Password:** `admin123`

## Important Notes

⚠️ **Security Warning:** These are default credentials for development/testing only.  
⚠️ **Change the password immediately** in production environments.

## If Admin User Creation Fails

If the seed script cannot create the admin user automatically (due to Firebase Auth limitations in Node.js), you can manually create it:

1. **Option 1: Register through UI**
   - Go to the registration page
   - Register with email: `admin@pharmacy.com` and password: `admin123`
   - Go to Firebase Console → Firestore → `users` collection
   - Find the user document and change `role` field to `"admin"`

2. **Option 2: Use Firebase Console**
   - Go to Firebase Console → Authentication
   - Add a new user with email: `admin@pharmacy.com` and password: `admin123`
   - Go to Firestore → `users` collection
   - Create a document with the user's UID and set:
     ```json
     {
       "name": "Admin User",
       "email": "admin@pharmacy.com",
       "role": "admin",
       "createdAt": [timestamp]
     }
     ```

## Testing Admin Access

After logging in with admin credentials:
- You should see "Dashboard" link in the navbar
- You can access `/dashboard` to manage pharmacies, products, and orders
- You have full CRUD permissions for all resources

