import React from "react";
import { Dispatch, SetStateAction } from "react";
import WarrantyFormData from "../types/WarrantyFormData";
import { WarrantyInterface } from "../pages/Warranties";

interface WarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WarrantyFormData) => void;
  formData: WarrantyFormData;
  setFormData: Dispatch<SetStateAction<WarrantyFormData>>;
  categories: string[];
  error: string;
  loading: boolean;
  selectedWarrantyToEdit?: WarrantyInterface | null;
}

const WarrantyModal: React.FC<WarrantyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  categories,
  error,
  loading,
}) => {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.productName ||
      !formData.expirationDate ||
      !formData.category
    ) {
      return;
    }

    try {
      onSubmit(formData);
    } catch (err) {
      console.error("Error submitting warranty:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-4 sm:p-6 max-w-2xl w-full">
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {formData.productName ? "Edit Warranty" : "Add New Warranty"}
          </h2>
        </header>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow">
            <div className="flex items-start space-x-3">
              <svg
                className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-3.992a.75.75 0 00.75-.75V9.75a.75.75 0 00-1.5 0v3.508a.75.75 0 00.75.75zm.008-5.008a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-700">
                  Error
                </h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="productName"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Product Name
            </label>
            <input
              type="text"
              name="productName"
              id="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="e.g., Laptop"
              className="form-input block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition duration-150 ease-in-out"
              required
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition duration-150 ease-in-out"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="purchaseDate"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Purchase Date
              </label>
              <input
                type="date"
                name="purchaseDate"
                id="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="form-input block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition duration-150 ease-in-out"
              />
            </div>

            <div>
              <label
                htmlFor="expirationDate"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Expiration Date
              </label>
              <input
                type="date"
                name="expirationDate"
                id="expirationDate"
                value={formData.expirationDate}
                onChange={handleChange}
                className="form-input block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition duration-150 ease-in-out"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="retailer"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Retailer
            </label>
            <input
              type="text"
              name="retailer"
              id="retailer"
              value={formData.retailer}
              onChange={handleChange}
              placeholder="e.g., Amazon"
              className="form-input block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Notes
            </label>
            <textarea
              name="notes"
              id="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g., Extended warranty"
              className="form-input block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 ease-in-out shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WarrantyModal;
