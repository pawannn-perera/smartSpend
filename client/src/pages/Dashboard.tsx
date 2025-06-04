import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  DollarSign,
  Receipt,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

interface ExpenseSummary {
  _id: string;
  total: number;
}

interface BillInterface {
  _id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
}

interface WarrantyInterface {
  _id: string;
  productName: string;
  expirationDate: string;
  category: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [upcomingBills, setUpcomingBills] = useState<BillInterface[]>([]);
  const [expiringWarranties, setExpiringWarranties] = useState<
    WarrantyInterface[]
  >([]);
  const [categoryData, setCategoryData] = useState<ExpenseSummary[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const monthlyRes = await axios.get(
          "/api/expenses/summary/monthly"
        );
        setMonthlyData(monthlyRes.data);
        const currentYearTotal = monthlyRes.data.reduce(
          (sum: number, month: any) => sum + month.total,
          0
        );
        setTotalExpenses(currentYearTotal);

        const categoryRes = await axios.get(
          "/api/expenses/summary/category"
        );
        setCategoryData(categoryRes.data);

        const billsRes = await axios.get("/api/bills/upcoming/reminders");
        setUpcomingBills(billsRes.data);

        const warrantiesRes = await axios.get(
          "/api/warranties/expiring/soon"
        );
        setExpiringWarranties(warrantiesRes.data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const categoryChartData = {
    labels: categoryData.map((cat) => cat._id),
    datasets: [
      {
        data: categoryData.map((cat) => cat.total),
        backgroundColor: [
          "#2563EB",
          "#059669",
          "#F97316",
          "#7C3AED",
          "#DB2777",
          "#4F46E5",
          "#0D9488",
          "#DC2626",
        ],
        borderColor: ["#F9FAFB"],
        borderWidth: 2,
      },
    ],
  };

  const monthlyChartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Monthly Expenses",
        data: monthlyData.map((month) => month.total),
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        pointBackgroundColor: "#3B82F6",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-slate-800">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-lg text-slate-600 mt-2">
            Here's your financial snapshot. Let's make today productive.
          </p>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <DollarSign className="w-6 h-6 text-indigo-500" />,
              title: "Total Expenses (This Year)",
              value: `Rs.${totalExpenses.toFixed(2)}`,
              link: "/expenses",
              bgColor: "bg-indigo-100",
              textColor: "text-indigo-700",
              borderColor: "border-indigo-300",
            },
            {
              icon: <Receipt className="w-6 h-6 text-amber-500" />,
              title: "Upcoming Bills",
              value: upcomingBills.length,
              link: "/bills",
              bgColor: "bg-amber-100",
              textColor: "text-amber-700",
              borderColor: "border-amber-300",
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
              title: "Warranties Expiring Soon",
              value: expiringWarranties.length,
              link: "/warranties",
              bgColor: "bg-emerald-100",
              textColor: "text-emerald-700",
              borderColor: "border-emerald-300",
            },
          ].map((item, idx) => (
            <Link
              to={item.link}
              key={idx}
              className={`group p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out ${item.bgColor} border ${item.borderColor} flex flex-col justify-between`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className={`text-sm font-semibold ${item.textColor} uppercase tracking-wider`}>
                    {item.title}
                  </h3>
                  <p className="text-3xl font-bold text-slate-800">
                    {item.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-white shadow-md`}>
                  {item.icon}
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm ${item.textColor} font-medium group-hover:underline flex items-center`}>
                  View Details
                  <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </div>
            </Link>
          ))}
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Monthly Expenses Chart */}
          <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-700 mb-6">
              Monthly Expenses
            </h3>
            <div className="h-80"> {/* Increased height for better visibility */}
              <Line
                data={monthlyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "#e2e8f0" }, // slate-200
                      ticks: {
                        callback: (value) => `Rs.${value}`,
                        font: { size: 12, family: "Inter, sans-serif" }, // Modern font
                        color: "#64748b", // slate-500
                      },
                    },
                    x: {
                      grid: { display: false },
                      ticks: {
                        font: { size: 12, family: "Inter, sans-serif" },
                        color: "#64748b", // slate-500
                      },
                    },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: "#0f172a", // slate-900
                      titleFont: { size: 13, family: "Inter, sans-serif", weight: "bold" },
                      bodyFont: { size: 12, family: "Inter, sans-serif" },
                      padding: 10,
                      cornerRadius: 8,
                      boxPadding: 4,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Expenses by Category Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-700 mb-6">
              Expenses by Category
            </h3>
            <div className="h-80 flex items-center justify-center"> {/* Increased height */}
              {categoryData.length ? (
                <Doughnut
                  data={categoryChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom", // Changed position for better fit
                        labels: {
                          font: { size: 12, family: "Inter, sans-serif" },
                          color: "#475569", // slate-600
                          boxWidth: 12,
                          padding: 20,
                        },
                      },
                      tooltip: {
                        backgroundColor: "#0f172a", // slate-900
                        titleFont: { size: 13, family: "Inter, sans-serif", weight: "bold" },
                        bodyFont: { size: 12, family: "Inter, sans-serif" },
                        padding: 10,
                        cornerRadius: 8,
                        boxPadding: 4,
                      },
                    },
                  }}
                />
              ) : (
                <p className="text-slate-500 text-center">
                  No category data available to display.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Tips & Suggestions Section */}
        <section className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">
            Smart Savings Tips
          </h3>
          <ul className="space-y-3 text-slate-600">
            {[
              "Set clear monthly spending limits and stick to them.",
              "Utilize category tracking to identify potential areas for savings.",
              "Automate your bill payments to avoid late fees and stay organized.",
              "Regularly review your warranties before they expire to make claims if needed.",
              "Aim to save at least 20% of your income for future goals and emergencies.",
              "Compare prices before making significant purchases."
            ].map((tip, index) => (
              <li key={index} className="flex items-start">
                <svg className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
