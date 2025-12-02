import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDeZmWxNBpLQjM4gl-cED8OrQRLgbxI1j4",
  authDomain: "pharmacy-platform-c659c.firebaseapp.com",
  projectId: "pharmacy-platform-c659c",
  storageBucket: "pharmacy-platform-c659c.firebasestorage.app",
  messagingSenderId: "98779191892",
  appId: "1:98779191892:web:57955bab263b8af89d2bc1",
  measurementId: "G-T0DZMHJN1C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Pharmacy data with realistic locations (various cities)
const pharmacies = [
  {
    name: "HealthCare Pharmacy Downtown",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    phone: "(212) 555-0101",
    email: "downtown@healthcarepharmacy.com",
    latitude: 40.7128,
    longitude: -74.0060,
  },
  {
    name: "MediQuick Pharmacy",
    address: "456 Oak Avenue",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90001",
    phone: "(213) 555-0202",
    email: "info@mediquick.com",
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    name: "Wellness Corner Pharmacy",
    address: "789 Elm Street",
    city: "Chicago",
    state: "IL",
    zipCode: "60601",
    phone: "(312) 555-0303",
    email: "contact@wellnesscorner.com",
    latitude: 41.8781,
    longitude: -87.6298,
  },
  {
    name: "Family Care Pharmacy",
    address: "321 Pine Road",
    city: "Houston",
    state: "TX",
    zipCode: "77001",
    phone: "(713) 555-0404",
    email: "hello@familycarepharmacy.com",
    latitude: 29.7604,
    longitude: -95.3698,
  },
  {
    name: "Community Health Pharmacy",
    address: "654 Maple Drive",
    city: "Phoenix",
    state: "AZ",
    zipCode: "85001",
    phone: "(602) 555-0505",
    email: "info@communityhealth.com",
    latitude: 33.4484,
    longitude: -112.0740,
  },
  {
    name: "QuickMed Pharmacy",
    address: "987 Cedar Lane",
    city: "Philadelphia",
    state: "PA",
    zipCode: "19101",
    phone: "(215) 555-0606",
    email: "support@quickmed.com",
    latitude: 39.9526,
    longitude: -75.1652,
  },
  {
    name: "GreenLeaf Pharmacy",
    address: "147 Birch Street",
    city: "San Antonio",
    state: "TX",
    zipCode: "78201",
    phone: "(210) 555-0707",
    email: "contact@greenleafpharmacy.com",
    latitude: 29.4241,
    longitude: -98.4936,
  },
  {
    name: "CityMed Pharmacy",
    address: "258 Spruce Avenue",
    city: "San Diego",
    state: "CA",
    zipCode: "92101",
    phone: "(619) 555-0808",
    email: "info@citymed.com",
    latitude: 32.7157,
    longitude: -117.1611,
  },
  {
    name: "Neighborhood Pharmacy",
    address: "369 Willow Way",
    city: "Dallas",
    state: "TX",
    zipCode: "75201",
    phone: "(214) 555-0909",
    email: "help@neighborhoodpharmacy.com",
    latitude: 32.7767,
    longitude: -96.7970,
  },
  {
    name: "HealthFirst Pharmacy",
    address: "741 Ash Boulevard",
    city: "San Jose",
    state: "CA",
    zipCode: "95101",
    phone: "(408) 555-1010",
    email: "support@healthfirst.com",
    latitude: 37.3382,
    longitude: -121.8863,
  },
  {
    name: "PrimeCare Pharmacy",
    address: "852 Poplar Street",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    phone: "(512) 555-1111",
    email: "info@primecarepharmacy.com",
    latitude: 30.2672,
    longitude: -97.7431,
  },
  {
    name: "VitalHealth Pharmacy",
    address: "963 Sycamore Road",
    city: "Jacksonville",
    state: "FL",
    zipCode: "32201",
    phone: "(904) 555-1212",
    email: "contact@vitalhealth.com",
    latitude: 30.3322,
    longitude: -81.6557,
  },
];

