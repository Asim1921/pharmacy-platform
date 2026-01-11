'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Package, Calendar, PoundSterling, MapPin } from 'lucide-react';
import { Product, Pharmacy } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import Button from './ui/Button';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  pharmacy: Pharmacy;
  onViewDetails?: () => void;
}

export default function ProductCard({ product, pharmacy, onViewDetails }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
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

  const categoryColors = {
    prescription: 'bg-red-100 text-red-700 border-red-200',
    'over-the-counter': 'bg-teal-100 text-teal-700 border-teal-200',
    wellness: 'bg-rose-100 text-rose-700 border-rose-200',
    vitamins: 'bg-amber-100 text-amber-700 border-amber-200',
    supplements: 'bg-pink-100 text-pink-700 border-pink-200',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full flex flex-col bg-white backdrop-blur-xl rounded-2xl border border-gray-200 p-5 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-200 cursor-pointer group"
      onClick={onViewDetails}
    >
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{pharmacy.name}</span>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex-shrink-0 capitalize ${categoryColors[product.category]}`}>
            {product.category.replace('-', ' ')}
          </span>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg">
            <PoundSterling className="w-4 h-4 text-rose-600" />
            <span className="text-xl font-bold text-rose-600">
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {product.dosage && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="w-4 h-4 text-gray-500" />
              <span>{product.dosage}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>Exp: {formatDate(product.expiryDate)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
              product.quantity > 0
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${product.quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>

        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {product.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.();
          }}
        >
          Details
        </Button>
        <Button
          className={`flex-1 ${
            product.quantity > 0
              ? 'bg-teal-500 hover:bg-teal-600 text-white border-0 shadow-lg shadow-teal-500/25'
              : 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
          }`}
          onClick={handleAddToCart}
          disabled={product.quantity === 0}
        >
          <ShoppingCart size={16} className="mr-2" />
          Add
        </Button>
      </div>
    </motion.div>
  );
}

