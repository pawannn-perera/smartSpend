import React, { useState, useEffect } from "react";
import axios from "axios";
import ExpenseInterface from "../types/ExpenseInterface";
import ExpenseModal from "../components/ExpenseModal";
import ExpenseFormData from "../types/ExpenseFormData";
import {
  Plus,
  Trash2,
  AlertCircle,
  ArrowDownUp,
  DollarSign,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import ConfirmModal from "../components/ConfirmModal";

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editExpenseData, setEditExpenseData] =
    useState<ExpenseInterface | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/expenses");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.expenses;
      setExpenses(data || []);
      setError("");
    } catch (err) {
      setError("Failed to fetch expenses");
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (id: string) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await axios.delete(`/api/expenses/${selectedId}`);
      setExpenses((prev) =>
        prev.filter((expense) => expense._id !== selectedId)
      );
      setIsModalOpen(false);
      setSelectedId(null);
    } catch (err) {
      setError("Failed to delete expense");
      console.error("Error deleting expense:", err);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  const sortedExpenses = [...expenses].sort((a, b) => {
    let compareValue = 0;
    if (sortBy === "date") {
      compareValue =
        new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === "amount") {
      compareValue = a.amount - b.amount;
    }
    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  const handleSubmit = async (data: ExpenseFormData) => {
    try {
      setLoading(true);
      if (editExpenseData) {
        await axios.put(`/api/expenses/${editExpenseData._id}`, data);
      } else {
        await axios.post("/api/expenses", data);
      }
      await fetchExpenses();
    } catch (err) {
      console.error("Error submitting expense:", err);
      setError("Failed to submit expense");
    } finally {
      setLoading(false);
      setIsAddModalOpen(false);
      setEditExpenseData(null);
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
          Your Expenses
        </h1>
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "date" | "amount")
            }
            className="form-select block w-full sm:w-auto px-3 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>
          <button
            onClick={() =>
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            className="flex items-center px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white hover:bg-slate-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
            title="Toggle sort order"
          >
            <ArrowDownUp className="w-4 h-4 mr-2 text-slate-500" />
            {sortOrder === "asc" ? "Ascending" : "Descending"}
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm font-medium"
          >
            <Plus className="mr-2 w-5 h-5" />
            Add Expense
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

      {sortedExpenses.length === 0 && !loading && !error ? (
        <div className="text-center text-slate-500 py-10 bg-white rounded-lg shadow-md border border-slate-200">
          <DollarSign className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">
            No Expenses Yet
          </h3>
          <p className="text-sm">
            Looks like you haven't added any expenses. Get started by
            clicking the "Add Expense" button.
          </p>
        </div>
      ) : (
        !loading &&
        !error && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {sortedExpenses.map((expense) => (
                  <tr
                    key={expense._id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      <button
                        onClick={() => setEditExpenseData(expense)}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        {expense.description}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {expense.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {format(parseISO(expense.date), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800 text-right">
                      Rs.{expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) =>
                          handleActionClick(e, () =>
                            openConfirmModal(expense._id)
                          )
                        }
                        className="text-rose-600 hover:text-rose-700 transition-colors p-1 rounded-md hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-500"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        onConfirm={handleDelete}
        onCancel={() => setIsModalOpen(false)}
        title="Delete Expense?"
        message="Are you sure you want to delete this expense?"
      />
      {(isAddModalOpen || editExpenseData) && (
        <ExpenseModal
          isOpen={isAddModalOpen || !!editExpenseData}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditExpenseData(null);
          }}
          onSubmit={handleSubmit}
          initialData={
            editExpenseData
              ? {
                  name: editExpenseData.description,
                  amount: editExpenseData.amount,
                  date: editExpenseData.date,
                  category: editExpenseData.category,
                  notes: editExpenseData.notes,
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default Expenses;
