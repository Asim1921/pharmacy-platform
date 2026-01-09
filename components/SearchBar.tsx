'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import Input from './ui/Input';
import { ProductCategory } from '@/types';

interface SearchBarProps {
  onSearch: (query: string, category?: ProductCategory, location?: string) => void;
  categories: ProductCategory[];
}

export default function SearchBar({ onSearch, categories }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | ''>('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    onSearch(
      searchQuery,
      selectedCategory || undefined,
      location || undefined
    );
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setLocation('');
    onSearch('', undefined, undefined);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
          <Input
            placeholder="Search by product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-12 pr-12"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-teal-500 text-white rounded-xl hover:from-rose-600 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-rose-500/25 font-medium"
        >
          Search
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as ProductCategory | '')}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all duration-200 hover:border-gray-400 shadow-sm"
          >
            <option value="" className="bg-white text-gray-900">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-white text-gray-900">
                {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Filter by location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {(searchQuery || selectedCategory || location) && (
          <button
            onClick={handleClear}
            className="px-4 py-3 text-gray-600 hover:text-gray-900 transition-colors border border-gray-300 rounded-xl hover:bg-gray-50 bg-white shadow-sm"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

