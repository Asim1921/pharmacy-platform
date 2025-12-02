# Database Seeding Script

This script populates your Firestore database with sample data for testing and development.

## What It Creates

- **12 Pharmacies** across different cities in the US with realistic locations
- **250+ Products** distributed across all pharmacies, including:
  - Prescription medications (15 types)
  - Over-the-counter drugs (15 types)
  - Wellness products (15 types)
  - Vitamins (10 types)
  - Supplements (15 types)

## Features

- Each pharmacy has unique location coordinates for the map
- Products are randomly distributed across pharmacies
- Realistic product data including:
  - Name, category, price
  - Dosage information
  - Expiry dates (1-3 years from now)
  - Random quantities (0-100)
  - Descriptions, usage instructions
  - Side effects and health information

## How to Run

1. Make sure your Firebase configuration is set up in `lib/firebase.ts`

2. Run the seed script:
   ```bash
   npm run seed
   ```

3. The script will:
   - Create all pharmacies first
   - Then create products distributed across pharmacies
   - Show progress as it creates products
   - Display a summary when complete

## Output

The script will output:
- Progress messages for each pharmacy created
- Progress updates every 25 products
- Final summary with counts

Example output:
```
🌱 Starting database seeding...

📍 Creating pharmacies...
✅ Created pharmacy: HealthCare Pharmacy Downtown (ID: ...)
...
✅ Created 12 pharmacies

💊 Creating products...
   Progress: 25/250 products created...
   Progress: 50/250 products created...
...
✅ Created 250 products

🎉 Database seeding completed successfully!

Summary:
   - Pharmacies: 12
   - Products: 250
   - Average products per pharmacy: 21
```

## Notes

- The script uses your Firebase credentials from `lib/firebase.ts`
- Products are randomly assigned to pharmacies
- Prices have slight variations (±$2.50) for realism
- Expiry dates are randomly set 1-3 years in the future
- Quantities are randomly set between 0-100

## Troubleshooting

If you encounter errors:
1. Make sure Firebase is properly configured
2. Ensure Firestore is enabled in your Firebase project
3. Check that you have write permissions in Firestore
4. Verify your Firebase credentials are correct

