'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, Pharmacy, ProductCategory } from '@/types';
import { getCachedData, setCachedData } from '@/lib/cache';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import { motion } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import { X, Package, Calendar, PoundSterling, AlertCircle, ChevronLeft, ChevronRight, Sparkles, Search as SearchIcon } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const categories: ProductCategory[] = ['prescription', 'over-the-counter', 'wellness', 'vitamins', 'supplements'];

const ITEMS_PER_PAGE = 20;

export default function ProductsPage() {
  const [products, setProducts] = useState<(Product & { pharmacy: Pharmacy })[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<(Product & { pharmacy: Pharmacy })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<(Product & { pharmacy: Pharmacy }) | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Check cache first
      const cachedProducts = getCachedData<(Product & { pharmacy: Pharmacy })[]>('products');
      if (cachedProducts) {
        setProducts(cachedProducts);
        setFilteredProducts(cachedProducts);
        setLoading(false);
        return;
      }
      
      // Fetch products and pharmacies in parallel (2 queries instead of N+1)
      const [productsSnapshot, pharmaciesSnapshot] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'pharmacies'))
      ]);

      // Create a Map for O(1) pharmacy lookups
      const pharmacyMap = new Map<string, Pharmacy>();
      pharmaciesSnapshot.forEach((pharmacyDoc) => {
        const pharmacyData = pharmacyDoc.data();
        pharmacyMap.set(pharmacyDoc.id, {
          ...pharmacyData,
          id: pharmacyDoc.id,
          createdAt: pharmacyData.createdAt?.toDate() || new Date(),
        } as Pharmacy);
      });

      // Build products array with pharmacy data from the Map
      const productsData: (Product & { pharmacy: Pharmacy })[] = [];
      productsSnapshot.forEach((productDoc) => {
        const productData = productDoc.data();
        const pharmacy = pharmacyMap.get(productData.pharmacyId);
        
        if (pharmacy) {
          productsData.push({
            ...productData,
            id: productDoc.id,
            expiryDate: productData.expiryDate?.toDate() || new Date(),
            createdAt: productData.createdAt?.toDate() || new Date(),
            pharmacy,
          } as Product & { pharmacy: Pharmacy });
        }
      });

      // Cache the results
      setCachedData('products', productsData);
      
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string, category?: ProductCategory, location?: string) => {
    let filtered = [...products];

    if (query) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (location) {
      filtered = filtered.filter((p) =>
        p.pharmacy.city.toLowerCase().includes(location.toLowerCase()) ||
        p.pharmacy.state.toLowerCase().includes(location.toLowerCase()) ||
        p.pharmacy.address.toLowerCase().includes(location.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (product: Product & { pharmacy: Pharmacy }) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    // Check if user is authenticated
    if (!user) {
      toast.error('you must be login first');
      router.push('/login');
      setIsModalOpen(false);
      return;
    }
    
    if (selectedProduct.quantity === 0) {
      toast.error('Product is out of stock');
      return;
    }

    addItem({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      pharmacyId: selectedProduct.pharmacy.id,
      pharmacyName: selectedProduct.pharmacy.name,
      quantity: 1,
      price: selectedProduct.price,
      availableQuantity: selectedProduct.quantity,
    });
    
    toast.success('Added to cart!');
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-teal-500 flex items-center justify-center shadow-lg shadow-rose-500/25">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-1">
                <span className="bg-gradient-to-r from-rose-500 via-teal-500 to-amber-500 bg-clip-text text-transparent">
                  Browse Products
                </span>
              </h1>
              <p className="text-gray-600 text-sm">
                Discover medications and health products
              </p>
            </div>
          </div>
          <SearchBar onSearch={handleSearch} categories={categories} />
        </motion.div>

        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 border border-gray-200 mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No products found</h2>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <SearchIcon className="w-8 h-8 text-gray-400 mx-auto" />
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center justify-between"
            >
              <div className="px-4 py-2 bg-rose-100 border border-rose-200 rounded-lg">
                <p className="text-sm font-medium text-rose-700">
                  Showing {startIndex + 1} - {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
                </p>
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {paginatedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <ProductCard
                    product={product}
                    pharmacy={product.pharmacy}
                    onViewDetails={() => handleViewDetails(product)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-gray-200"
              >
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first page, last page, current page, and pages around current
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      );
                    })
                    .map((page, index, array) => {
                      // Add ellipsis if there's a gap
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      
                      return (
                        <div key={page} className="flex items-center gap-1">
                          {showEllipsis && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <Button
                            onClick={() => handlePageChange(page)}
                            variant={currentPage === page ? "primary" : "outline"}
                            className={`min-w-[40px] ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-rose-500 to-teal-500 border-0 text-white shadow-lg shadow-rose-500/25'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </Button>
                        </div>
                      );
                    })}
                </div>
                
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProduct?.name}
        size="lg"
      >
        {selectedProduct && (
          <div className="space-y-4">
            {/* Price and Stock Header */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-200">
                <p className="text-xs font-medium text-rose-600 mb-1 uppercase tracking-wide">Price</p>
                <p className="text-2xl font-bold text-rose-600">
                  {formatCurrency(selectedProduct.price)}
                </p>
              </div>
              <div className={`rounded-xl p-4 border ${
                selectedProduct.quantity > 0 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                  : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
              }`}>
                <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Stock</p>
                <p className={`text-2xl font-bold ${
                  selectedProduct.quantity > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedProduct.quantity}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedProduct.quantity > 0 ? 'available' : 'out of stock'}
                </p>
              </div>
            </div>

            {/* Product Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Category</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {selectedProduct.category.replace('-', ' ')}
                </p>
              </div>

              {selectedProduct.dosage && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Dosage</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedProduct.dosage}</p>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Expiry Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(selectedProduct.expiryDate)}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <p className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Pharmacy</p>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedProduct.pharmacy.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedProduct.pharmacy.city}, {selectedProduct.pharmacy.state}
                </p>
              </div>
            </div>

            {/* Description and Details */}
            {selectedProduct.description && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedProduct.description}</p>
              </div>
            )}

            {/* Additional Information */}
            {(selectedProduct.usage || selectedProduct.sideEffects || selectedProduct.healthInfo) && (
              <div className="space-y-3 pt-2">
                {selectedProduct.usage && (
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 border-l-4 border-l-teal-500">
                    <p className="text-xs font-medium text-teal-700 mb-1 uppercase tracking-wide">Usage Instructions</p>
                    <p className="text-sm text-gray-700">{selectedProduct.usage}</p>
                  </div>
                )}

                {selectedProduct.sideEffects && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 border-l-4 border-l-amber-500">
                    <p className="text-xs font-medium text-amber-700 mb-1 uppercase tracking-wide">Side Effects</p>
                    <p className="text-sm text-gray-700">{selectedProduct.sideEffects}</p>
                  </div>
                )}

                {selectedProduct.healthInfo && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 border-l-4 border-l-rose-500">
                    <p className="text-xs font-medium text-rose-700 mb-1 uppercase tracking-wide">Health Information</p>
                    <p className="text-sm text-gray-700">{selectedProduct.healthInfo}</p>
                  </div>
                )}
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                className={`w-full ${
                  selectedProduct.quantity > 0
                    ? 'bg-gradient-to-r from-rose-500 to-teal-500 hover:from-rose-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-rose-500/25'
                    : 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                }`}
                onClick={handleAddToCart}
                disabled={selectedProduct.quantity === 0}
              >
                {selectedProduct.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

