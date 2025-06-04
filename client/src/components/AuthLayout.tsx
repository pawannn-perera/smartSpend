// components/AuthLayout.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  children: React.ReactNode;
}

const AuthLayout: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  // Web-optimized images from Unsplash (free to use)
  const images = {
    login: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    register: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
    mobile: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1415&q=80'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Illustration Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex items-center justify-center p-12 bg-gray-100 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/10 z-10"></div>
          <AnimatePresence mode="wait">
            <motion.img
              key={isLogin ? 'login' : 'register'}
              src={isLogin ? images.login : images.register}
              alt={isLogin ? "Financial tracking dashboard" : "Warranty document management"}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            />
          </AnimatePresence>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative z-20 text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-4 drop-shadow-md">
              {isLogin ? 'Track Your Warranties' : 'Manage Expenses'}
            </h2>
            <p className="text-lg max-w-md drop-shadow-md">
              {isLogin 
                ? 'Access all your product warranties in one place' 
                : 'Take control of your spending with smart tracking'}
            </p>
          </motion.div>
        </motion.div>

        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center p-6 sm:p-12"
        >
          <div className="w-full max-w-md">
            {/* Mobile header */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:hidden mb-8 text-center"
            >
              <img 
                src={images.mobile} 
                alt="Financial app" 
                className="mx-auto w-32 h-32 object-cover rounded-full mb-4 shadow-md"
              />
              <h1 className="text-2xl font-bold text-gray-800">
                {isLogin ? 'Warranty Tracker' : 'Expense Manager'}
              </h1>
            </motion.div>

            {/* Form content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-8 sm:p-10 rounded-xl shadow-sm border border-gray-200"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;