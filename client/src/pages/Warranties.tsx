// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import axios from "axios";
// import { Plus, Trash2, AlertCircle } from "lucide-react";
// import { format, parseISO, isPast, addDays } from "date-fns";
// import ConfirmModal from "../components/ConfirmModal";

// interface WarrantyInterface {
//   _id: string;
//   productName: string;
//   expirationDate: string;
//   category: string;
//   purchaseDate?: string;
//   retailer?: string;
// }

// const Warranties: React.FC = () => {
//   const [warranties, setWarranties] = useState<WarrantyInterface[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(null);

//   useEffect(() => {
//     fetchWarranties();
//   }, []);

//   const fetchWarranties = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get("/api/warranties");
//       const data = Array.isArray(response.data)
//         ? response.data
//         : response.data.warranties;
//       setWarranties(data || []);
//       setError("");
//     } catch (err) {
//       setError("Failed to fetch warranties");
//       console.error("Error fetching warranties:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const confirmDelete = (id: string) => {
//     setSelectedIdToDelete(id);
//     setShowConfirmModal(true);
//   };

//   const handleConfirmDelete = async () => {
//     if (!selectedIdToDelete) return;
//     try {
//       await axios.delete(`/api/warranties/${selectedIdToDelete}`);
//       setWarranties(warranties.filter((w) => w._id !== selectedIdToDelete));
//       setError("");
//     } catch (err) {
//       setError("Failed to delete warranty");
//       console.error("Error deleting warranty:", err);
//     } finally {
//       setShowConfirmModal(false);
//       setSelectedIdToDelete(null);
//     }
//   };

//   const getWarrantyStatus = (expirationDate: string) => {
//     try {
//       const parsedDate = parseISO(expirationDate);
//       if (isNaN(parsedDate.getTime())) {
//         throw new Error("Invalid date");
//       }
//       if (isPast(parsedDate)) {
//         return { text: "Expired", color: "bg-red-100 text-red-800 border-red-200" };
//       }
//       if (isPast(addDays(parsedDate, -30))) {
//         return { text: "Expiring Soon", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
//       }
//       return { text: "Active", color: "bg-green-100 text-green-800 border-green-200" };
//     } catch (err) {
//       console.error("Invalid expirationDate:", expirationDate);
//       return { text: "Invalid Date", color: "bg-gray-100 text-gray-800 border-gray-200" };
//     }
//   };

//   const handleActionClick = (
//     e: React.MouseEvent,
//     action: () => void
//   ) => {
//     e.preventDefault();
//     e.stopPropagation();
//     action();
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 border-solid"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-semibold text-gray-900">Your Warranties</h1>
//         <Link
//           to="/warranties/add"
//           className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm text-sm font-medium"
//         >
//           <Plus className="mr-1.5 w-4 h-4" />
//           Add Warranty
//         </Link>
//       </div>

//       {error && (
//         <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md">
//           <div className="flex items-start space-x-2">
//             <AlertCircle className="text-red-500 mt-0.5 w-4 h-4" />
//             <p className="text-sm text-red-700">{error}</p>
//           </div>
//         </div>
//       )}

