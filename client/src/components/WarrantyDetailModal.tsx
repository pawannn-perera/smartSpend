import React from "react";
import { X, ShieldCheck, CalendarDays, ShoppingBag, Tag, Building } from "lucide-react";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface WarrantyInterface {
  _id: string;
  productName: string;
  expirationDate: string;
  category: string;
  purchaseDate?: string;
  retailer?: string;
  // Add notes or other fields here if they exist in your data model
}

interface WarrantyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  warranty: WarrantyInterface | null;
}

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 text-slate-500 mt-1">{icon}</div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-slate-700">{value}</p>
      </div>
    </div>
  );
};

const WarrantyDetailModal: React.FC<WarrantyDetailModalProps> = ({ isOpen, onClose, warranty }) => {
  return (
    <AnimatePresence>
      {isOpen && warranty && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-[60] bg-slate-900/70" // Removed backdrop-blur-sm
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* New container for centering */}
          <div className="flex items-center justify-center h-full w-full"> {/* Removed p-4 from here */}
            <motion.div
              key="modal"
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden m-4" /* Added margin here instead of padding on parent */
              onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-slate-800">Warranty Details</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-indigo-700">{warranty.productName}</h3>
                <p className="text-sm text-slate-500">{warranty.category}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <DetailItem
                  icon={<CalendarDays className="w-4 h-4" />}
                  label="Expiration Date"
                  value={format(parseISO(warranty.expirationDate), "MMMM d, yyyy")}
                />
                {warranty.purchaseDate && (
                  <DetailItem
                    icon={<ShoppingBag className="w-4 h-4" />}
                    label="Purchase Date"
                    value={format(parseISO(warranty.purchaseDate), "MMMM d, yyyy")}
                  />
                )}
                {warranty.retailer && (
                   <DetailItem
                    icon={<Building className="w-4 h-4" />}
                    label="Retailer"
                    value={warranty.retailer}
                  />
                )}
                 <DetailItem
                    icon={<Tag className="w-4 h-4" />}
                    label="Category (detail)" // Example if category needs more emphasis or different display
                    value={warranty.category}
                />
                {/* Add more DetailItem components for other fields like notes, serial number, etc. */}
              </div>
            </div>

            {/* Modal Footer (optional, for actions like "Edit") */}
            <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 text-right">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Close
              </button>
            </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WarrantyDetailModal;