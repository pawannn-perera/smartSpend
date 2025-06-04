import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface WarrantyFormData {
  productName: string;
  expirationDate: string;
  category: string;
  purchaseDate?: string;
  retailer?: string;
}

const AddWarranty: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<WarrantyFormData>({
    productName: "",
    expirationDate: "",
    category: "Electronics",
    purchaseDate: "",
    retailer: "",
  });

  const categories = [
    "Electronics",
    "Appliances",
    "Furniture",
    "Automotive",
    "Tools",
    "Other",
  ];

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
      !formData.productName ||
      !formData.expirationDate ||
      !formData.category
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post("/api/warranties", {
        ...formData,
        purchaseDate: formData.purchaseDate || undefined,
        retailer: formData.retailer || undefined,
      });

      navigate("/warranties");
    } catch (err) {
      setError("Failed to create warranty");
      console.error("Error creating warranty:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800">Add New Warranty</h1>
        <p className="text-md text-slate-600 mt-2">
          Keep track of your product warranties by adding them here.
        </p>
      </header>

      <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 sm:p-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow">
            <div className="flex items-start space-x-3">
              <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-3.992a.75.75 0 00.75-.75V9.75a.75.75 0 00-1.5 0v3.508a.75.75 0 00.75.75zm.008-5.008a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-700">Error</h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="productName"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="productName"
              id="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="e.g., Samsung Galaxy S24"
              className="form-input block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="purchaseDate"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Purchase Date
              </label>
              <input
                type="date"
                name="purchaseDate"
                id="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="form-input block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="expirationDate"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Expiration Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="expirationDate"
              id="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              className="form-input block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              required
            />
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
              placeholder="e.g., Amazon, Best Buy"
              className="form-input block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/warranties")}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 ease-in-out shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? "Creating..." : "Create Warranty"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWarranty;