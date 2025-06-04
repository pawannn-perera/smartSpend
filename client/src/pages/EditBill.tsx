import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

interface BillFormData {
  name: string;
  amount: string;
  dueDate: string;
  category: string;
  isPaid?: boolean;
}

const EditBill: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<BillFormData>({
    name: "",
    amount: "",
    dueDate: new Date().toISOString().split("T")[0],
    category: "Other",
  });

  const categories = [
    "Utilities",
    "Rent/Mortgage",
    "Insurance",
    "Subscriptions",
    "Credit Card",
    "Phone/Internet",
    "Other",
  ];

  useEffect(() => {
    fetchBill();
  }, []);

  const fetchBill = async () => {
    try {
      const response = await axios.get(`/api/bills/${id}`);
      const bill = response.data;
      setFormData({
        name: bill.name,
        amount: bill.amount.toString(),
        dueDate: new Date(bill.dueDate).toISOString().split("T")[0],
        category: bill.category,
        isPaid: bill.isPaid,
      });
      setError("");
    } catch (err) {
      setError("Failed to fetch bill");
      console.error("Error fetching bill:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const handleTogglePaid = () => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     isPaid: !prev.isPaid,
  //   }));
  // };

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

      await axios.put(`/api/bills/${id}`, {
        ...formData,
        amount: parseFloat(formData.amount),
      });

      navigate("/bills");
    } catch (err) {
      setError("Failed to update bill");
      console.error("Error updating bill:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.name) { // Keep loading indicator if fetching initial data
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800">Edit Bill</h1>
        <p className="text-md text-slate-600 mt-2">
          Modify the details of your existing bill.
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
          
          {/* The isPaid toggle was commented out in the original, keeping it that way unless specified */}

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/bills")}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 ease-in-out shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading} // Use the general loading state for the button
              className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading && formData.name ? "Updating..." : "Update Bill"} {/* Show "Updating..." only if already loaded and now submitting */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBill;