'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to checkout');
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      // First, validate stock availability for all items
      const stockValidationErrors: string[] = [];
      for (const item of items) {
        try {
          const productRef = doc(db, 'products', item.productId);
          const productSnap = await getDoc(productRef);
          
          if (!productSnap.exists()) {
            stockValidationErrors.push(`${item.productName} - Product not found`);
            continue;
          }
          
          const currentQuantity = productSnap.data().quantity || 0;
          if (currentQuantity < item.quantity) {
            stockValidationErrors.push(
              `${item.productName} - Only ${currentQuantity} available (requested: ${item.quantity})`
            );
          }
        } catch (error) {
          console.error(`Error validating stock for ${item.productName}:`, error);
          stockValidationErrors.push(`${item.productName} - Unable to verify stock`);
        }
      }

      // If any stock validation failed, show errors and abort
      if (stockValidationErrors.length > 0) {
        toast.error(`Stock validation failed:\n${stockValidationErrors.join('\n')}`, { duration: 5000 });
        return;
      }

      // Update product quantities BEFORE creating order
      const quantityUpdateErrors: string[] = [];
      for (const item of items) {
        try {
          const productRef = doc(db, 'products', item.productId);
          const productSnap = await getDoc(productRef);
          
          if (!productSnap.exists()) {
            quantityUpdateErrors.push(`${item.productName} - Product not found`);
            continue;
          }
          
          const currentQuantity = productSnap.data().quantity || 0;
          const newQuantity = currentQuantity - item.quantity;
          
          if (newQuantity < 0) {
            quantityUpdateErrors.push(`${item.productName} - Insufficient stock (available: ${currentQuantity}, requested: ${item.quantity})`);
            continue;
          }
          
          // Update quantity directly (more compatible with Firestore rules)
          await updateDoc(productRef, {
            quantity: newQuantity,
          });
          console.log(`Successfully reduced stock for ${item.productName} from ${currentQuantity} to ${newQuantity}`);
        } catch (quantityError: any) {
          console.error(`Failed to update quantity for product ${item.productId}:`, quantityError);
          quantityUpdateErrors.push(`${item.productName}: ${quantityError?.message || 'Unknown error'}`);
        }
      }

      // If any quantity updates failed, abort order creation
      if (quantityUpdateErrors.length > 0) {
        toast.error(`Failed to update inventory:\n${quantityUpdateErrors.join('\n')}`, { duration: 5000 });
        return;
      }

      // Create order only after successful stock updates
      const orderData = {
        userId: user.id,
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          pharmacyId: item.pharmacyId,
          pharmacyName: item.pharmacyName,
        })),
        totalAmount: getTotal(),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      console.log('Order created successfully:', orderRef.id);

      toast.success('Order placed successfully! Stock has been updated.');
      clearCart();
      router.push('/orders');
    } catch (error: any) {
      console.error('Error placing order:', error);
      const errorMessage = error?.message || 'Failed to place order. Please try again.';
      toast.error(errorMessage);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-white via-gray-50 to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some products to get started
          </p>
          <Button onClick={() => router.push('/products')}>
            Browse Products
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={`${item.productId}-${item.pharmacyId}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.pharmacyName}
                      </p>
                      <p className="text-lg font-bold text-rose-600">
                        {formatCurrency(item.price)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.availableQuantity} available
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:text-gray-900 transition-colors"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="w-12 text-center font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            if (item.quantity < item.availableQuantity) {
                              updateQuantity(item.productId, item.quantity + 1);
                            } else {
                              toast.error('Maximum available quantity reached');
                            }
                          }}
                          disabled={item.quantity >= item.availableQuantity}
                          className="p-1 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:text-gray-900 transition-colors"
                        >
                          <Plus size={18} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-right text-lg font-semibold text-gray-900">
                      Subtotal: <span className="text-rose-600">{formatCurrency(item.price * item.quantity)}</span>
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="sticky top-24 bg-white border border-gray-200 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-semibold">{formatCurrency(getTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Tax</span>
                    <span className="font-semibold">{formatCurrency(getTotal() * 0.1)}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-teal-500">
                        {formatCurrency(getTotal() * 1.1)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={!user}
                >
                  {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                </Button>
                {!user && (
                  <p className="mt-2 text-sm text-center text-gray-600">
                    Please login to complete your order
                  </p>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

