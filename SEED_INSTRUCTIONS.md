# Database Seeding Instructions

## Quick Start

To populate your Firestore database with sample data, simply run:

```bash
npm run seed
```

## What Gets Created

### Pharmacies (12 locations)
- HealthCare Pharmacy Downtown - New York, NY
- MediQuick Pharmacy - Los Angeles, CA
- Wellness Corner Pharmacy - Chicago, IL
- Family Care Pharmacy - Houston, TX
- Community Health Pharmacy - Phoenix, AZ
- QuickMed Pharmacy - Philadelphia, PA
- GreenLeaf Pharmacy - San Antonio, TX
- CityMed Pharmacy - San Diego, CA
- Neighborhood Pharmacy - Dallas, TX
- HealthFirst Pharmacy - San Jose, CA
- PrimeCare Pharmacy - Austin, TX
- VitalHealth Pharmacy - Jacksonville, FL

Each pharmacy includes:
- Full address and contact information
- GPS coordinates (latitude/longitude) for map display
- Email and phone number

### Products (250+ items)

The script creates products across 5 categories:

1. **Prescription Medications** (15 types)
   - Amoxicillin, Lisinopril, Metformin, Atorvastatin, etc.
   - Includes dosage, usage instructions, side effects

2. **Over-the-Counter Drugs** (15 types)
   - Ibuprofen, Acetaminophen, Aspirin, Antihistamines, etc.
   - Common OTC medications with usage guidelines

3. **Wellness Products** (15 types)
   - Echinacea, Probiotics, Turmeric, Omega-3, Melatonin, etc.
   - Natural health supplements

4. **Vitamins** (10 types)
   - Vitamin D3, Vitamin C, B-Complex, Folic Acid, etc.
   - Essential vitamins with proper dosages

5. **Supplements** (15 types)
   - Calcium, Iron, Zinc, Glucosamine, Protein powders, etc.
   - Health and fitness supplements

### Product Details

Each product includes:
- ✅ Name and category
- ✅ Price (with slight variations for realism)
- ✅ Dosage information (where applicable)
- ✅ Expiry date (1-3 years from now)
- ✅ Quantity in stock (0-100)
- ✅ Description
- ✅ Usage instructions
- ✅ Side effects (for medications)
- ✅ Health information

## Distribution

- Products are randomly distributed across all 12 pharmacies
- Average of ~21 products per pharmacy
- Some pharmacies may have more products than others (realistic distribution)
- Products are randomly assigned to ensure variety

## Before Running

1. ✅ Make sure Firebase is configured in `lib/firebase.ts`
2. ✅ Ensure Firestore is enabled in your Firebase Console
3. ✅ Verify you have write permissions

## After Running

1. Check Firebase Console → Firestore to see your data
2. Visit the map page to see pharmacies on the map
3. Browse products page to see all available products
4. Test search functionality with various filters

## Important Notes

- ⚠️ This script will ADD data to your database
- ⚠️ It will NOT delete existing data
- ⚠️ Running it multiple times will create duplicate pharmacies and products
- ✅ Safe to run if your database is empty
- ✅ Products have realistic data for testing

## Troubleshooting

**Error: "Permission denied"**
- Check Firestore security rules
- Ensure you're authenticated or rules allow writes

**Error: "Firebase not initialized"**
- Verify Firebase config in `lib/firebase.ts`
- Check that credentials are correct

**Products not showing up**
- Wait a few seconds for Firestore to sync
- Refresh your browser
- Check Firestore Console to verify data was created

## Customization

To modify the seed script:
- Edit `pharmacy-platform/scripts/seed-database.ts`
- Add more pharmacies in the `pharmacies` array
- Add more products in the product arrays
- Adjust quantities, prices, or other fields as needed

## Admin User

The seed script attempts to create a default admin user with these credentials:

**Email:** `admin@pharmacy.com`  
**Password:** `admin123`

If the admin user is created successfully, you can login immediately with these credentials.

If the admin user creation fails (due to Firebase Auth limitations), see `ADMIN_CREDENTIALS.md` for manual setup instructions.

## Next Steps

After seeding:
1. Login with admin credentials (or create manually if needed)
2. Test the application with real data
3. Explore the map to see all pharmacy locations
4. Test product search and filtering
5. Place test orders to verify the ordering system