// Product categories and data
const prescriptionMedications = [
  { name: "Amoxicillin 500mg", category: "prescription", price: 15.99, dosage: "500mg", description: "Antibiotic used to treat bacterial infections", usage: "Take 1 capsule every 8 hours with food", sideEffects: "May cause nausea, diarrhea, or allergic reactions", healthInfo: "Complete the full course even if you feel better" },
  { name: "Lisinopril 10mg", category: "prescription", price: 12.50, dosage: "10mg", description: "ACE inhibitor for high blood pressure", usage: "Take once daily in the morning", sideEffects: "Dizziness, cough, or fatigue", healthInfo: "Monitor blood pressure regularly" },
  { name: "Metformin 500mg", category: "prescription", price: 8.75, dosage: "500mg", description: "Oral medication for type 2 diabetes", usage: "Take with meals twice daily", sideEffects: "Stomach upset, nausea, or diarrhea", healthInfo: "Monitor blood sugar levels" },
  { name: "Atorvastatin 20mg", category: "prescription", price: 18.25, dosage: "20mg", description: "Statin medication to lower cholesterol", usage: "Take once daily in the evening", sideEffects: "Muscle pain, liver problems, or memory issues", healthInfo: "Regular liver function tests recommended" },
  { name: "Levothyroxine 50mcg", category: "prescription", price: 10.99, dosage: "50mcg", description: "Thyroid hormone replacement", usage: "Take on empty stomach 30 minutes before breakfast", sideEffects: "Rapid heartbeat, weight loss, or insomnia", healthInfo: "Regular thyroid function monitoring required" },
  { name: "Amlodipine 5mg", category: "prescription", price: 11.50, dosage: "5mg", description: "Calcium channel blocker for hypertension", usage: "Take once daily", sideEffects: "Swelling, dizziness, or flushing", healthInfo: "Monitor blood pressure" },
  { name: "Omeprazole 20mg", category: "prescription", price: 14.99, dosage: "20mg", description: "Proton pump inhibitor for acid reflux", usage: "Take once daily before breakfast", sideEffects: "Headache, diarrhea, or abdominal pain", healthInfo: "Long-term use may affect bone density" },
  { name: "Sertraline 50mg", category: "prescription", price: 16.75, dosage: "50mg", description: "SSRI antidepressant", usage: "Take once daily with or without food", sideEffects: "Nausea, insomnia, or sexual dysfunction", healthInfo: "May take 4-6 weeks to see full effects" },
  { name: "Metoprolol 25mg", category: "prescription", price: 9.99, dosage: "25mg", description: "Beta-blocker for heart conditions", usage: "Take twice daily with food", sideEffects: "Fatigue, dizziness, or slow heartbeat", healthInfo: "Do not stop suddenly" },
  { name: "Gabapentin 300mg", category: "prescription", price: 13.25, dosage: "300mg", description: "Anticonvulsant for nerve pain", usage: "Take 3 times daily", sideEffects: "Drowsiness, dizziness, or coordination problems", healthInfo: "May cause withdrawal symptoms if stopped abruptly" },
  { name: "Tramadol 50mg", category: "prescription", price: 19.50, dosage: "50mg", description: "Pain reliever for moderate to severe pain", usage: "Take every 4-6 hours as needed", sideEffects: "Dizziness, nausea, or constipation", healthInfo: "Can be habit-forming, use with caution" },
  { name: "Warfarin 5mg", category: "prescription", price: 7.99, dosage: "5mg", description: "Blood thinner to prevent clots", usage: "Take once daily at the same time", sideEffects: "Bleeding, bruising, or hair loss", healthInfo: "Regular blood tests (INR) required" },
  { name: "Furosemide 40mg", category: "prescription", price: 6.50, dosage: "40mg", description: "Diuretic to reduce fluid retention", usage: "Take once or twice daily", sideEffects: "Dehydration, low potassium, or dizziness", healthInfo: "Monitor electrolyte levels" },
  { name: "Prednisone 10mg", category: "prescription", price: 8.25, dosage: "10mg", description: "Corticosteroid for inflammation", usage: "Take as directed by doctor", sideEffects: "Weight gain, mood changes, or increased blood sugar", healthInfo: "Do not stop suddenly, taper gradually" },
  { name: "Albuterol Inhaler", category: "prescription", price: 35.99, dosage: "90mcg per puff", description: "Bronchodilator for asthma and COPD", usage: "2 puffs every 4-6 hours as needed", sideEffects: "Rapid heartbeat, tremors, or nervousness", healthInfo: "Rescue medication, not for daily control" },
];

