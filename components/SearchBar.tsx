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
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 z-10" size={20} />
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
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors z-10"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-emerald-500/25 font-medium"
        >
          Search
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as ProductCategory | '')}
            className="w-full px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 hover:border-slate-600"
          >
            <option value="" className="bg-slate-800">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-800">
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
            className="px-4 py-3 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700/50 rounded-xl hover:bg-slate-800/50"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

