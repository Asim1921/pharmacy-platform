'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Pharmacy, Product } from '@/types';
import { getCachedData, setCachedData } from '@/lib/cache';
import { motion } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { MapPin, Phone, Mail, ShoppingCart, ChevronLeft, ChevronRight, Package, ChevronDown, ChevronUp } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
});

const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
});

const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), {
  ssr: false,
});

const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
});

const ITEMS_PER_PAGE = 20;
const PRODUCTS_PER_PAGE = 20;

export default function MapPage() {
  const [pharmacies, setPharmacies] = useState<(Pharmacy & { products: Product[] })[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<(Pharmacy & { products: Product[] }) | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPharmacyPage, setCurrentPharmacyPage] = useState(1);
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Fix Leaflet icon issue in Next.js
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
    }
    loadPharmacies();
  }, []);

  // Prevent map from re-rendering when sidebar state changes
  const mapKey = 'pharmacy-map-container';

  const loadPharmacies = async () => {
    try {
      setLoading(true);
      
      // Check cache first
      const cachedPharmacies = getCachedData<(Pharmacy & { products: Product[] })[]>('pharmacies');
      if (cachedPharmacies) {
        setPharmacies(cachedPharmacies);
        setLoading(false);
        return;
      }
      
      // Fetch pharmacies and all products in parallel (2 queries instead of N+1)
      const [pharmaciesSnapshot, productsSnapshot] = await Promise.all([
        getDocs(collection(db, 'pharmacies')),
        getDocs(collection(db, 'products'))
      ]);

      // Group products by pharmacyId for O(1) lookups
      const productsByPharmacy = new Map<string, Product[]>();
      productsSnapshot.forEach((productDoc) => {
        const productData = productDoc.data();
        const pharmacyId = productData.pharmacyId;
        
        if (!productsByPharmacy.has(pharmacyId)) {
          productsByPharmacy.set(pharmacyId, []);
        }
        
        productsByPharmacy.get(pharmacyId)!.push({
          ...productData,
          id: productDoc.id,
          expiryDate: productData.expiryDate?.toDate() || new Date(),
          createdAt: productData.createdAt?.toDate() || new Date(),
        } as Product);
      });

      // Build pharmacies array with products from the grouped Map
      const pharmaciesData: (Pharmacy & { products: Product[] })[] = [];
      pharmaciesSnapshot.forEach((pharmacyDoc) => {
        const pharmacyData = pharmacyDoc.data();
        const products = productsByPharmacy.get(pharmacyDoc.id) || [];

        pharmaciesData.push({
          ...pharmacyData,
          id: pharmacyDoc.id,
          createdAt: pharmacyData.createdAt?.toDate() || new Date(),
          products,
        } as Pharmacy & { products: Product[] });
      });

      // Cache the results
      setCachedData('pharmacies', pharmaciesData);

      setPharmacies(pharmaciesData);
    } catch (error) {
      console.error('Error loading pharmacies:', error);
      toast.error('Failed to load pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (pharmacy: Pharmacy & { products: Product[] }) => {
    setSelectedPharmacy(pharmacy);
    setCurrentProductPage(1); // Reset product pagination when opening a new pharmacy
    setIsModalOpen(true);
  };

  // Calculate pagination for pharmacies
  const totalPharmacyPages = Math.ceil(pharmacies.length / ITEMS_PER_PAGE);
  const startPharmacyIndex = (currentPharmacyPage - 1) * ITEMS_PER_PAGE;
  const endPharmacyIndex = startPharmacyIndex + ITEMS_PER_PAGE;
  const paginatedPharmacies = pharmacies.slice(startPharmacyIndex, endPharmacyIndex);

  // Calculate pagination for products in modal
  const totalProductPages = selectedPharmacy
    ? Math.ceil(selectedPharmacy.products.length / PRODUCTS_PER_PAGE)
    : 0;
  const startProductIndex = (currentProductPage - 1) * PRODUCTS_PER_PAGE;
  const endProductIndex = startProductIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = selectedPharmacy
    ? selectedPharmacy.products.slice(startProductIndex, endProductIndex)
    : [];

  const handlePharmacyPageChange = (page: number) => {
    setCurrentPharmacyPage(page);
  };

  const handleProductPageChange = (page: number) => {
    setCurrentProductPage(page);
  };

  const handleAddToCart = (product: Product, pharmacy: Pharmacy) => {
    // Check if user is authenticated
    if (!user) {
      toast.error('you must be login first');
      router.push('/login');
      return;
    }
    
    if (product.quantity === 0) {
      toast.error('Product is out of stock');
      return;
    }

    addItem({
      productId: product.id,
      productName: product.name,
      pharmacyId: pharmacy.id,
      pharmacyName: pharmacy.name,
      quantity: 1,
      price: product.price,
      availableQuantity: product.quantity,
    });
    
    toast.success('Added to cart!');
  };

  // Memoize center to prevent map re-initialization - MUST be before any early returns
  const center: [number, number] = useMemo(() => {
    if (pharmacies.length > 0 && pharmacies[0]) {
      return [pharmacies[0].latitude, pharmacies[0].longitude];
    }
    return [51.5074, -0.1278]; // Default to London, UK
  }, [pharmacies.length > 0 ? pharmacies[0]?.latitude : null, pharmacies.length > 0 ? pharmacies[0]?.longitude : null]);

  // Track if map should render - only once after loading
  const shouldRenderMap = !loading && pharmacies.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="text-slate-400">Loading pharmacies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="h-screen relative overflow-hidden">
        {/* Animated Background Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Sidebar - Modern Glassmorphism Design */}
        <motion.div 
          className={`absolute top-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden transition-all duration-300 ${
            isSidebarMinimized ? 'w-14' : 'max-w-sm w-[360px]'
          }`}
          initial={false}
          animate={{ width: isSidebarMinimized ? 56 : 360 }}
        >
          {/* Minimize/Expand Button */}
          <button
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 hover:border-emerald-500/50 transition-all duration-200 group"
            title={isSidebarMinimized ? 'Expand sidebar' : 'Minimize sidebar'}
          >
            {isSidebarMinimized ? (
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            )}
          </button>

          {/* Sidebar Content */}
          {!isSidebarMinimized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-5"
            >
              <div className="flex items-center gap-2 mb-3 pr-8">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Find Pharmacies
                </h1>
              </div>
              
              <p className="text-sm text-slate-400 mb-4">
                Click on a marker to view pharmacy details and products
              </p>
              
              {pharmacies.length > 0 && (
                <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-4">
                  <p className="text-xs font-medium text-emerald-400">
                    Showing {startPharmacyIndex + 1} - {Math.min(endPharmacyIndex, pharmacies.length)} of {pharmacies.length} pharmacies
                  </p>
                </div>
              )}
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto mb-4 pr-2 custom-scrollbar">
                {paginatedPharmacies.map((pharmacy, index) => (
                  <motion.div
                    key={pharmacy.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="group p-3 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-200"
                    onClick={() => handleMarkerClick(pharmacy)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                          {pharmacy.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {pharmacy.address}, {pharmacy.city}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs font-medium text-emerald-400">
                            <Package className="w-3 h-3" />
                            {pharmacy.products.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Pharmacy Pagination */}
              {totalPharmacyPages > 1 && (
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-700/50">
                  <Button
                    onClick={() => handlePharmacyPageChange(currentPharmacyPage - 1)}
                    disabled={currentPharmacyPage === 1}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    Prev
                  </Button>
                  <span className="text-xs font-medium text-slate-400">
                    Page {currentPharmacyPage} / {totalPharmacyPages}
                  </span>
                  <Button
                    onClick={() => handlePharmacyPageChange(currentPharmacyPage + 1)}
                    disabled={currentPharmacyPage === totalPharmacyPages}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-30"
                  >
                    Next
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Minimized State - Just Icon */}
          {isSidebarMinimized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center p-3 gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-emerald-400 whitespace-nowrap" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  {pharmacies.length}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        <div 
          id="leaflet-map-container"
          className="absolute inset-0 z-0" 
          style={{ height: '100%', width: '100%' }}
        >
          {shouldRenderMap && (
            <MapContainer
              key="pharmacy-map-permanent-instance"
              center={center}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              className="map-container"
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {pharmacies.map((pharmacy) => (
                <Marker
                  key={pharmacy.id}
                  position={[pharmacy.latitude, pharmacy.longitude]}
                  eventHandlers={{
                    click: () => handleMarkerClick(pharmacy),
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-2">
                      <h3 className="font-semibold mb-1 text-gray-900">{pharmacy.name}</h3>
                      <p className="text-sm text-gray-600">{pharmacy.address}</p>
                      <p className="text-sm text-gray-600">{pharmacy.city}, {pharmacy.state}</p>
                      <p className="text-xs text-emerald-600 mt-1 font-medium">{pharmacy.products.length} products</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPharmacy?.name}
        size="xl"
      >
        {selectedPharmacy && (
          <div className="space-y-6">
            {/* Pharmacy Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-700/50">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-wide">Address</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedPharmacy.address}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedPharmacy.city}, {selectedPharmacy.state} {selectedPharmacy.zipCode}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-cyan-200/50 dark:border-cyan-700/50">
                <p className="text-xs font-medium text-cyan-700 dark:text-cyan-400 mb-2 uppercase tracking-wide">Contact</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <a href={`tel:${selectedPharmacy.phone}`} className="text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 font-medium transition-colors">
                      {selectedPharmacy.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <a href={`mailto:${selectedPharmacy.email}`} className="text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 font-medium transition-colors text-sm break-all">
                      {selectedPharmacy.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Available Products
                </h3>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {selectedPharmacy.products.length} products
                </span>
              </div>
              
              {selectedPharmacy.products.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">No products available at this pharmacy.</p>
                </div>
              ) : (
                <>
                  {selectedPharmacy.products.length > PRODUCTS_PER_PAGE && (
                    <div className="mb-4 px-3 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {startProductIndex + 1} - {Math.min(endProductIndex, selectedPharmacy.products.length)} of {selectedPharmacy.products.length} products
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 mb-4 custom-scrollbar">
                    {paginatedProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-slate-700 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 h-full flex flex-col">
                          <div className="flex items-start justify-between mb-3 gap-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 flex-1">
                              {product.name}
                            </h4>
                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0 ml-2">
                              {formatCurrency(product.price)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                              {product.category.replace('-', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                              product.quantity > 0 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                              {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                            </span>
                          </div>
                          
                          <Button
                            size="sm"
                            className="w-full mt-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
                            onClick={() => handleAddToCart(product, selectedPharmacy)}
                            disabled={product.quantity === 0}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Product Pagination */}
                  {totalProductPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        onClick={() => handleProductPageChange(currentProductPage - 1)}
                        disabled={currentProductPage === 1}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3 h-3" />
                        Previous
                      </Button>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 px-3">
                        Page {currentProductPage} / {totalProductPages}
                      </span>
                      <Button
                        onClick={() => handleProductPageChange(currentProductPage + 1)}
                        disabled={currentProductPage === totalProductPages}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

