// Warranties.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, AlertCircle, ChevronDown } from "lucide-react";
import { format, parseISO, isPast, addDays } from "date-fns";
import ConfirmModal from "../components/ConfirmModal";
import WarrantyDetailModal from "../components/WarrantyDetailModal";
import WarrantyModal from "../components/WarrantyModal";
import WarrantyFormData from "../types/WarrantyFormData";

export interface WarrantyInterface {
  _id: string;
  productName: string;
  expirationDate: string;
  category: string;
  purchaseDate?: string;
  retailer?: string;
}

type SortOption = "newest" | "oldest" | "az" | "za";

const Warranties: React.FC<{}> = () => {
  const [warranties, setWarranties] = useState<WarrantyInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<
    string | null
  >(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedWarrantyForDetail, setSelectedWarrantyForDetail] =
    useState<WarrantyInterface | null>(null);
  const [selectedWarrantyToEdit, setSelectedWarrantyToEdit] =
    useState<WarrantyInterface | null>(null);
  const [formData, setFormData] = useState<WarrantyFormData>({
    productName: "",
    expirationDate: new Date().toISOString().split("T")[0],
    category: "Electronics",
    purchaseDate: "",
    retailer: "",
    notes: "",
  });

  const categories = ["Electronics", "Appliances", "Furniture", "Other"];

  useEffect(() => {
    fetchWarranties();
  }, []);

  const fetchWarranties = async (): Promise<WarrantyInterface[]> => {
    try {
      setLoading(true);
      const response = await axios.get("/api/warranties");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.warranties;
      setWarranties(data || []);
      setError("");
      return data || [];
    } catch (err) {
      setError("Failed to fetch warranties");
      console.error("Error fetching warranties:", err);
    } finally {
      setLoading(false);
    }
  return [];
  };

  const confirmDelete = (id: string) => {
    setSelectedIdToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedIdToDelete) return;
    try {
      await axios.delete(`/api/warranties/${selectedIdToDelete}`);
      setWarranties((prev) =>
        prev.filter((w) => w._id !== selectedIdToDelete)
      );
      setError("");
    } catch (err) {
      setError("Failed to delete warranty");
      console.error("Error deleting warranty:", err);
    } finally {
      setShowConfirmModal(false);
      setSelectedIdToDelete(null);
    }
  };

  const getWarrantyStatus = (expirationDate: string) => {
    try {
      const parsedDate = parseISO(expirationDate);
      if (isNaN(parsedDate.getTime())) throw new Error("Invalid date");
      if (isPast(parsedDate)) {
        return {
          text: "Expired",
          color: "bg-red-100 text-red-800 border-red-200",
        };
      }
      if (isPast(addDays(parsedDate, -30))) {
        return {
          text: "Expiring Soon",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      }
      return {
        text: "Active",
        color: "bg-green-100 text-green-800 border-green-200",
      };
    } catch {
      return {
        text: "Invalid Date",
        color: "bg-gray-100 text-gray-800 border-gray-200",
      };
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  const handleOpenDetailModal = (warranty: WarrantyInterface) => {
    setSelectedWarrantyForDetail(warranty);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedWarrantyForDetail(null);
  };

  const sortedWarranties = [...warranties].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.expirationDate).getTime() -
          new Date(a.expirationDate).getTime()
        );
      case "oldest":
        return (
          new Date(a.expirationDate).getTime() -
          new Date(b.expirationDate).getTime()
        );
      case "az":
        return a.productName.localeCompare(b.productName);
      case "za":
        return b.productName.localeCompare(a.productName);
      default:
        return 0;
    }
  });

  const handleSubmit = async (data: WarrantyFormData) => {
    try {
      setLoading(true);
      setError("");

      if (selectedWarrantyToEdit) {
        await axios.put(
          `/api/warranties/${selectedWarrantyToEdit._id}`,
          data
        );
      } else {
        await axios.post("/api/warranties", data);
      }

      const updatedWarranties = await fetchWarranties();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedWarrantyToEdit(null);
      if (selectedWarrantyForDetail) {
        const updatedDetail = updatedWarranties.find(w => w._id === selectedWarrantyForDetail._id) || null;
        setSelectedWarrantyForDetail(updatedDetail);
      }
      setFormData({
        productName: "",
        expirationDate: new Date().toISOString().split("T")[0],
        category: "Electronics",
        purchaseDate: "",
        retailer: "",
        notes: "",
      });
    } catch (err) {
      setError("Failed to create warranty");
      console.error("Error creating warranty:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-800">
          Your Warranties
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="form-select appearance-none block w-full sm:w-auto pl-3 pr-10 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            >
              <option value="newest">Expiring Latest</option>
              <option value="oldest">Expiring Soonest</option>
              <option value="az">Product Name (A-Z)</option>
              <option value="za">Product Name (Z-A)</option>
            </select>
            <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm font-medium"
          >
            <Plus className="mr-2 w-5 h-5" />
            Add Warranty
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-red-500 mt-0.5 w-5 h-5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-700">Error</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedWarranties.map((warranty) => {
          const status = getWarrantyStatus(warranty.expirationDate);
          let cardBorderColor = "border-slate-200";
          if (status.text === "Expired")
            cardBorderColor = "border-red-300";
          else if (status.text === "Expiring Soon")
            cardBorderColor = "border-amber-300";

          return (
            <div
              key={warranty._id}
              onClick={() => handleOpenDetailModal(warranty)}
              className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border ${cardBorderColor} flex flex-col cursor-pointer`}
            >
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWarrantyToEdit(warranty);
                      setFormData({
                        productName: warranty.productName,
                        expirationDate: warranty.expirationDate
                          ? new Date(warranty.expirationDate)
                              .toISOString()
                              .split("T")[0]
                          : new Date().toISOString().split("T")[0],
                        category: warranty.category,
                        purchaseDate: warranty.purchaseDate
                          ? new Date(warranty.purchaseDate)
                              .toISOString()
                              .split("T")[0]
                          : "",
                        retailer: warranty.retailer,
                        notes: "",
                      });
                    }}
                    className="text-xl font-semibold text-slate-800 leading-tight mr-2 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {warranty.productName}
                  </h3>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block text-xs px-3 py-1 rounded-full font-semibold border ${status.color} whitespace-nowrap`}
                    >
                      {status.text}
                    </span>
                    <button
                      onClick={(e) =>
                        handleActionClick(e, () =>
                          confirmDelete(warranty._id)
                        )
                      }
                      className="text-rose-500 hover:text-rose-600 transition-colors p-1.5 rounded-md hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-500"
                      title="Delete Warranty"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-slate-600 mb-4">
                  <p>
                    <span className="font-medium text-slate-700">
                      Expires:
                    </span>{" "}
                    {format(
                      parseISO(warranty.expirationDate),
                      "MMM d, yyyy"
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Category: {warranty.category}
                  </p>
                </div>

                <div className="flex-grow"></div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        message="Are you sure you want to delete this warranty?"
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
      />

      <WarrantyDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        warranty={selectedWarrantyForDetail}
      />

      <WarrantyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        error={error}
        loading={loading}
        selectedWarrantyToEdit={selectedWarrantyToEdit}
      />

      {selectedWarrantyToEdit && (
        <WarrantyModal
          isOpen={!!selectedWarrantyToEdit}
          onClose={() => {
            setSelectedWarrantyToEdit(null);
            setFormData({
              productName: "",
              expirationDate: new Date().toISOString().split("T")[0],
              category: "Electronics",
              purchaseDate: "",
              retailer: "",
              notes: "",
            });
          }}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          error={error}
          loading={loading}
        />
      )}
    </div>
  );
};

export { Warranties };
