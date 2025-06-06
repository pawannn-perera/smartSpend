import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import {
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowDownAZ,
  ArrowUpZA,
  Receipt, // Added for empty state
} from "lucide-react";
import { format, parseISO, isPast, addDays } from "date-fns";
import ConfirmModal from "../components/ConfirmModal";
import BillInterface from "../types/BillInterface";
import BillModal from "../components/BillModal";
import BillFormData from "../types/BillFormData";

const Bills: React.FC = () => {
  const [bills, setBills] = useState<BillInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editBillData, setEditBillData] = useState<BillInterface | null>(null);

  const [sortBy, setSortBy] = useState<"dueDate" | "amount" | "status">("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response: AxiosResponse<{ bills: BillInterface[] }> = await axios.get("/api/bills");
      const data = Array.isArray(response.data.bills)
        ? response.data.bills
        : response.data.bills || [];
      setBills(data.map((bill: BillInterface) => ({ ...bill, isPaid: bill.isPaid ?? false })));
      setError("");
    } catch (err) {
      setError("Failed to fetch bills");
      console.error("Error fetching bills:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmModal.id) return;
    try {
      await axios.delete(`/api/bills/${confirmModal.id}`);
      setBills((prev) => prev.filter((bill) => bill._id !== confirmModal.id));
      setError("");
    } catch (err) {
      setError("Failed to delete bill");
      console.error("Error deleting bill:", err);
    } finally {
      setConfirmModal({ open: false, id: null });
    }
  };

  const handleTogglePaid = async (id: string, currentStatus: boolean) => {
    try {
      setTogglingId(id);
      let response: AxiosResponse<BillInterface>;
      if (!currentStatus) {
        response = await axios.put(`/api/bills/${id}/pay`);
        await fetchBills();
      } else {
        response = await axios.put(`/api/bills/${id}`, { isPaid: false });
        setBills((prevBills) =>
          prevBills.map((bill) =>
            bill._id === id ? { ...bill, isPaid: response.data.isPaid } : bill
          )
        );
      }
      setError("");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to update bill status";
      setError(errorMessage);
      console.error("Error updating bill status:", err);
      setTimeout(() => setError(""), 5000);
    } finally {
      setTogglingId(null);
    }
  };

  const getBillStatus = (dueDate: string, isPaid: boolean) => {
    if (isPaid) {
      return {
        text: "Paid",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="w-4 h-4 mr-1.5" />,
      };
    }
    try {
      const parsedDate = parseISO(dueDate);
      if (isNaN(parsedDate.getTime())) throw new Error("Invalid date");
      if (isPast(parsedDate)) {
        return {
          text: "Overdue",
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <XCircle className="w-4 h-4 mr-1.5" />,
        };
        }
      if (isPast(addDays(parsedDate, -3))) {
        return {
          text: "Due Soon",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <Clock className="w-4 h-4 mr-1.5" />,
        };
      }
      return {
        text: "Upcoming",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Clock className="w-4 h-4 mr-1.5" />,
      };
    } catch (err) {
      console.error("Invalid dueDate:", dueDate);
      return {
        text: "Invalid Date",
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <AlertCircle className="w-4 h-4 mr-1.5" />,
      };
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  const sortedBills = [...bills].sort((a, b) => {
    let valueA: number;
    let valueB: number;

    switch (sortBy) {
      case "dueDate":
        valueA = new Date(a.dueDate).getTime();
        valueB = new Date(b.dueDate).getTime();
        break;
      case "amount":
        valueA = a.amount;
        valueB = b.amount;
        break;
      case "status":
        valueA = a.isPaid ? 1 : 0;
        valueB = b.isPaid ? 1 : 0;
        break;
      default:
        valueA = 0;
        valueB = 0;
    }

    if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
    if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
    return 0;
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
      <header className="flex flex-col sm:flex-row md:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Your Bills</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="sortByBills" className="text-sm text-slate-600 font-medium sr-only sm:not-sr-only">Sort by:</label>
            <select
              id="sortByBills"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "dueDate" | "amount" | "status")}
              className="form-select block w-full sm:w-auto px-3 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            >
              <option value="dueDate">Due Date</option>
              <option value="amount">Amount</option>
              <option value="status">Status</option>
            </select>
          </div>
          <button
            onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
            className="flex items-center px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white hover:bg-slate-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            title="Toggle sort order"
          >
            {sortOrder === "asc" ? (
              <ArrowDownAZ className="w-4 h-4 mr-2 text-slate-500" />
            ) : (
              <ArrowUpZA className="w-4 h-4 mr-2 text-slate-500" />
            )}
            {sortOrder === "asc" ? "Asc" : "Desc"}
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm font-medium"
          >
            <Plus className="mr-2 w-5 h-5" />
            Add Bill
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

      {sortedBills.length === 0 && !loading && !error ? (
        <div className="text-center text-slate-500 py-10 bg-white rounded-lg shadow-md border border-slate-200">
          <Receipt className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No Bills Yet</h3>
          <p className="text-sm">Looks like you haven't added any bills. Get started by clicking the "Add Bill" button.</p>
        </div>
      ) : (
       !loading && !error && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bill Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {sortedBills.map((bill) => {
                const status = getBillStatus(bill.dueDate, bill.isPaid);
                return (
                  <tr key={bill._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      <button
                        onClick={() => setEditBillData(bill)}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        {bill.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{bill.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{format(parseISO(bill.dueDate), "MMM d, yyyy")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 text-right">
                      Rs.{bill.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-semibold border ${status.color}`}>
                        {status.icon}
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={(e) => handleActionClick(e, () => handleTogglePaid(bill._id, bill.isPaid))}
                        className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                          bill.isPaid
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 focus:ring-slate-400"
                            : "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500"
                        } ${togglingId === bill._id ? "opacity-60 cursor-not-allowed" : ""}`}
                        disabled={togglingId === bill._id}
                        title={bill.isPaid ? "Mark as Unpaid" : "Mark as Paid"}
                      >
                        {togglingId === bill._id ? "..." : bill.isPaid ? "Unpaid" : "Paid"}
                      </button>
                      <button
                        onClick={(e) => handleActionClick(e, () => setConfirmModal({ open: true, id: bill._id }))}
                        className="text-rose-600 hover:text-rose-700 transition-colors p-1.5 rounded-md hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-500"
                        title="Delete Bill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
       )
      )}

      <ConfirmModal
        isOpen={confirmModal.open}
        onCancel={() => setConfirmModal({ open: false, id: null })}
        onConfirm={handleDeleteConfirmed}
        message="This action cannot be undone. Do you really want to delete this bill?"
      />
      {(isAddModalOpen || editBillData) && (
        <BillModal
          isOpen={isAddModalOpen || !!editBillData}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditBillData(null);
          }}
          onSubmit={handleSubmit}
          initialData={editBillData ? {
            name: editBillData.name,
            amount: editBillData.amount,
            dueDate: editBillData.dueDate,
            category: editBillData.category,
            isPaid: editBillData.isPaid,
          } : undefined}
        />
      )}
    </div>
  );

  async function handleSubmit(data: BillFormData) {
    try {
      setLoading(true);
      if (editBillData) {
        await axios.put(`/api/bills/${editBillData._id}`, data);
      } else {
        await axios.post("/api/bills", data);
      }
      await fetchBills();
    } catch (err) {
      console.error("Error submitting bill:", err);
      setError("Failed to submit bill");
    } finally {
      setLoading(false);
      setIsAddModalOpen(false);
      setEditBillData(null);
    }
  }
};

export default Bills;
