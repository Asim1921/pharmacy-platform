'use client';

import { motion } from 'framer-motion';
import { Search, MapPin, Package, Shield, ShoppingCart, Heart, Sparkles, CheckCircle2, Zap, Clock } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';

export default function Home() {
  const { user } = useAuthStore();

  const features = [
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find medications and health products instantly with our intelligent search system',
      gradient: 'from-rose-400 to-pink-500',
      bg: 'bg-rose-500/10',
    },
    {
      icon: MapPin,
      title: 'Location Finder',
      description: 'Discover nearby pharmacies on an interactive, real-time map interface',
      gradient: 'from-teal-400 to-cyan-500',
      bg: 'bg-teal-500/10',
    },
    {
      icon: ShoppingCart,
      title: 'Instant Ordering',
      description: 'Order products online with live inventory tracking and real-time updates',
      gradient: 'from-amber-400 to-orange-500',
      bg: 'bg-amber-500/10',
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Your health information is protected with enterprise-grade security',
      gradient: 'from-teal-500 to-rose-500',
      bg: 'bg-teal-500/10',
    },
  ];

  const benefits = [
    'Real-time inventory tracking',
    'Secure payment processing',
    '24/7 customer support',
    'Prescription management',
    'Order history & tracking',
    'Multiple pharmacy options',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white text-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center relative z-10"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 border border-rose-200 backdrop-blur-sm mb-6"
            >
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span className="text-sm font-medium text-rose-700">Next-Gen Pharmacy Platform</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Your Health Journey
              <br />
              <span className="bg-gradient-to-r from-rose-500 via-teal-500 to-amber-500 bg-clip-text text-transparent">
                Starts Here
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl mb-10 text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connect with trusted community pharmacies. Find medications instantly. Order with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {!user ? (
                <>
                  <Link href="/register">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button size="lg" className="bg-gradient-to-r from-rose-500 to-teal-500 text-white hover:from-rose-600 hover:to-teal-600 shadow-lg shadow-rose-500/25 border-0 px-8 py-6 text-lg">
                        Get Started Free
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/products">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button size="lg" variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 backdrop-blur-sm px-8 py-6 text-lg">
                        Browse Products
                      </Button>
                    </motion.div>
                  </Link>
                </>
              ) : (
                <Link href="/products">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="bg-gradient-to-r from-rose-500 to-teal-500 text-white hover:from-rose-600 hover:to-teal-600 shadow-lg shadow-rose-500/25 border-0 px-8 py-6 text-lg">
                      Browse Products
                    </Button>
                  </motion.div>
                </Link>
              )}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 pt-8 border-t border-gray-200"
            >
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-teal-500 bg-clip-text text-transparent">500+</div>
                <div className="text-sm text-gray-600 mt-1">Pharmacies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-amber-500 bg-clip-text text-transparent">10K+</div>
                <div className="text-sm text-gray-600 mt-1">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">50K+</div>
                <div className="text-sm text-gray-600 mt-1">Customers</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-rose-100 border border-rose-200 text-rose-700 text-sm font-medium mb-4">
              Why Choose Us
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A comprehensive platform designed to make your medication journey seamless and secure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group relative"
                >
                  <div className="relative p-6 rounded-2xl bg-white backdrop-blur-sm border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 h-full">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 -z-10`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-teal-100 border border-teal-200 text-teal-700 text-sm font-medium mb-4">
                Platform Benefits
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Built for Your Convenience
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Experience a modern pharmacy platform that puts your needs first. Fast, secure, and always accessible.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white backdrop-blur-sm border border-gray-200 shadow-sm"
                  >
                    <CheckCircle2 className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white to-gray-50 backdrop-blur-xl border border-gray-200 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-gray-900 font-semibold">Instant Search</div>
                        <div className="text-gray-600 text-sm">Find products in seconds</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-teal-50 border border-teal-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-gray-900 font-semibold">Real-time Updates</div>
                        <div className="text-gray-600 text-sm">Live inventory tracking</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-gray-900 font-semibold">Secure Platform</div>
                        <div className="text-gray-600 text-sm">Enterprise-grade security</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-rose-200/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-teal-200/30 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-r from-rose-50 via-teal-50 to-amber-50">
        {/* Decorative background pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-teal-500 mb-6 shadow-lg shadow-rose-500/25"
            >
              <Heart className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-rose-500 via-teal-500 to-amber-500 bg-clip-text text-transparent">
              Your Health, Our Mission
            </h2>
            <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of satisfied customers who trust our platform for their medication needs. Start your journey today.
            </p>
            {!user && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-rose-500 to-teal-500 text-white hover:from-rose-600 hover:to-teal-600 shadow-lg shadow-rose-500/25 border-0 px-10 py-6 text-lg">
                    Create Your Account
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
