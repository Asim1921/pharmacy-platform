# Update Pharmacy Locations to UK - Guide

## The Script is Ready! ✅

I've created `scripts/update-pharmacy-locations.ts` that will update all existing pharmacies from US to UK locations.

## How to Run

### Option 1: Create Admin User First (Recommended)

1. **Create admin user:**
   ```bash
   npm run create-admin
   ```
   This creates: `admin@pharmacy.com` / `admin123456`

2. **Run the update script:**
   ```bash
   npm run update-locations
   ```

### Option 2: Use Firebase Console (Manual - No Script Needed)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **pharmacy-platform-c659c**
3. Go to **Firestore Database** → **Data** tab
4. Click on **pharmacies** collection
5. For each pharmacy, click to edit and update:
   - **city**: Change to UK city (London, Manchester, Birmingham, etc.)
   - **state**: Change to UK region (Greater London, Greater Manchester, etc.)
   - **zipCode**: Change to UK postcode
   - **phone**: Change to UK format (+44...)
   - **email**: Update domain to .co.uk
   - **address**: Update to UK address
   - **latitude**: Update to UK coordinates
   - **longitude**: Update to UK coordinates

### Option 3: Update Firestore Rules Temporarily

If you want the script to work without admin user:

1. Go to Firebase Console → Firestore → Rules
2. Temporarily allow writes to pharmacies:
   ```javascript
   match /pharmacies/{pharmacyId} {
     allow read: if true;
     allow write: if true; // TEMPORARY - for updating locations
   }
   ```
3. Run: `npm run update-locations`
4. **IMPORTANT**: Revert the rules back after updating!

## UK Locations Reference

The script will update pharmacies to these UK cities:
- London (W1D 2HX)
- Manchester (M2 4PD)
- Birmingham (B4 7ET)
- Edinburgh (EH2 4AD)
- Cardiff (CF10 2HQ)
- Bristol (BS1 5TR)
- Leeds (LS6 1DR)
- Liverpool (L1 4DQ)
- Newcastle (NE1 7RU)
- Sheffield (S1 2HQ)
- Nottingham (NG1 5DT)
- Leicester (LE1 6TP)

## What Gets Updated

- ✅ City name
- ✅ State/Region
- ✅ Address
- ✅ Postcode (zipCode)
- ✅ Phone number (UK format)
- ✅ Email domain (.co.uk)
- ✅ Latitude & Longitude (UK coordinates)
- ✅ Pharmacy name (updated to match UK location)

## After Updating

- The map will center on UK locations
- All pharmacies will show UK addresses
- Phone numbers will be in UK format
- Postcodes will be UK format