const overTheCounterDrugs = [
  { name: "Ibuprofen 200mg", category: "over-the-counter", price: 5.99, dosage: "200mg", description: "NSAID pain reliever and anti-inflammatory", usage: "Take 1-2 tablets every 4-6 hours with food", sideEffects: "Stomach upset, dizziness, or rash", healthInfo: "Do not exceed 1200mg per day" },
  { name: "Acetaminophen 500mg", category: "over-the-counter", price: 4.99, dosage: "500mg", description: "Pain reliever and fever reducer", usage: "Take 1-2 tablets every 4-6 hours", sideEffects: "Rare, but may cause liver damage if overdosed", healthInfo: "Maximum 4000mg per day" },
  { name: "Aspirin 81mg", category: "over-the-counter", price: 3.99, dosage: "81mg", description: "Low-dose aspirin for heart health", usage: "Take once daily with food", sideEffects: "Stomach irritation or bleeding", healthInfo: "Consult doctor before starting" },
  { name: "Diphenhydramine 25mg", category: "over-the-counter", price: 6.99, dosage: "25mg", description: "Antihistamine for allergies and sleep", usage: "Take 1-2 tablets every 4-6 hours", sideEffects: "Drowsiness, dry mouth, or dizziness", healthInfo: "May cause drowsiness, avoid driving" },
  { name: "Loratadine 10mg", category: "over-the-counter", price: 8.99, dosage: "10mg", description: "Non-drowsy antihistamine", usage: "Take once daily", sideEffects: "Headache, dry mouth, or fatigue", healthInfo: "Non-drowsy formula" },
  { name: "Pseudoephedrine 30mg", category: "over-the-counter", price: 7.50, dosage: "30mg", description: "Nasal decongestant", usage: "Take every 4-6 hours", sideEffects: "Nervousness, insomnia, or increased blood pressure", healthInfo: "May cause drowsiness or excitability" },
  { name: "Guaifenesin 400mg", category: "over-the-counter", price: 5.50, dosage: "400mg", description: "Expectorant to loosen mucus", usage: "Take every 4 hours with water", sideEffects: "Nausea, vomiting, or stomach upset", healthInfo: "Drink plenty of fluids" },
  { name: "Dextromethorphan 15mg", category: "over-the-counter", price: 6.25, dosage: "15mg", description: "Cough suppressant", usage: "Take every 4-6 hours", sideEffects: "Drowsiness, dizziness, or nausea", healthInfo: "Do not use with MAO inhibitors" },
  { name: "Loperamide 2mg", category: "over-the-counter", price: 7.99, dosage: "2mg", description: "Anti-diarrheal medication", usage: "Take 2 tablets initially, then 1 after each loose stool", sideEffects: "Constipation, dizziness, or drowsiness", healthInfo: "Maximum 8 tablets per day" },
  { name: "Calcium Carbonate 500mg", category: "over-the-counter", price: 4.50, dosage: "500mg", description: "Antacid for heartburn", usage: "Take 1-2 tablets as needed", sideEffects: "Constipation or gas", healthInfo: "Take 1-2 hours after other medications" },
  { name: "Famotidine 20mg", category: "over-the-counter", price: 9.99, dosage: "20mg", description: "H2 blocker for acid reflux", usage: "Take once or twice daily", sideEffects: "Headache, dizziness, or constipation", healthInfo: "Take 30 minutes before meals" },
  { name: "Ranitidine 150mg", category: "over-the-counter", price: 8.75, dosage: "150mg", description: "H2 blocker for stomach acid", usage: "Take twice daily", sideEffects: "Headache, constipation, or diarrhea", healthInfo: "May interact with other medications" },
  { name: "Hydrocortisone Cream 1%", category: "over-the-counter", price: 6.99, dosage: "1%", description: "Topical steroid for skin inflammation", usage: "Apply thin layer 2-3 times daily", sideEffects: "Skin thinning or irritation", healthInfo: "Do not use on face for extended periods" },
  { name: "Benzoyl Peroxide 5%", category: "over-the-counter", price: 7.25, dosage: "5%", description: "Acne treatment gel", usage: "Apply once or twice daily", sideEffects: "Dryness, peeling, or irritation", healthInfo: "Start with lower concentration" },
  { name: "Salicylic Acid 2%", category: "over-the-counter", price: 5.75, dosage: "2%", description: "Acne and wart treatment", usage: "Apply to affected area daily", sideEffects: "Skin irritation or dryness", healthInfo: "Avoid contact with eyes" },
];

