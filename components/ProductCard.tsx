'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Package, Calendar, DollarSign, MapPin } from 'lucide-react';
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
    prescription: 'bg-red-500/20 text-red-400 border-red-500/30',
    'over-the-counter': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    wellness: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    vitamins: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    supplements: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full flex flex-col bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-200 cursor-pointer group"
      onClick={onViewDetails}
    >
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
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
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xl font-bold text-emerald-400">
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {product.dosage && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Package className="w-4 h-4 text-slate-500" />
              <span>{product.dosage}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>Exp: {formatDate(product.expiryDate)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
              product.quantity > 0
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${product.quantity > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
              {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>

        {product.description && (
          <p className="text-sm text-slate-400 line-clamp-2 mb-4">
            {product.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-slate-700/50">
        <Button
          variant="outline"
          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500"
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
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/25'
              : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
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

