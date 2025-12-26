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
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
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
      // Create order
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

      // Try to update product quantities (non-critical - admin will handle inventory on order acceptance)
      // If this fails due to permissions, it's okay - inventory will be updated when admin accepts the order
      try {
        for (const item of items) {
          const productRef = doc(db, 'products', item.productId);
          await updateDoc(productRef, {
            quantity: increment(-item.quantity),
          });
        }
      } catch (inventoryError) {
        // Log inventory update error but don't fail the order
        console.warn('Inventory update failed (will be handled by admin):', inventoryError);
        // This is expected for regular users - inventory will be updated when admin accepts the order
      }

      toast.success('Order placed successfully!');
      clearCart();
      router.push('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
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
                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {item.pharmacyName}
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(item.price)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.availableQuantity} available
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
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
                          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus size={18} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-right text-lg font-semibold text-gray-900 dark:text-white">
                      Subtotal: {formatCurrency(item.price * item.quantity)}
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
              <Card className="sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h2>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(getTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax</span>
                    <span>{formatCurrency(getTotal() * 0.1)}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span>{formatCurrency(getTotal() * 1.1)}</span>
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
                  <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
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