const wellnessProducts = [
  { name: "Echinacea Extract 500mg", category: "wellness", price: 12.99, description: "Immune system support supplement", usage: "Take 1 capsule daily with water", healthInfo: "May help reduce cold duration" },
  { name: "Elderberry Syrup 8oz", category: "wellness", price: 15.99, description: "Natural immune booster", usage: "Take 1-2 teaspoons daily", healthInfo: "Rich in antioxidants and vitamins" },
  { name: "Probiotic 50 Billion CFU", category: "wellness", price: 24.99, description: "Digestive health support", usage: "Take 1 capsule daily with food", healthInfo: "Supports gut microbiome" },
  { name: "Turmeric Curcumin 1000mg", category: "wellness", price: 18.99, description: "Anti-inflammatory supplement", usage: "Take 1 capsule twice daily", healthInfo: "May help with joint health" },
  { name: "Omega-3 Fish Oil 1000mg", category: "wellness", price: 16.99, description: "Heart and brain health support", usage: "Take 1-2 softgels daily with meals", healthInfo: "Rich in EPA and DHA" },
  { name: "CoQ10 100mg", category: "wellness", price: 22.99, description: "Antioxidant for heart health", usage: "Take 1 capsule daily with fat-containing meal", healthInfo: "May help with energy production" },
  { name: "Melatonin 3mg", category: "wellness", price: 8.99, description: "Natural sleep aid", usage: "Take 1 tablet 30 minutes before bedtime", healthInfo: "Helps regulate sleep cycle" },
  { name: "Magnesium Glycinate 400mg", category: "wellness", price: 14.99, description: "Muscle and nerve support", usage: "Take 1-2 tablets before bed", healthInfo: "May help with sleep and muscle relaxation" },
  { name: "Ashwagandha 600mg", category: "wellness", price: 19.99, description: "Adaptogen for stress support", usage: "Take 1 capsule twice daily", healthInfo: "May help reduce stress and anxiety" },
  { name: "Ginseng Extract 500mg", category: "wellness", price: 17.99, description: "Energy and vitality support", usage: "Take 1 capsule daily in the morning", healthInfo: "May boost energy and mental clarity" },
  { name: "Milk Thistle 175mg", category: "wellness", price: 11.99, description: "Liver support supplement", usage: "Take 1 capsule three times daily", healthInfo: "Supports liver detoxification" },
  { name: "Ginkgo Biloba 120mg", category: "wellness", price: 13.99, description: "Brain health and memory support", usage: "Take 1 capsule twice daily", healthInfo: "May improve cognitive function" },
  { name: "Green Tea Extract 500mg", category: "wellness", price: 10.99, description: "Antioxidant and metabolism support", usage: "Take 1 capsule twice daily", healthInfo: "Rich in EGCG antioxidants" },
  { name: "Grape Seed Extract 100mg", category: "wellness", price: 12.50, description: "Antioxidant supplement", usage: "Take 1 capsule daily", healthInfo: "Supports cardiovascular health" },
  { name: "Resveratrol 250mg", category: "wellness", price: 21.99, description: "Antioxidant from red wine", usage: "Take 1 capsule daily", healthInfo: "May support heart health" },
];

