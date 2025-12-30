import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDeZmWxNBpLQjM4gl-cED8OrQRLgbxI1j4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "pharmacy-platform-c659c.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "pharmacy-platform-c659c",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "pharmacy-platform-c659c.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "98779191892",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:98779191892:web:57955bab263b8af89d2bc1",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-T0DZMHJN1C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Default admin credentials
const ADMIN_EMAIL = 'admin@pharmacy.com';
const ADMIN_PASSWORD = 'admin123456';
const ADMIN_NAME = 'Admin User';

async function createAdminUser() {
  console.log('🔐 Creating admin user...\n');
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}\n`);

  try {
    // Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log(`✅ User created in Firebase Auth: ${userCredential.user.uid}`);

    // Create the user document in Firestore with admin role
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      role: 'admin',
      createdAt: serverTimestamp(),
    });

    console.log(`✅ Admin user document created in Firestore`);
    console.log('\n🎉 Admin user created successfully!');
    console.log('\n📝 Login Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('\n⚠️  Remember to change the password after first login!');

  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️  Admin user already exists!');
      console.log('\n📝 Existing Admin Credentials:');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log('\n💡 If you forgot the password, reset it in Firebase Console or use the forgot password feature.');
    } else {
      console.error('❌ Error creating admin user:', error.message);
      process.exit(1);
    }
  }
}

// Run the function
createAdminUser()
  .then(() => {
    console.log('\n✨ Process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

