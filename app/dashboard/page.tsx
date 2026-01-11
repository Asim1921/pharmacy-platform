'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { Pharmacy, Product, Order, ProductCategory } from '@/types';
import { motion } from 'framer-motion';
import { Package, MapPin, ShoppingBag, Plus, Edit, Trash2, Eye, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const categories: ProductCategory[] = ['prescription', 'over-the-counter', 'wellness', 'vitamins', 'supplements'];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pharmacies' | 'products' | 'orders'>('pharmacies');
  
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [products, setProducts] = useState<(Product & { pharmacyName: string })[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [isPharmacyModalOpen, setIsPharmacyModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  const [editingPharmacy, setEditingPharmacy] = useState<Pharmacy | null>(null);
  const [editingProduct, setEditingProduct] = useState<(Product & { pharmacyName: string }) | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    await Promise.all([loadPharmacies(), loadProducts(), loadOrders()]);
  };

  const loadPharmacies = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'pharmacies'));
      const data: Pharmacy[] = [];
      snapshot.forEach((doc) => {
        data.push({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as Pharmacy);
      });
      setPharmacies(data);
    } catch (error) {
      console.error('Error loading pharmacies:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsData: (Product & { pharmacyName: string })[] = [];

      for (const productDoc of productsSnapshot.docs) {
        const productData = productDoc.data();
        const pharmacyDoc = await getDocs(collection(db, 'pharmacies'));
        let pharmacyName = 'Unknown';

        pharmacyDoc.forEach((pharmacy) => {
          if (pharmacy.id === productData.pharmacyId) {
            pharmacyName = pharmacy.data().name;
          }
        });

        productsData.push({
          ...productData,
          id: productDoc.id,
          pharmacyName,
          expiryDate: productData.expiryDate?.toDate() || new Date(),
          createdAt: productData.createdAt?.toDate() || new Date(),
        } as Product & { pharmacyName: string });
      }

      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      const data: Order[] = [];
      snapshot.forEach((doc) => {
        data.push({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        } as Order);
      });
      setOrders(data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleSavePharmacy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const pharmacyData = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zipCode: formData.get('zipCode') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      latitude: parseFloat(formData.get('latitude') as string),
      longitude: parseFloat(formData.get('longitude') as string),
      createdAt: editingPharmacy ? editingPharmacy.createdAt : serverTimestamp(),
    };

    try {
      if (editingPharmacy) {
        await updateDoc(doc(db, 'pharmacies', editingPharmacy.id), pharmacyData);
        toast.success('Pharmacy updated successfully');
      } else {
        await addDoc(collection(db, 'pharmacies'), pharmacyData);
        toast.success('Pharmacy added successfully');
      }
      setIsPharmacyModalOpen(false);
      setEditingPharmacy(null);
      loadPharmacies();
    } catch (error) {
      toast.error('Failed to save pharmacy');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const productData = {
      pharmacyId: formData.get('pharmacyId') as string,
      name: formData.get('name') as string,
      category: formData.get('category') as ProductCategory,
      price: parseFloat(formData.get('price') as string),
      dosage: formData.get('dosage') as string || '',
      expiryDate: new Date(formData.get('expiryDate') as string),
      quantity: parseInt(formData.get('quantity') as string),
      description: formData.get('description') as string || '',
      healthInfo: formData.get('healthInfo') as string || '',
      usage: formData.get('usage') as string || '',
      sideEffects: formData.get('sideEffects') as string || '',
      createdAt: editingProduct ? editingProduct.createdAt : serverTimestamp(),
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('Product updated successfully');
      } else {
        await addDoc(collection(db, 'products'), productData);
        toast.success('Product added successfully');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDeletePharmacy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pharmacy?')) return;
    try {
      await deleteDoc(doc(db, 'pharmacies', id));
      toast.success('Pharmacy deleted successfully');
      loadPharmacies();
    } catch (error) {
      toast.error('Failed to delete pharmacy');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted successfully');
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleAcceptOrder = async (order: Order) => {
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'confirmed',
        updatedAt: serverTimestamp(),
      });
      toast.success('Order accepted successfully');
      loadOrders();
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...order, status: 'confirmed', updatedAt: new Date() });
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Failed to accept order');
    }
  };

  const handleRejectOrder = async (order: Order) => {
    if (!confirm('Are you sure you want to reject this order? The items will be returned to inventory.')) {
      return;
    }

    try {
      // Update order status to cancelled
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });

      // Restore product quantities (add back to inventory)
      for (const item of order.items) {
        const productRef = doc(db, 'products', item.productId);
        await updateDoc(productRef, {
          quantity: increment(item.quantity),
        });
      }

      toast.success('Order rejected. Items returned to inventory.');
      loadOrders();
      
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...order, status: 'cancelled', updatedAt: new Date() });
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('Failed to reject order');
    }
  };

  const canManageOrder = (order: Order) => {
    // Only pending orders can be accepted or rejected
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

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage pharmacies, products, and orders
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'pharmacies' as const, label: 'Pharmacies', icon: MapPin },
            { id: 'products' as const, label: 'Products', icon: Package },
            { id: 'orders' as const, label: 'Orders', icon: ShoppingBag },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-rose-600 shadow-md font-semibold'
                    : 'text-gray-600 hover:text-gray-900 font-medium'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Pharmacies Tab */}
        {activeTab === 'pharmacies' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Pharmacies ({pharmacies.length})
              </h2>
              <Button
                onClick={() => {
                  setEditingPharmacy(null);
                  setIsPharmacyModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Pharmacy
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pharmacies.map((pharmacy) => (
                <Card key={pharmacy.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {pharmacy.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {pharmacy.address}, {pharmacy.city}, {pharmacy.state}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPharmacy(pharmacy);
                        setIsPharmacyModalOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePharmacy(pharmacy.id)}
                      className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Products ({products.length})
              </h2>
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
            <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-4 text-gray-900 font-semibold">Name</th>
                    <th className="text-left p-4 text-gray-900 font-semibold">Pharmacy</th>
                    <th className="text-left p-4 text-gray-900 font-semibold">Category</th>
                    <th className="text-left p-4 text-gray-900 font-semibold">Price</th>
                    <th className="text-left p-4 text-gray-900 font-semibold">Quantity</th>
                    <th className="text-left p-4 text-gray-900 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-900 font-medium">{product.name}</td>
                      <td className="p-4 text-gray-600">{product.pharmacyName}</td>
                      <td className="p-4 text-gray-600 capitalize">{product.category.replace('-', ' ')}</td>
                      <td className="p-4 text-gray-900 font-semibold">{formatCurrency(product.price)}</td>
                      <td className="p-4">
                        <span className={`font-semibold ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsProductModalOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Orders ({orders.length})
            </h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Date</p>
                          <p className="text-gray-900 font-semibold">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Items</p>
                          <p className="text-gray-900 font-semibold">{order.items.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Total</p>
                          <p className="text-rose-600 font-bold text-lg">{formatCurrency(order.totalAmount)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsOrderModalOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      {canManageOrder(order) && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAcceptOrder(order)}
                            className="bg-green-600 hover:bg-green-700 text-white border-0"
                            size="sm"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleRejectOrder(order)}
                            className="bg-red-600 hover:bg-red-700 text-white border-0"
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pharmacy Modal */}
      <Modal
        isOpen={isPharmacyModalOpen}
        onClose={() => {
          setIsPharmacyModalOpen(false);
          setEditingPharmacy(null);
        }}
        title={editingPharmacy ? 'Edit Pharmacy' : 'Add Pharmacy'}
        size="lg"
      >
        <form onSubmit={handleSavePharmacy} className="space-y-4">
          <Input label="Name" name="name" defaultValue={editingPharmacy?.name} required />
          <Input label="Address" name="address" defaultValue={editingPharmacy?.address} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" name="city" defaultValue={editingPharmacy?.city} required />
            <Input label="State" name="state" defaultValue={editingPharmacy?.state} required />
          </div>
          <Input label="Zip Code" name="zipCode" defaultValue={editingPharmacy?.zipCode} required />
          <Input label="Phone" name="phone" type="tel" defaultValue={editingPharmacy?.phone} required />
          <Input label="Email" name="email" type="email" defaultValue={editingPharmacy?.email} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Latitude" name="latitude" type="number" step="any" defaultValue={editingPharmacy?.latitude} required />
            <Input label="Longitude" name="longitude" type="number" step="any" defaultValue={editingPharmacy?.longitude} required />
          </div>
          <div className="flex space-x-2 pt-4">
            <Button type="submit" className="flex-1">Save</Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsPharmacyModalOpen(false);
                setEditingPharmacy(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pharmacy
            </label>
            <select
              name="pharmacyId"
              defaultValue={editingProduct?.pharmacyId}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500"
            >
              <option value="">Select Pharmacy</option>
              {pharmacies.map((pharmacy) => (
                <option key={pharmacy.id} value={pharmacy.id}>
                  {pharmacy.name}
                </option>
              ))}
            </select>
          </div>
          <Input label="Product Name" name="name" defaultValue={editingProduct?.name} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              defaultValue={editingProduct?.category}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required />
            <Input label="Quantity" name="quantity" type="number" defaultValue={editingProduct?.quantity} required />
          </div>
          <Input label="Dosage" name="dosage" defaultValue={editingProduct?.dosage} />
          <Input label="Expiry Date" name="expiryDate" type="date" defaultValue={editingProduct?.expiryDate ? new Date(editingProduct.expiryDate).toISOString().split('T')[0] : ''} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={editingProduct?.description}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usage
            </label>
            <textarea
              name="usage"
              defaultValue={editingProduct?.usage}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Side Effects
            </label>
            <textarea
              name="sideEffects"
              defaultValue={editingProduct?.sideEffects}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Health Information
            </label>
            <textarea
              name="healthInfo"
              defaultValue={editingProduct?.healthInfo}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500"
              rows={2}
            />
          </div>
          <div className="flex space-x-2 pt-4">
            <Button type="submit" className="flex-1">Save</Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsProductModalOpen(false);
                setEditingProduct(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Order Details Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        title={`Order #${selectedOrder?.id.slice(0, 8)}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Date</p>
                <p className="text-lg font-medium text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">Order Items</p>
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-rose-300 transition-colors">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">{item.productName}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{item.pharmacyName}</span>
                        <span>•</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <p className="font-bold text-rose-600 ml-4">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-teal-500">
                  {formatCurrency(selectedOrder.totalAmount)}
                </span>
              </div>

              {/* Accept/Reject Buttons for Pending Orders */}
              {canManageOrder(selectedOrder) && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => {
                      handleAcceptOrder(selectedOrder);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg shadow-green-500/25"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Accept Order
                  </Button>
                  <Button
                    onClick={() => {
                      handleRejectOrder(selectedOrder);
                    }}
                    className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white border-0 shadow-lg shadow-red-500/25"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Reject Order
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

