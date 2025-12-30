import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

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
const auth = getAuth(app);
const db = getFirestore(app);

// Admin credentials
const ADMIN_EMAIL = 'admin@pharmacy.com';
const ADMIN_PASSWORD = 'admin123456';

// UK locations to update pharmacies to
const ukLocations = [
  {
    name: "HealthCare Pharmacy Central",
    address: "123 Oxford Street",
    city: "London",
    state: "Greater London",
    zipCode: "W1D 2HX",
    phone: "+44 20 7123 4567",
    email: "central@healthcarepharmacy.co.uk",
    latitude: 51.5155,
    longitude: -0.1419,
  },
  {
    name: "MediQuick Pharmacy",
    address: "456 King Street",
    city: "Manchester",
    state: "Greater Manchester",
    zipCode: "M2 4PD",
    phone: "+44 161 234 5678",
    email: "info@mediquick.co.uk",
    latitude: 53.4808,
    longitude: -2.2426,
  },
  {
    name: "Wellness Corner Pharmacy",
    address: "789 High Street",
    city: "Birmingham",
    state: "West Midlands",
    zipCode: "B4 7ET",
    phone: "+44 121 345 6789",
    email: "contact@wellnesscorner.co.uk",
    latitude: 52.4862,
    longitude: -1.8904,
  },
  {
    name: "Family Care Pharmacy",
    address: "321 Princes Street",
    city: "Edinburgh",
    state: "Scotland",
    zipCode: "EH2 4AD",
    phone: "+44 131 456 7890",
    email: "hello@familycarepharmacy.co.uk",
    latitude: 55.9533,
    longitude: -3.1883,
  },
  {
    name: "Community Health Pharmacy",
    address: "654 Queen Street",
    city: "Cardiff",
    state: "Wales",
    zipCode: "CF10 2HQ",
    phone: "+44 29 2012 3456",
    email: "info@communityhealth.co.uk",
    latitude: 51.4816,
    longitude: -3.1791,
  },
  {
    name: "QuickMed Pharmacy",
    address: "987 George Street",
    city: "Bristol",
    state: "South West England",
    zipCode: "BS1 5TR",
    phone: "+44 117 567 8901",
    email: "support@quickmed.co.uk",
    latitude: 51.4545,
    longitude: -2.5879,
  },
  {
    name: "GreenLeaf Pharmacy",
    address: "147 Victoria Road",
    city: "Leeds",
    state: "West Yorkshire",
    zipCode: "LS6 1DR",
    phone: "+44 113 678 9012",
    email: "contact@greenleafpharmacy.co.uk",
    latitude: 53.8008,
    longitude: -1.5491,
  },
  {
    name: "CityMed Pharmacy",
    address: "258 High Street",
    city: "Liverpool",
    state: "Merseyside",
    zipCode: "L1 4DQ",
    phone: "+44 151 789 0123",
    email: "info@citymed.co.uk",
    latitude: 53.4084,
    longitude: -2.9916,
  },
  {
    name: "Neighborhood Pharmacy",
    address: "369 Market Street",
    city: "Newcastle",
    state: "Tyne and Wear",
    zipCode: "NE1 7RU",
    phone: "+44 191 890 1234",
    email: "help@neighborhoodpharmacy.co.uk",
    latitude: 54.9783,
    longitude: -1.6178,
  },
  {
    name: "HealthFirst Pharmacy",
    address: "741 Broad Street",
    city: "Sheffield",
    state: "South Yorkshire",
    zipCode: "S1 2HQ",
    phone: "+44 114 901 2345",
    email: "support@healthfirst.co.uk",
    latitude: 53.3811,
    longitude: -1.4701,
  },
  {
    name: "PrimeCare Pharmacy",
    address: "852 Church Street",
    city: "Nottingham",
    state: "Nottinghamshire",
    zipCode: "NG1 5DT",
    phone: "+44 115 012 3456",
    email: "info@primecarepharmacy.co.uk",
    latitude: 52.9548,
    longitude: -1.1581,
  },
  {
    name: "VitalHealth Pharmacy",
    address: "963 High Street",
    city: "Leicester",
    state: "Leicestershire",
    zipCode: "LE1 6TP",
    phone: "+44 116 123 4567",
    email: "contact@vitalhealth.co.uk",
    latitude: 52.6369,
    longitude: -1.1398,
  },
];

async function updatePharmacyLocations() {
  console.log('🌍 Updating pharmacy locations from US to UK...\n');

  try {
    // Authenticate as admin (or create admin if doesn't exist)
    console.log('🔐 Authenticating as admin...');
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      console.log('✅ Authenticated as admin\n');
    } catch (authError: any) {
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
        console.log('⚠️  Admin user not found or invalid credentials. Creating admin user...');
        try {
          // Try to create admin user
          const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: 'Admin User',
            email: ADMIN_EMAIL,
            role: 'admin',
            createdAt: serverTimestamp(),
          });
          console.log('✅ Admin user created and authenticated\n');
        } catch (createError: any) {
          if (createError.code === 'auth/email-already-in-use') {
            // User exists but password might be wrong - try to continue anyway
            console.log('⚠️  Admin user exists but password may be incorrect.');
            console.log('   Attempting to continue (may fail if not admin)...\n');
          } else {
            console.log('⚠️  Could not create admin user:', createError.message);
            console.log('   Please create admin user manually: npm run create-admin\n');
            throw new Error('Authentication required');
          }
        }
      } else {
        console.log('⚠️  Authentication error:', authError.message);
        console.log('   Attempting to continue (may fail if not admin)...\n');
      }
    }

    // Fetch all existing pharmacies
    console.log('📋 Fetching existing pharmacies...');
    const pharmaciesSnapshot = await getDocs(collection(db, 'pharmacies'));
    const existingPharmacies = pharmaciesSnapshot.docs;
    
    if (existingPharmacies.length === 0) {
      console.log('⚠️  No pharmacies found in database.');
      console.log('   Please run the seed script first to create pharmacies.\n');
      return;
    }

    console.log(`   Found ${existingPharmacies.length} pharmacies\n`);

    // Update each pharmacy with UK location
    console.log('🔄 Updating pharmacy locations...\n');
    let updatedCount = 0;

    for (let i = 0; i < existingPharmacies.length; i++) {
      const pharmacyDoc = existingPharmacies[i];
      const ukLocation = ukLocations[i % ukLocations.length]; // Cycle through UK locations if more pharmacies than locations

      try {
        await updateDoc(doc(db, 'pharmacies', pharmacyDoc.id), {
          name: ukLocation.name,
          address: ukLocation.address,
          city: ukLocation.city,
          state: ukLocation.state,
          zipCode: ukLocation.zipCode,
          phone: ukLocation.phone,
          email: ukLocation.email,
          latitude: ukLocation.latitude,
          longitude: ukLocation.longitude,
        });

        updatedCount++;
        console.log(`✅ Updated: ${pharmacyDoc.data().name} → ${ukLocation.name} (${ukLocation.city})`);
      } catch (error: any) {
        console.error(`❌ Failed to update ${pharmacyDoc.data().name}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount}/${existingPharmacies.length} pharmacies to UK locations!`);
    console.log('\n📍 All pharmacies are now located in UK cities.');
    console.log('   The map will now center on UK locations.\n');

  } catch (error: any) {
    console.error('❌ Error updating pharmacy locations:', error.message);
    process.exit(1);
  }
}

// Run the update function
updatePharmacyLocations()
  .then(() => {
    console.log('✨ Update process finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

