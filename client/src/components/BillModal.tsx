import React, { useState, useEffect } from "react";
import BillFormData from "../types/BillFormData";
import { AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BillFormData) => void;
  initialData?: BillFormData;
}

const BillModal: React.FC<BillModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<BillFormData>({
    name: "",
    amount: "",
    dueDate: new Date().toISOString().split("T")[0],
    category: "Other",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    "Rent / Mortgage",
    "Electricity",
    "Water",
    "Internet",
    "Mobile Phone",
    "Streaming Services",
    "Credit Card Payments",
    "Loan Payments",
    "Insurance (Health/Auto/Home)",
    "Gym Membership",
    "School Tuition / Fees",
    "Cloud / SaaS Services",
    "Taxes",
    "Security / Alarm Services",
    "Other Utilities",
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        amount: initialData.amount,
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        category: initialData.category,
        isPaid: initialData.isPaid,
      });
    } else {
      setFormData({
        name: "",
        amount: "",
        dueDate: new Date().toISOString().split("T")[0],
        category: "Other Utilities",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      !formData.name ||
      !formData.amount ||
      !formData.dueDate ||
      !formData.category
    ) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount as string),
      });
    } catch (err) {
      setError("Failed to submit bill");
      console.error("Error submitting bill:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 sm:p-8 sm:max-w-2xl w-full">
          <header className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {initialData ? "Edit Bill" : "Add New Bill"}
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
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Bill Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Monthly Electricity Bill"
                className="form-input block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                required
              />
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Amount
              </label>
              <div className="relative mt-1 rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-500 sm:text-sm">Rs.</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="form-input block w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                id="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="form-input block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                required
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
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
    </AnimatePresence>,
    document.body
  );
};

export default BillModal;