const vitamins = [
  { name: "Vitamin D3 2000 IU", category: "vitamins", price: 9.99, dosage: "2000 IU", description: "Essential for bone health and immune function", usage: "Take 1 softgel daily with food", healthInfo: "Important for calcium absorption" },
  { name: "Vitamin C 1000mg", category: "vitamins", price: 7.99, dosage: "1000mg", description: "Immune system support and antioxidant", usage: "Take 1 tablet daily", healthInfo: "May help reduce cold duration" },
  { name: "Vitamin B12 1000mcg", category: "vitamins", price: 8.99, dosage: "1000mcg", description: "Energy and nerve health support", usage: "Take 1 sublingual tablet daily", healthInfo: "Important for red blood cell formation" },
  { name: "Vitamin B Complex", category: "vitamins", price: 11.99, description: "Complete B vitamin formula", usage: "Take 1 capsule daily with food", healthInfo: "Supports energy metabolism" },
  { name: "Folic Acid 400mcg", category: "vitamins", price: 5.99, dosage: "400mcg", description: "Essential for cell division", usage: "Take 1 tablet daily", healthInfo: "Important during pregnancy" },
  { name: "Vitamin E 400 IU", category: "vitamins", price: 10.99, dosage: "400 IU", description: "Antioxidant for skin and heart health", usage: "Take 1 softgel daily", healthInfo: "May support skin health" },
  { name: "Vitamin A 5000 IU", category: "vitamins", price: 7.50, dosage: "5000 IU", description: "Vision and immune support", usage: "Take 1 capsule daily", healthInfo: "Important for eye health" },
  { name: "Biotin 5000mcg", category: "vitamins", price: 9.50, dosage: "5000mcg", description: "Hair, skin, and nail support", usage: "Take 1 capsule daily", healthInfo: "May promote healthy hair growth" },
  { name: "Niacin 500mg", category: "vitamins", price: 6.99, dosage: "500mg", description: "Cardiovascular health support", usage: "Take 1 tablet daily", healthInfo: "May cause flushing, start with lower dose" },
  { name: "Vitamin K2 100mcg", category: "vitamins", price: 13.99, dosage: "100mcg", description: "Bone and heart health support", usage: "Take 1 capsule daily with fat", healthInfo: "Works with vitamin D for bone health" },
];

const supplements = [
  { name: "Calcium 600mg + D3", category: "supplements", price: 8.99, dosage: "600mg", description: "Bone health support with vitamin D", usage: "Take 2 tablets daily with meals", healthInfo: "Important for bone density" },
  { name: "Iron 65mg", category: "supplements", price: 7.99, dosage: "65mg", description: "Iron supplement for anemia", usage: "Take 1 tablet daily with vitamin C", healthInfo: "May cause constipation, take with food" },
  { name: "Zinc 50mg", category: "supplements", price: 6.99, dosage: "50mg", description: "Immune system support", usage: "Take 1 tablet daily with food", healthInfo: "May help reduce cold duration" },
  { name: "Selenium 200mcg", category: "supplements", price: 9.99, dosage: "200mcg", description: "Antioxidant mineral", usage: "Take 1 capsule daily", healthInfo: "Supports thyroid function" },
  { name: "Chromium Picolinate 200mcg", category: "supplements", price: 8.50, dosage: "200mcg", description: "Blood sugar support", usage: "Take 1 capsule daily with meals", healthInfo: "May help with insulin sensitivity" },
  { name: "Glucosamine 1500mg", category: "supplements", price: 19.99, dosage: "1500mg", description: "Joint health support", usage: "Take 1-2 capsules daily", healthInfo: "May help with osteoarthritis" },
  { name: "Chondroitin 1200mg", category: "supplements", price: 21.99, dosage: "1200mg", description: "Joint cartilage support", usage: "Take 1-2 capsules daily", healthInfo: "Often taken with glucosamine" },
  { name: "MSM 1000mg", category: "supplements", price: 15.99, dosage: "1000mg", description: "Joint and muscle support", usage: "Take 1-2 capsules daily", healthInfo: "May reduce inflammation" },
  { name: "Alpha Lipoic Acid 300mg", category: "supplements", price: 18.99, dosage: "300mg", description: "Antioxidant for nerve health", usage: "Take 1 capsule daily", healthInfo: "May help with diabetic neuropathy" },
  { name: "N-Acetyl Cysteine 600mg", category: "supplements", price: 16.99, dosage: "600mg", description: "Antioxidant and liver support", usage: "Take 1 capsule twice daily", healthInfo: "Precursor to glutathione" },
  { name: "L-Carnitine 500mg", category: "supplements", price: 14.99, dosage: "500mg", description: "Energy metabolism support", usage: "Take 1-2 capsules daily", healthInfo: "May support exercise performance" },
  { name: "Creatine Monohydrate 5g", category: "supplements", price: 12.99, dosage: "5g", description: "Muscle strength and power support", usage: "Take 1 scoop daily with water", healthInfo: "Popular for athletic performance" },
  { name: "BCAA Powder 10g", category: "supplements", price: 24.99, dosage: "10g", description: "Branched-chain amino acids", usage: "Mix 1 scoop with water during workout", healthInfo: "Supports muscle recovery" },
  { name: "Whey Protein 25g", category: "supplements", price: 29.99, dosage: "25g", description: "Complete protein for muscle building", usage: "Mix 1 scoop with water or milk", healthInfo: "High-quality protein source" },
  { name: "Collagen Peptides 20g", category: "supplements", price: 27.99, dosage: "20g", description: "Skin, hair, and joint support", usage: "Mix 1 scoop with water or smoothie", healthInfo: "May improve skin elasticity" },
];

