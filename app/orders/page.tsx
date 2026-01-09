'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { Order } from '@/types';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Package, Calendar, PoundSterling, Eye, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      router.push('/login');
    }
  }, [user, router]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Query without orderBy to avoid index requirement - we'll sort in memory
      // This works immediately without needing to create a composite index
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.id)
      );
      const snapshot = await getDocs(q);
      const ordersData: Order[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        ordersData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Order);
      });

      // Sort in memory by createdAt descending (newest first)
      ordersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setOrders(ordersData);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCancelOrder = async (order: Order) => {
    if (!confirm('Are you sure you want to cancel this order? The items will be returned to inventory.')) {
      return;
    }

    // Only allow cancellation of pending orders
    if (order.status !== 'pending') {
      toast.error(`Cannot cancel order. Order status is: ${order.status}`);
      return;
    }

    try {
      // Update order status to cancelled
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });

      // Restore product quantities (add back to inventory) - handle errors per product
      const quantityUpdateErrors: string[] = [];
      for (const item of order.items) {
        try {
        const productRef = doc(db, 'products', item.productId);
        await updateDoc(productRef, {
          quantity: increment(item.quantity),
        });
        } catch (quantityError) {
          // Log error but don't fail the cancellation
          console.warn(`Failed to restore quantity for product ${item.productId}:`, quantityError);
          quantityUpdateErrors.push(item.productName);
        }
      }

      // Show success message
      if (quantityUpdateErrors.length > 0) {
        toast.success('Order cancelled successfully. (Some inventory updates may need admin review)');
      } else {
      toast.success('Order cancelled successfully. Items returned to inventory.');
      }
      
      // Reload orders to reflect the change
      loadOrders();
      
      // Close modal if this order was selected
      if (selectedOrder?.id === order.id) {
        setIsModalOpen(false);
      }
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      // Only show error if order cancellation actually failed
      const errorMessage = error?.message || 'Failed to cancel order. Please try again.';
      toast.error(errorMessage);
    }
  };

  const canCancelOrder = (order: Order) => {
    // Only pending orders can be cancelled
    return order.status === 'pending';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800 border-amber-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      processing: 'bg-purple-100 text-purple-800 border-purple-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Orders
          </h1>
          <p className="text-gray-600">
            View your order history and track current orders
          </p>
        </motion.div>

        {orders.length === 0 ? (
          <Card className="text-center py-12 bg-white border border-gray-200 shadow-sm">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start shopping to see your orders here
            </p>
            <Button onClick={() => router.push('/products')}>
              Browse Products
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id.slice(0, 8)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center text-gray-700">
                          <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                          <span className="font-medium">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Package className="w-5 h-5 mr-2 text-gray-600" />
                          <span className="font-medium">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                        </div>
                        <div className="flex items-center text-gray-900 font-semibold">
                          <PoundSterling className="w-5 h-5 mr-2 text-rose-600" />
                          <span className="text-lg">{formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleViewDetails(order)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {canCancelOrder(order) && (
                        <Button
                          variant="outline"
                          onClick={() => handleCancelOrder(order)}
                          className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Order #${selectedOrder?.id.slice(0, 8)}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1 font-medium">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1 font-medium">Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2 font-medium">Items</p>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.productName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.pharmacyName} • Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-rose-600 text-lg">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-teal-500 bg-clip-text text-transparent">
                  {formatCurrency(selectedOrder.totalAmount)}
                </span>
              </div>
              {canCancelOrder(selectedOrder) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleCancelOrder(selectedOrder);
                  }}
                  className="w-full text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