//       {warranties.length === 0 ? (
//         <div className="text-center text-gray-500 text-sm py-6">
//           No warranties found. Click the "Add Warranty" button to create one.
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {warranties.map((warranty) => {
//             const status = getWarrantyStatus(warranty.expirationDate);
//             return (
//               <Link
//                 key={warranty._id}
//                 to={`/warranties/${warranty._id}`}
//                 className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:bg-gray-50 transition cursor-pointer"
//               >
//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <h2 className="text-base font-semibold text-gray-900 truncate pr-8">
//                       {warranty.productName}
//                     </h2>
//                     <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-md font-medium border ${status.color}`}>
//                       {status.text}
//                     </span>
//                   </div>
//                   <div className="text-sm text-gray-600">
//                     <span className="font-medium">Category:</span> {warranty.category}
//                   </div>
//                   {warranty.retailer && (
//                     <div className="text-sm text-gray-600">
//                       <span className="font-medium">Retailer:</span> {warranty.retailer}
//                     </div>
//                   )}
//                   {warranty.purchaseDate && (
//                     <div className="text-sm text-gray-600">
//                       <span className="font-medium">Purchased:</span>{" "}
//                       {format(parseISO(warranty.purchaseDate), "MMM d, yyyy")}
//                     </div>
//                   )}
//                   <div className="text-sm text-gray-600">
//                     <span className="font-medium">Expires:</span>{" "}
//                     {format(parseISO(warranty.expirationDate), "MMM d, yyyy")}
//                   </div>
//                   <div className="flex justify-end">
//                     <button
//                       onClick={(e) => handleActionClick(e, () => confirmDelete(warranty._id))}
//                       className="text-red-600 hover:text-red-800 transition p-1"
//                       title="Delete"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               </Link>
//             );
//           })}
//         </div>
//       )}

//       <ConfirmModal
//         isOpen={showConfirmModal}
//         message="Are you sure you want to delete this warranty?"
//         onCancel={() => setShowConfirmModal(false)}
//         onConfirm={handleConfirmDelete}
//       />
//     </div>
//   );
// };

// export default Warranties;


import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Plus, Trash2, AlertCircle, ChevronDown, ShieldCheck } from "lucide-react";
import { format, parseISO, isPast, addDays } from "date-fns";
import ConfirmModal from "../components/ConfirmModal";
import WarrantyDetailModal from "../components/WarrantyDetailModal"; // Import the new modal

interface WarrantyInterface {
  _id: string;
  productName: string;
  expirationDate: string;
  category: string;
  purchaseDate?: string;
  retailer?: string;
}

type SortOption = "newest" | "oldest" | "az" | "za";

const Warranties: React.FC = () => {
  const [warranties, setWarranties] = useState<WarrantyInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedWarrantyForDetail, setSelectedWarrantyForDetail] = useState<WarrantyInterface | null>(null);

  useEffect(() => {
    fetchWarranties();
  }, []);

  const fetchWarranties = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/warranties");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.warranties;
      setWarranties(data || []);
      setError("");
    } catch (err) {
      setError("Failed to fetch warranties");
      console.error("Error fetching warranties:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setSelectedIdToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedIdToDelete) return;
    try {
      await axios.delete(`/api/warranties/${selectedIdToDelete}`);
      setWarranties((prev) => prev.filter((w) => w._id !== selectedIdToDelete));
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
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date");
      }
      if (isPast(parsedDate)) {
        return { text: "Expired", color: "bg-red-100 text-red-800 border-red-200" };
      }
      if (isPast(addDays(parsedDate, -30))) {
        return { text: "Expiring Soon", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
      }
      return { text: "Active", color: "bg-green-100 text-green-800 border-green-200" };
    } catch {
      return { text: "Invalid Date", color: "bg-gray-100 text-gray-800 border-gray-200" };
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
        return new Date(b.expirationDate).getTime() - new Date(a.expirationDate).getTime();
      case "oldest":
        return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
      case "az":
        return a.productName.localeCompare(b.productName);
      case "za":
        return b.productName.localeCompare(a.productName);
      default:
        return 0;
    }
  });

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
        <h1 className="text-3xl font-bold text-slate-800">Your Warranties</h1>
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
          <Link
            to="/warranties/add"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm font-medium"
          >
            <Plus className="mr-2 w-5 h-5" />
            Add Warranty
          </Link>
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

      {sortedWarranties.length === 0 && !loading && !error ? (
        <div className="text-center text-slate-500 py-10 bg-white rounded-lg shadow-md border border-slate-200">
          <ShieldCheck className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No Warranties Yet</h3>
          <p className="text-sm">Looks like you haven't added any warranties. Get started by clicking the "Add Warranty" button.</p>
        </div>
      ) : (
        !loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedWarranties.map((warranty) => {
              const status = getWarrantyStatus(warranty.expirationDate);
              // Determine card border color based on status for emphasis
              let cardBorderColor = "border-slate-200";
              if (status.text === "Expired") cardBorderColor = "border-red-300";
              else if (status.text === "Expiring Soon") cardBorderColor = "border-amber-300";
              
              return (
                <div
                  key={warranty._id}
                  className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border ${cardBorderColor} flex flex-col`}
                >
                  <div className="p-6 flex flex-col flex-grow"> {/* Increased padding */}
                    {/* Top section: Product Name and Status Badge */}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-slate-800 leading-tight mr-2"> {/* Added margin-right */}
                        <Link to={`/warranties/${warranty._id}`} className="hover:text-indigo-600 hover:underline focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-sm">
                          {warranty.productName}
                        </Link>
                      </h3>
                      <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold border ${status.color} whitespace-nowrap flex-shrink-0`}> {/* Added flex-shrink-0 */}
                        {status.text}
                      </span>
                    </div>

                    {/* Middle section: Expiry Date and Category */}
                    <div className="text-sm text-slate-600 mb-4">
                      <p>
                        <span className="font-medium text-slate-700">Expires:</span> {format(parseISO(warranty.expirationDate), "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-slate-500 mt-1"> {/* Increased top margin for Category */}
                        Category: {warranty.category}
                      </p>
                    </div>

                    {/* Spacer to push actions to bottom if content is short */}
                    <div className="flex-grow"></div>
                  </div>

                  {/* Footer with actions */}
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center"> {/* Increased padding */}
                    <button
                      onClick={() => handleOpenDetailModal(warranty)}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={(e) => handleActionClick(e, () => confirmDelete(warranty._id))}
                      className="text-rose-500 hover:text-rose-600 transition-colors p-1.5 rounded-md hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-500"
                      title="Delete Warranty"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

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
    </div>
  );
};

export default Warranties;