// Combine all products
const allProducts = [
  ...prescriptionMedications,
  ...overTheCounterDrugs,
  ...wellnessProducts,
  ...vitamins,
  ...supplements,
];

// Generate expiry dates (1-3 years from now)
function getRandomExpiryDate(): Date {
  const now = new Date();
  const daysToAdd = Math.floor(Math.random() * 730) + 365; // 365-1095 days
  const expiryDate = new Date(now);
  expiryDate.setDate(expiryDate.getDate() + daysToAdd);
  return expiryDate;
}

// Generate random quantity (0-100)
function getRandomQuantity(): number {
  return Math.floor(Math.random() * 101);
}

// Main seed function
async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Step 1: Create pharmacies
    console.log('📍 Creating pharmacies...');
    const pharmacyIds: string[] = [];
    
    for (const pharmacy of pharmacies) {
      const docRef = await addDoc(collection(db, 'pharmacies'), {
        ...pharmacy,
        createdAt: serverTimestamp(),
      });
      pharmacyIds.push(docRef.id);
      console.log(`✅ Created pharmacy: ${pharmacy.name} (ID: ${docRef.id})`);
    }

    console.log(`\n✅ Created ${pharmacyIds.length} pharmacies\n`);

    // Step 2: Create products (distribute across pharmacies)
    console.log('💊 Creating products...');
    let productCount = 0;
    const targetProducts = 250;
    
    // Calculate products per pharmacy
    const productsPerPharmacy = Math.ceil(targetProducts / pharmacyIds.length);
    
    for (let i = 0; i < pharmacyIds.length; i++) {
      const pharmacyId = pharmacyIds[i];
      const productsForThisPharmacy = Math.min(
        productsPerPharmacy,
        targetProducts - productCount
      );

      for (let j = 0; j < productsForThisPharmacy; j++) {
        // Randomly select a product from our list
        const baseProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
        
        // Create variations (different quantities, expiry dates)
        const product = {
          pharmacyId: pharmacyId,
          name: baseProduct.name,
          category: baseProduct.category,
          price: baseProduct.price + (Math.random() * 5 - 2.5), // Slight price variation
          dosage: ('dosage' in baseProduct ? baseProduct.dosage : '') || '',
          expiryDate: getRandomExpiryDate(),
          quantity: getRandomQuantity(),
          description: baseProduct.description || '',
          healthInfo: baseProduct.healthInfo || '',
          usage: baseProduct.usage || '',
          sideEffects: ('sideEffects' in baseProduct ? baseProduct.sideEffects : '') || '',
          createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, 'products'), product);
        productCount++;
        
        if (productCount % 25 === 0) {
          console.log(`   Progress: ${productCount}/${targetProducts} products created...`);
        }
      }
    }

    // Add some additional products to reach 250+
    while (productCount < targetProducts) {
      const baseProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
      const randomPharmacyId = pharmacyIds[Math.floor(Math.random() * pharmacyIds.length)];
      
      const product = {
        pharmacyId: randomPharmacyId,
        name: baseProduct.name,
        category: baseProduct.category,
        price: baseProduct.price + (Math.random() * 5 - 2.5),
        dosage: ('dosage' in baseProduct ? baseProduct.dosage : '') || '',
        expiryDate: getRandomExpiryDate(),
        quantity: getRandomQuantity(),
        description: baseProduct.description || '',
        healthInfo: baseProduct.healthInfo || '',
        usage: baseProduct.usage || '',
        sideEffects: ('sideEffects' in baseProduct ? baseProduct.sideEffects : '') || '',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'products'), product);
      productCount++;
    }

    console.log(`\n✅ Created ${productCount} products\n`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`\nSummary:`);
    console.log(`   - Pharmacies: ${pharmacyIds.length}`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Average products per pharmacy: ${Math.round(productCount / pharmacyIds.length)}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('\n✨ Seeding process finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

