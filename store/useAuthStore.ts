import { create } from 'zustand';
import { User } from '@/types';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: 'user' | 'admin') => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const initialize = () => {
    if (typeof window === 'undefined') return;
    
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          set({
            user: {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name,
              role: userData.role || 'user',
              createdAt: userData.createdAt?.toDate() || new Date(),
            },
            loading: false,
          });
        } else {
          set({ user: null, loading: false });
        }
      } else {
        set({ user: null, loading: false });
      }
    });
  };

  return {
    user: null,
    loading: true,
    initialize,
    signIn: async (email: string, password: string) => {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        set({
          user: {
            id: userCredential.user.uid,
            email: userCredential.user.email || '',
            name: userData.name,
            role: userData.role || 'user',
            createdAt: userData.createdAt?.toDate() || new Date(),
          },
        });
      }
    },
    signUp: async (email: string, password: string, name: string, role: 'user' | 'admin' = 'user') => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        role,
        createdAt: serverTimestamp(),
      });
      set({
        user: {
          id: userCredential.user.uid,
          email,
          name,
          role,
          createdAt: new Date(),
        },
      });
    },
    signOut: async () => {
      await firebaseSignOut(auth);
      set({ user: null });
    },
  };
});

