import { useEffect, useMemo, useState } from "react";

import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  PieChart,
  Settings,
  Bell,
  Search,
  Plus,
  ChevronDown,
  Utensils,
  Fuel,
  ShoppingBag,
  MoreHorizontal,
  LogOut,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  X,
  Filter,
  CalendarDays,
  Menu,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./App.css";

import {
  loginUser,
  getCurrentUser,
} from "./services/authService";

import {
  getExpenses,
  deleteExpense,
} from "./services/expenseService";

import AddExpenseModal from "./components/AddExpenseModal";
import EditExpenseModal from "./components/EditExpenseModal";


/* =========================================================
   CONSTANTS
========================================================= */

const MONTHLY_BUDGET = 16000;

const categories = [
  "Food & Dining",
  "Groceries",
  "Fuel",
  "Transportation",
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Healthcare",
  "Education",
  "Travel",
  "Subscriptions",
  "Other",
];

const fallbackChartData = [
  { day: "Mon", amount: 420 },
  { day: "Tue", amount: 680 },
  { day: "Wed", amount: 520 },
  { day: "Thu", amount: 920 },
  { day: "Fri", amount: 760 },
  { day: "Sat", amount: 1180 },
  { day: "Sun", amount: 850 },
];

const fallbackTransactions = [
  {
    icon: Utensils,
    title: "Zomato Dinner",
    category: "Food & Dining",
    date: "Today, 8:42 PM",
    amount: "₹850",
  },
  {
    icon: Fuel,
    title: "Indian Oil",
    category: "Fuel",
    date: "Yesterday, 6:15 PM",
    amount: "₹2,000",
  },
  {
    icon: ShoppingBag,
    title: "Amazon Purchase",
    category: "Shopping",
    date: "29 Aug, 11:32 AM",
    amount: "₹1,299",
  },
];


/* =========================================================
   HELPERS
========================================================= */

const getCategoryIcon = (category) => {
  if (category === "Food & Dining") {
    return Utensils;
  }

  if (category === "Fuel") {
    return Fuel;
  }

  return ShoppingBag;
};

const getCategoryClass = (category) => {
  if (category === "Food & Dining") {
    return "food";
  }

  if (category === "Fuel") {
    return "fuel";
  }

  if (category === "Shopping") {
    return "shopping";
  }

  return "food";
};

const getCategoryColor = (category) => {
  if (category === "Food & Dining") {
    return "#f59e0b";
  }

  if (category === "Fuel") {
    return "#60a5fa";
  }

  if (category === "Shopping") {
    return "#a78bfa";
  }

  if (category === "Transportation") {
    return "#34d399";
  }

  if (category === "Groceries") {
    return "#22c55e";
  }

  if (category === "Bills & Utilities") {
    return "#f97316";
  }

  if (category === "Entertainment") {
    return "#ec4899";
  }

  if (category === "Healthcare") {
    return "#ef4444";
  }

  if (category === "Education") {
    return "#38bdf8";
  }

  if (category === "Travel") {
    return "#14b8a6";
  }

  if (category === "Subscriptions") {
    return "#8b5cf6";
  }

  return "#94a3b8";
};

const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const startOfDay = (date) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
};

const endOfDay = (date) => {
  const result = new Date(date);

  result.setHours(23, 59, 59, 999);

  return result;
};

const startOfWeek = (date) => {
  const result = startOfDay(date);

  const day = result.getDay();

  const difference = day === 0 ? 6 : day - 1;

  result.setDate(result.getDate() - difference);

  return result;
};

const endOfWeek = (date) => {
  const result = startOfWeek(date);

  result.setDate(result.getDate() + 6);

  return endOfDay(result);
};

const startOfMonth = (date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
    0,
    0,
    0,
    0
  );
};

const endOfMonth = (date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
};

const formatDateForInput = (date) => {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


/* =========================================================
   APP
========================================================= */

function App() {
  const [user, setUser] = useState(null);

  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [expensesLoading, setExpensesLoading] =
    useState(false);

  const [loginLoading, setLoginLoading] =
    useState(false);

  const [loginError, setLoginError] = useState("");

  const [error, setError] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showAddExpense, setShowAddExpense] =
    useState(false);

  const [editingExpense, setEditingExpense] =
    useState(null);

  const [deletingExpense, setDeletingExpense] =
    useState(null);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  /* SEARCH / FILTERS */

  const [searchTerm, setSearchTerm] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [dateFilter, setDateFilter] =
    useState("all");

  const [customStartDate, setCustomStartDate] =
    useState("");

  const [customEndDate, setCustomEndDate] =
    useState("");

  const [chartPeriod, setChartPeriod] =
    useState("This week");

  const [openTransactionMenu, setOpenTransactionMenu] =
    useState(null);

  /* NAVIGATION */

  const [activePage, setActivePage] =
    useState("overview");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const handleNavigation = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    setOpenTransactionMenu(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  /* =========================================================
     AUTHENTICATION
  ========================================================= */

  useEffect(() => {
    const checkAuthentication = async () => {
      const token =
        localStorage.getItem("spendvault_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser();

        setUser(data.user);
      } catch (err) {
        console.error(
          "Authentication failed:",
          err
        );

        localStorage.removeItem(
          "spendvault_token"
        );

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);


  /* =========================================================
     FETCH EXPENSES
  ========================================================= */

  useEffect(() => {
    if (!user) return;

    const fetchExpenses = async () => {
      try {
        setExpensesLoading(true);

        setError("");

        const data = await getExpenses();

        setExpenses(data.expenses || []);
      } catch (err) {
        console.error(
          "Failed to fetch expenses:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load your expenses."
        );
      } finally {
        setExpensesLoading(false);
      }
    };

    fetchExpenses();
  }, [user]);


  /* =========================================================
     LOGIN
  ========================================================= */

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoginError("");

    if (
      !email.trim() ||
      !password.trim()
    ) {
      setLoginError(
        "Please enter your email and password."
      );

      return;
    }

    try {
      setLoginLoading(true);

      const data = await loginUser(
        email.trim(),
        password
      );

      if (!data.token) {
        throw new Error(
          "Login token was not returned."
        );
      }

      localStorage.setItem(
        "spendvault_token",
        data.token
      );

      const userData =
        await getCurrentUser();

      setUser(userData.user);

      setEmail("");

      setPassword("");
    } catch (err) {
      console.error(
        "Login failed:",
        err
      );

      setLoginError(
        err.response?.data?.message ||
          err.message ||
          "Invalid email or password."
      );
    } finally {
      setLoginLoading(false);
    }
  };


  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem(
      "spendvault_token"
    );

    setUser(null);

    setExpenses([]);

    setError("");

    setSearchTerm("");

    setCategoryFilter("All");

    setDateFilter("all");
  };


  /* =========================================================
     DATE FILTER
  ========================================================= */

  const isExpenseInDateFilter = (
    expenseDate
  ) => {
    const date = new Date(expenseDate);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const today = new Date();

    if (dateFilter === "all") {
      return true;
    }

    if (dateFilter === "today") {
      return isSameDay(date, today);
    }

    if (dateFilter === "this-week") {
      return (
        date >= startOfWeek(today) &&
        date <= endOfWeek(today)
      );
    }

    if (dateFilter === "this-month") {
      return (
        date >= startOfMonth(today) &&
        date <= endOfMonth(today)
      );
    }

    if (dateFilter === "last-month") {
      const lastMonthStart =
        new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );

      const lastMonthEnd =
        new Date(
          today.getFullYear(),
          today.getMonth(),
          0,
          23,
          59,
          59,
          999
        );

      return (
        date >= lastMonthStart &&
        date <= lastMonthEnd
      );
    }

    if (
      dateFilter === "custom"
    ) {
      let matchesStart = true;
      let matchesEnd = true;

      if (customStartDate) {
        const start =
          new Date(
            `${customStartDate}T00:00:00`
          );

        matchesStart = date >= start;
      }

      if (customEndDate) {
        const end =
          new Date(
            `${customEndDate}T23:59:59`
          );

        matchesEnd = date <= end;
      }

      return (
        matchesStart &&
        matchesEnd
      );
    }

    return true;
  };


  /* =========================================================
     FILTERED TRANSACTIONS
  ========================================================= */

  const filteredExpenses = useMemo(() => {
    const search =
      searchTerm
        .trim()
        .toLowerCase();

    return expenses.filter(
      (expense) => {
        const matchesSearch =
          !search ||
          expense.title
            ?.toLowerCase()
            .includes(search) ||
          expense.category
            ?.toLowerCase()
            .includes(search) ||
          expense.paymentMethod
            ?.toLowerCase()
            .includes(search) ||
          expense.description
            ?.toLowerCase()
            .includes(search);

        const matchesCategory =
          categoryFilter === "All" ||
          expense.category ===
            categoryFilter;

        const matchesDate =
          isExpenseInDateFilter(
            expense.date
          );

        return (
          matchesSearch &&
          matchesCategory &&
          matchesDate
        );
      }
    );
  }, [
    expenses,
    searchTerm,
    categoryFilter,
    dateFilter,
    customStartDate,
    customEndDate,
  ]);


  /* =========================================================
     TOTAL SPENDING
  ========================================================= */

  const totalSpent = useMemo(() => {
    return expenses.reduce(
      (total, expense) =>
        total +
        Number(expense.amount || 0),
      0
    );
  }, [expenses]);


  /* =========================================================
     THIS MONTH SPENDING
  ========================================================= */

  const thisMonthExpenses = useMemo(() => {
    const now = new Date();

    const start =
      startOfMonth(now);

    const end =
      endOfMonth(now);

    return expenses.filter(
      (expense) => {
        const date =
          new Date(expense.date);

        return (
          !Number.isNaN(
            date.getTime()
          ) &&
          date >= start &&
          date <= end
        );
      }
    );
  }, [expenses]);


  const thisMonthSpent = useMemo(() => {
    return thisMonthExpenses.reduce(
      (total, expense) =>
        total +
        Number(expense.amount || 0),
      0
    );
  }, [thisMonthExpenses]);


  /* =========================================================
     AVERAGE EXPENSE
  ========================================================= */

  const averageExpense = useMemo(() => {
    if (expenses.length === 0) {
      return 0;
    }

    return (
      totalSpent /
      expenses.length
    );
  }, [
    expenses,
    totalSpent,
  ]);


  /* =========================================================
     BUDGET
  ========================================================= */

  const budgetRemaining =
    Math.max(
      MONTHLY_BUDGET -
        thisMonthSpent,
      0
    );

  const budgetUsedPercentage =
    MONTHLY_BUDGET > 0
      ? Math.min(
          (
            thisMonthSpent /
              MONTHLY_BUDGET
          ) *
            100,
          100
        )
      : 0;


  /* =========================================================
     CATEGORY BREAKDOWN
  ========================================================= */

  const categoryData = useMemo(() => {
    const categoriesMap = {};

    thisMonthExpenses.forEach(
      (expense) => {
        const category =
          expense.category ||
          "Other";

        if (
          !categoriesMap[category]
        ) {
          categoriesMap[category] = 0;
        }

        categoriesMap[category] +=
          Number(
            expense.amount || 0
          );
      }
    );

    return Object.entries(
      categoriesMap
    )
      .map(
        ([
          category,
          amount,
        ]) => ({
          category,
          amount,
          percentage:
            thisMonthSpent > 0
              ? (
                  (amount /
                    thisMonthSpent) *
                  100
                ).toFixed(1)
              : "0.0",
        })
      )
      .sort(
        (a, b) =>
          b.amount -
          a.amount
      );
  }, [
    thisMonthExpenses,
    thisMonthSpent,
  ]);


  /* =========================================================
     CHART DATA
  ========================================================= */

  const realChartData = useMemo(() => {
    if (expenses.length === 0) {
      return fallbackChartData;
    }

    const now = new Date();

    let startDate;
    let endDate;

    if (
      chartPeriod ===
      "This week"
    ) {
      startDate =
        startOfWeek(now);

      endDate =
        endOfWeek(now);
    } else if (
      chartPeriod ===
      "This month"
    ) {
      startDate =
        startOfMonth(now);

      endDate =
        endOfMonth(now);
    } else {
      startDate =
        new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );

      endDate =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59,
          999
        );
    }

    const filteredChartExpenses =
      expenses.filter(
        (expense) => {
          const date =
            new Date(
              expense.date
            );

          return (
            !Number.isNaN(
              date.getTime()
            ) &&
            date >= startDate &&
            date <= endDate
          );
        }
      );

    if (
      chartPeriod ===
      "This week"
    ) {
      const grouped = {
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
        Sat: 0,
        Sun: 0,
      };

      const days = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
      ];

      filteredChartExpenses.forEach(
        (expense) => {
          const date =
            new Date(
              expense.date
            );

          const day =
            days[date.getDay()];

          grouped[day] +=
            Number(
              expense.amount || 0
            );
        }
      );

      return [
        {
          day: "Mon",
          amount: grouped.Mon,
        },
        {
          day: "Tue",
          amount: grouped.Tue,
        },
        {
          day: "Wed",
          amount: grouped.Wed,
        },
        {
          day: "Thu",
          amount: grouped.Thu,
        },
        {
          day: "Fri",
          amount: grouped.Fri,
        },
        {
          day: "Sat",
          amount: grouped.Sat,
        },
        {
          day: "Sun",
          amount: grouped.Sun,
        },
      ];
    }

    const groupedByDay = {};

    filteredChartExpenses.forEach(
      (expense) => {
        const date =
          new Date(
            expense.date
          );

        const key =
          date.getDate();

        if (
          !groupedByDay[key]
        ) {
          groupedByDay[key] = 0;
        }

        groupedByDay[key] +=
          Number(
            expense.amount || 0
          );
      }
    );

    const daysInMonth =
      endDate.getDate();

    return Array.from(
      {
        length:
          daysInMonth,
      },
      (_, index) => {
        const day =
          index + 1;

        return {
          day: String(day),
          amount:
            groupedByDay[day] ||
            0,
        };
      }
    );
  }, [
    expenses,
    chartPeriod,
  ]);


  /* =========================================================
     RECENT / FILTERED TRANSACTIONS
  ========================================================= */

  const recentTransactions =
    useMemo(() => {
      return filteredExpenses
        .slice(0, 5)
        .map(
          (expense) => ({
            ...expense,
            icon:
              getCategoryIcon(
                expense.category
              ),
          })
        );
    }, [
      filteredExpenses,
    ]);


  /* =========================================================
     DATE FORMATTER
  ========================================================= */

  const formatDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return "No date";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "No date";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  /* =========================================================
     DELETE EXPENSE
  ========================================================= */

  const handleDeleteExpense =
    async () => {
      if (!deletingExpense) {
        return;
      }

      try {
        setDeleteLoading(true);

        await deleteExpense(
          deletingExpense._id
        );

        setExpenses(
          (previous) =>
            previous.filter(
              (expense) =>
                expense._id !==
                deletingExpense._id
            )
        );

        setDeletingExpense(null);

        setOpenTransactionMenu(
          null
        );
      } catch (err) {
        console.error(
          "Delete expense error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Something went wrong while deleting the expense."
        );
      } finally {
        setDeleteLoading(false);
      }
    };


  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {
    setSearchTerm("");

    setCategoryFilter("All");

    setDateFilter("all");

    setCustomStartDate("");

    setCustomEndDate("");
  };


  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    categoryFilter !== "All" ||
    dateFilter !== "all";


  /* =========================================================
     SECONDARY PAGES
  ========================================================= */

  const renderSecondaryPage = () => {
    const pageConfig = {
      transactions: { eyebrow: "ALL ACTIVITY", title: "Transactions", subtitle: "Search, review and manage every expense.", icon: Receipt },
      analytics: { eyebrow: "INSIGHTS", title: "Analytics", subtitle: "Understand where your money goes.", icon: PieChart },
      budgets: { eyebrow: "MANAGE", title: "Budgets", subtitle: "Keep your spending within plan.", icon: Wallet },
      settings: { eyebrow: "ACCOUNT", title: "Settings", subtitle: "Manage your SpendVault account.", icon: Settings },
    }[activePage];

    if (!pageConfig) return null;
    const PageIcon = pageConfig.icon;

    if (activePage === "transactions") {
      return (
        <section className="dashboard page-dashboard">
          <div className="welcome-row">
            <div><p className="eyebrow">{pageConfig.eyebrow}</p><h1>{pageConfig.title}</h1><p className="subtitle">{pageConfig.subtitle}</p></div>
            <button className="add-button" onClick={() => setShowAddExpense(true)}><Plus size={18} /> Add expense</button>
          </div>
          <section className="panel transactions-panel full-page-panel">
            <div className="panel-header"><div><p className="panel-kicker">TRANSACTIONS</p><h3>{filteredExpenses.length} transaction{filteredExpenses.length === 1 ? "" : "s"}</h3></div><PageIcon size={20} /></div>
            <div className="transactions-list">
              {filteredExpenses.length > 0 ? filteredExpenses.map((transaction) => {
                const Icon = getCategoryIcon(transaction.category);
                return (
                  <div className="transaction" key={transaction._id}>
                    <div className={`transaction-icon ${getCategoryClass(transaction.category)}`}><Icon size={19} /></div>
                    <div className="transaction-main"><strong>{transaction.title}</strong><span>{transaction.category} • {new Date(transaction.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></div>
                    <div className="transaction-amount">- ₹{Number(transaction.amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                    <button className="more-button" onClick={() => setEditingExpense(transaction)} title="Edit expense"><Pencil size={17} /></button>
                  </div>
                );
              }) : <div className="page-empty-state">No transactions found.</div>}
            </div>
          </section>
        </section>
      );
    }

    if (activePage === "analytics") {
      return (
        <section className="dashboard page-dashboard">
          <div className="welcome-row"><div><p className="eyebrow">{pageConfig.eyebrow}</p><h1>{pageConfig.title}</h1><p className="subtitle">{pageConfig.subtitle}</p></div><div className="page-icon-card"><PageIcon size={21} /></div></div>
          <div className="content-grid">
            <section className="panel chart-panel"><div className="panel-header"><div><p className="panel-kicker">SPENDING ACTIVITY</p><h3>Spending trend</h3></div></div><div className="chart-wrap analytics-chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={realChartData}><defs><linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopOpacity={0.25} /><stop offset="100%" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="day" axisLine={false} tickLine={false} /><YAxis hide /><Tooltip formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Spent"]} /><Area type="monotone" dataKey="amount" strokeWidth={2.5} fill="url(#analyticsGradient)" /></AreaChart></ResponsiveContainer></div></section>
            <section className="panel category-panel"><div className="panel-header"><div><p className="panel-kicker">BREAKDOWN</p><h3>Top categories</h3></div></div><div className="category-bars">{categoryData.length ? categoryData.slice(0, 6).map((item) => (<div className="category-row" key={item.category}><div className="category-info"><span className={`category-dot ${getCategoryClass(item.category)}`} style={{ background: getCategoryColor(item.category) }} /><span>{item.category}</span><strong>{item.percentage}%</strong></div><div className="bar"><span style={{ width: `${item.percentage}%` }} /></div><p>₹{item.amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p></div>)) : <div className="page-empty-state">No spending data yet.</div>}</div></section>
          </div>
        </section>
      );
    }

    if (activePage === "budgets") {
      return (
        <section className="dashboard page-dashboard"><div className="welcome-row"><div><p className="eyebrow">{pageConfig.eyebrow}</p><h1>{pageConfig.title}</h1><p className="subtitle">{pageConfig.subtitle}</p></div><div className="page-icon-card"><PageIcon size={21} /></div></div><section className="panel budget-page-card"><div className="budget-page-top"><div><p className="panel-kicker">MONTHLY BUDGET</p><h2>₹{MONTHLY_BUDGET.toLocaleString("en-IN")}</h2><span>This month's spending limit</span></div><div className="budget-page-number">{budgetUsedPercentage.toFixed(0)}%</div></div><div className="budget-progress"><span style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }} /></div><div className="budget-page-stats"><div><span>Spent</span><strong>₹{thisMonthSpent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong></div><div><span>Remaining</span><strong>₹{Math.max(budgetRemaining, 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong></div></div></section></section>
      );
    }

    return (
      <section className="dashboard page-dashboard"><div className="welcome-row"><div><p className="eyebrow">{pageConfig.eyebrow}</p><h1>{pageConfig.title}</h1><p className="subtitle">{pageConfig.subtitle}</p></div><div className="page-icon-card"><PageIcon size={21} /></div></div><section className="panel settings-page-card"><div className="settings-profile"><div className="settings-avatar">{user?.name?.charAt(0)?.toUpperCase() || "P"}</div><div><h3>{user?.name || "Pooj"}</h3><p>{user?.email || ""}</p></div></div><div className="settings-row"><div><strong>Account</strong><span>Your SpendVault personal account</span></div><Mail size={18} /></div><button className="settings-logout" onClick={handleLogout}><LogOut size={17} /> Log out</button></section></section>
    );
  };


  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08090b",
          color: "#fff",
          fontSize: "15px",
        }}
      >
        Loading SpendVault...
      </div>
    );
  }


  /* =========================================================
     LOGIN SCREEN
  ========================================================= */

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at top, #17191e 0%, #08090b 45%, #050506 100%)",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "36px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#f5f5f5",
                color: "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "20px",
              }}
            >
              S
            </div>

            <span
              style={{
                color: "#fff",
                fontSize: "22px",
                fontWeight: "700",
                letterSpacing:
                  "-0.5px",
              }}
            >
              SpendVault
            </span>
          </div>

          <div
            style={{
              background:
                "rgba(18, 19, 22, 0.95)",
              border:
                "1px solid rgba(255,255,255,0.09)",
              borderRadius: "20px",
              padding: "32px",
              boxShadow:
                "0 24px 80px rgba(0,0,0,0.45)",
            }}
          >
            <div
              style={{
                marginBottom: "28px",
              }}
            >
              <p
                style={{
                  color: "#8d96a8",
                  fontSize: "11px",
                  letterSpacing:
                    "1.5px",
                  marginBottom: "8px",
                }}
              >
                SECURE ACCESS
              </p>

              <h1
                style={{
                  color: "#fff",
                  fontSize: "28px",
                  margin: 0,
                  letterSpacing:
                    "-0.8px",
                }}
              >
                Welcome back
              </h1>

              <p
                style={{
                  color: "#777f90",
                  fontSize: "14px",
                  marginTop: "9px",
                }}
              >
                Sign in to manage
                your expenses.
              </p>
            </div>

            {loginError && (
              <div
                style={{
                  padding:
                    "12px 14px",
                  borderRadius: "10px",
                  marginBottom:
                    "18px",
                  color: "#ff9b9b",
                  background:
                    "rgba(255,70,70,0.08)",
                  border:
                    "1px solid rgba(255,70,70,0.18)",
                  fontSize: "13px",
                }}
              >
                {loginError}
              </div>
            )}

            <form
              onSubmit={
                handleLogin
              }
            >
              <div
                style={{
                  marginBottom:
                    "18px",
                }}
              >
                <label
                  style={{
                    display:
                      "block",
                    color:
                      "#aab1bf",
                    fontSize:
                      "13px",
                    marginBottom:
                      "8px",
                  }}
                >
                  Email
                </label>

                <div
                  style={{
                    position:
                      "relative",
                  }}
                >
                  <Mail
                    size={17}
                    style={{
                      position:
                        "absolute",
                      left: "14px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      color:
                        "#697180",
                    }}
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target
                          .value
                      )
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    style={{
                      width:
                        "100%",
                      boxSizing:
                        "border-box",
                      background:
                        "#0d0f12",
                      border:
                        "1px solid rgba(255,255,255,0.09)",
                      borderRadius:
                        "10px",
                      padding:
                        "13px 14px 13px 42px",
                      color:
                        "#fff",
                      outline:
                        "none",
                      fontSize:
                        "14px",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  marginBottom:
                    "24px",
                }}
              >
                <label
                  style={{
                    display:
                      "block",
                    color:
                      "#aab1bf",
                    fontSize:
                      "13px",
                    marginBottom:
                      "8px",
                  }}
                >
                  Password
                </label>

                <div
                  style={{
                    position:
                      "relative",
                  }}
                >
                  <Lock
                    size={17}
                    style={{
                      position:
                        "absolute",
                      left: "14px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      color:
                        "#697180",
                    }}
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      password
                    }
                    onChange={(e) =>
                      setPassword(
                        e.target
                          .value
                      )
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{
                      width:
                        "100%",
                      boxSizing:
                        "border-box",
                      background:
                        "#0d0f12",
                      border:
                        "1px solid rgba(255,255,255,0.09)",
                      borderRadius:
                        "10px",
                      padding:
                        "13px 45px 13px 42px",
                      color:
                        "#fff",
                      outline:
                        "none",
                      fontSize:
                        "14px",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    style={{
                      position:
                        "absolute",
                      right: "12px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      border: "none",
                      background:
                        "transparent",
                      color:
                        "#697180",
                      cursor:
                        "pointer",
                      padding:
                        "4px",
                    }}
                  >
                    {showPassword ? (
                      <EyeOff
                        size={17}
                      />
                    ) : (
                      <Eye
                        size={17}
                      />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  loginLoading
                }
                style={{
                  width:
                    "100%",
                  border:
                    "none",
                  borderRadius:
                    "10px",
                  padding:
                    "13px",
                  background:
                    "#f4f4f4",
                  color:
                    "#111",
                  fontWeight:
                    "700",
                  fontSize:
                    "14px",
                  cursor:
                    loginLoading
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    loginLoading
                      ? 0.65
                      : 1,
                }}
              >
                {loginLoading
                  ? "Signing in..."
                  : "Sign in"}
              </button>
            </form>

            <p
              style={{
                textAlign:
                  "center",
                color:
                  "#555d6c",
                fontSize:
                  "12px",
                marginTop:
                  "24px",
                marginBottom:
                  0,
              }}
            >
              Your session is
              secured with JWT
              authentication.
            </p>
          </div>
        </div>
      </div>
    );
  }


  /* =========================================================
     DASHBOARD
  ========================================================= */

  return (
    <div className="app-shell">

      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            S
          </div>

          <span>
            SpendVault
          </span>
        </div>

        <nav>
          <p className="nav-label">
            MAIN
          </p>

          <button className={`nav-item ${activePage === "overview" ? "active" : ""}`} onClick={() => handleNavigation("overview")}><LayoutDashboard size={19} /> Overview</button>
          <button className={`nav-item ${activePage === "transactions" ? "active" : ""}`} onClick={() => handleNavigation("transactions")}><Receipt size={19} /> Transactions</button>
          <button className={`nav-item ${activePage === "analytics" ? "active" : ""}`} onClick={() => handleNavigation("analytics")}><PieChart size={19} /> Analytics</button>
          <p className="nav-label second">MANAGE</p>
          <button className={`nav-item ${activePage === "budgets" ? "active" : ""}`} onClick={() => handleNavigation("budgets")}><Wallet size={19} /> Budgets</button>
          <button className={`nav-item ${activePage === "settings" ? "active" : ""}`} onClick={() => handleNavigation("settings")}><Settings size={19} /> Settings</button>
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <span>
              Spend smarter.
            </span>

            <p>
              Understand where
              your money goes.
            </p>

            <button onClick={() => handleNavigation("analytics")}>
              View insights
            </button>
          </div>
        </div>
      </aside>


      {/* MAIN */}

      <main className="main-content">

        {/* TOPBAR */}

        <header className="topbar">
          <button className="mobile-menu-button" onClick={() => setMobileMenuOpen((value) => !value)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="mobile-brand">
            <div className="brand-mark">
              S
            </div>

            <span>
              SpendVault
            </span>
          </div>

          <div className="search-box">
            <Search size={17} />

            <input
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              placeholder="Search expenses..."
            />

            <span>
              ⌘ K
            </span>
          </div>

          <div className="top-actions">
            <button className="icon-button">
              <Bell
                size={19}
              />

              <i />
            </button>

            <div className="profile">
              <div className="avatar">
                {user?.name
                  ? user.name
                      .charAt(
                        0
                      )
                      .toUpperCase()
                  : "P"}
              </div>

              <div className="profile-text">
                <strong>
                  {user?.name ||
                    "Pooj"}
                </strong>

                <span>
                  Personal
                </span>
              </div>

              <button
                onClick={
                  handleLogout
                }
                title="Logout"
                style={{
                  border:
                    "none",
                  background:
                    "transparent",
                  color:
                    "#8b93a1",
                  cursor:
                    "pointer",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  marginLeft:
                    "4px",
                }}
              >
                <LogOut
                  size={16}
                />
              </button>
            </div>
          </div>
        </header>


        {/* PAGE CONTENT */}

        {activePage === "overview" ? (
        <section className="dashboard">

          {/* WELCOME */}

          <div className="welcome-row">
            <div>
              <p className="eyebrow">
                SPENDVAULT OVERVIEW
              </p>

              <h1>
                Good evening,{" "}
                {user?.name ||
                  "Pooj"}{" "}
                <span>
                  👋
                </span>
              </h1>

              <p className="subtitle">
                Here's a clear
                view of your
                spending.
              </p>
            </div>

            <button
              className="add-button"
              onClick={() =>
                setShowAddExpense(
                  true
                )
              }
            >
              <Plus size={18} />
              Add expense
            </button>
          </div>


          {/* API ERROR */}

          {error && (
            <div
              style={{
                marginBottom:
                  "20px",
                padding:
                  "12px 16px",
                borderRadius:
                  "12px",
                background:
                  "rgba(255,90,90,0.08)",
                border:
                  "1px solid rgba(255,90,90,0.2)",
                color:
                  "#ff9b9b",
                fontSize:
                  "14px",
              }}
            >
              {error}
            </div>
          )}


          {/* STATS */}

          <div className="stats-grid">

            {/* TOTAL */}

            <div className="stat-card primary-stat">
              <div className="stat-top">
                <span>
                  Total spent
                </span>

                <div className="stat-icon">
                  <Wallet
                    size={18}
                  />
                </div>
              </div>

              <h2>
                ₹
                {totalSpent.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 0,
                  }
                )}
              </h2>

              <div className="stat-change positive">
                <ArrowDownRight
                  size={15}
                />

                8.4%{" "}
                <span>
                  vs last month
                </span>
              </div>
            </div>


            {/* THIS MONTH */}

            <div className="stat-card">
              <div className="stat-top">
                <span>
                  This month
                </span>

                <div className="stat-icon">
                  <Receipt
                    size={18}
                  />
                </div>
              </div>

              <h2>
                ₹
                {thisMonthSpent.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 0,
                  }
                )}
              </h2>

              <div className="stat-change">
                {expensesLoading
                  ? "Loading..."
                  : `${thisMonthExpenses.length} transactions`}
              </div>
            </div>


            {/* AVERAGE */}

            <div className="stat-card">
              <div className="stat-top">
                <span>
                  Average expense
                </span>

                <div className="stat-icon">
                  <ArrowUpRight
                    size={18}
                  />
                </div>
              </div>

              <h2>
                ₹
                {averageExpense.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 0,
                  }
                )}
              </h2>

              <div className="stat-change negative">
                <ArrowUpRight
                  size={15}
                />

                12.2%{" "}
                <span>
                  vs last month
                </span>
              </div>
            </div>


            {/* BUDGET */}

            <div className="stat-card balance-card">
              <div className="stat-top">
                <span>
                  Budget remaining
                </span>

                <div className="budget-ring">
                  {Math.round(
                    budgetUsedPercentage
                  )}
                  %
                </div>
              </div>

              <h2>
                ₹
                {budgetRemaining.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 0,
                  }
                )}
              </h2>

              <div className="progress">
                <span
                  style={{
                    width: `${budgetUsedPercentage}%`,
                  }}
                />
              </div>

              <div className="budget-label">
                <span>
                  ₹
                  {thisMonthSpent.toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 0,
                    }
                  )}{" "}
                  spent
                </span>

                <span>
                  ₹
                  {MONTHLY_BUDGET.toLocaleString(
                    "en-IN"
                  )}{" "}
                  budget
                </span>
              </div>
            </div>
          </div>


          {/* FILTER BAR */}

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: "10px",
              flexWrap:
                "wrap",
              marginTop:
                "22px",
              marginBottom:
                "22px",
              padding:
                "14px",
              background:
                "rgba(255,255,255,0.025)",
              border:
                "1px solid rgba(255,255,255,0.07)",
              borderRadius:
                "12px",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: "7px",
                color:
                  "#9ca3af",
                fontSize:
                  "13px",
              }}
            >
              <Filter
                size={15}
              />

              Filters
            </div>

            <select
              value={
                categoryFilter
              }
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
              style={{
                background:
                  "#111318",
                color:
                  "#d8dce4",
                border:
                  "1px solid rgba(255,255,255,0.08)",
                borderRadius:
                  "8px",
                padding:
                  "8px 10px",
                outline:
                  "none",
                fontSize:
                  "12px",
              }}
            >
              <option value="All">
                All categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category
                    }
                    value={
                      category
                    }
                  >
                    {category}
                  </option>
                )
              )}
            </select>

            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(
                  e.target.value
                )
              }
              style={{
                background:
                  "#111318",
                color:
                  "#d8dce4",
                border:
                  "1px solid rgba(255,255,255,0.08)",
                borderRadius:
                  "8px",
                padding:
                  "8px 10px",
                outline:
                  "none",
                fontSize:
                  "12px",
              }}
            >
              <option value="all">
                All time
              </option>

              <option value="today">
                Today
              </option>

              <option value="this-week">
                This week
              </option>

              <option value="this-month">
                This month
              </option>

              <option value="last-month">
                Last month
              </option>

              <option value="custom">
                Custom range
              </option>
            </select>

            {dateFilter ===
              "custom" && (
              <>
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "6px",
                  }}
                >
                  <CalendarDays
                    size={14}
                    color="#727b8d"
                  />

                  <input
                    type="date"
                    value={
                      customStartDate
                    }
                    onChange={(e) =>
                      setCustomStartDate(
                        e.target
                          .value
                      )
                    }
                    style={{
                      background:
                        "#111318",
                      color:
                        "#d8dce4",
                      border:
                        "1px solid rgba(255,255,255,0.08)",
                      borderRadius:
                        "8px",
                      padding:
                        "7px 8px",
                      outline:
                        "none",
                      fontSize:
                        "12px",
                    }}
                  />
                </div>

                <span
                  style={{
                    color:
                      "#555d6c",
                    fontSize:
                      "12px",
                  }}
                >
                  to
                </span>

                <input
                  type="date"
                  value={
                    customEndDate
                  }
                  onChange={(e) =>
                    setCustomEndDate(
                      e.target
                        .value
                    )
                  }
                  style={{
                    background:
                      "#111318",
                    color:
                      "#d8dce4",
                    border:
                      "1px solid rgba(255,255,255,0.08)",
                    borderRadius:
                      "8px",
                    padding:
                      "7px 8px",
                    outline:
                      "none",
                    fontSize:
                      "12px",
                  }}
                />
              </>
            )}

            {hasActiveFilters && (
              <button
                onClick={
                  clearFilters
                }
                style={{
                  border:
                    "none",
                  background:
                    "transparent",
                  color:
                    "#9ca3af",
                  cursor:
                    "pointer",
                  fontSize:
                    "12px",
                  padding:
                    "7px 4px",
                }}
              >
                Clear filters
              </button>
            )}

            <span
              style={{
                marginLeft:
                  "auto",
                color:
                  "#697180",
                fontSize:
                  "12px",
              }}
            >
              {filteredExpenses.length}{" "}
              result
              {filteredExpenses.length !==
              1
                ? "s"
                : ""}
            </span>
          </div>


          {/* CHART + CATEGORY */}

          <div className="content-grid">

            {/* SPENDING ACTIVITY */}

            <section className="panel spending-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-kicker">
                    OVERVIEW
                  </p>

                  <h3>
                    Spending activity
                  </h3>
                </div>

                <select
                  value={
                    chartPeriod
                  }
                  onChange={(e) =>
                    setChartPeriod(
                      e.target
                        .value
                    )
                  }
                  style={{
                    background:
                      "#111318",
                    color:
                      "#aeb5c2",
                    border:
                      "1px solid rgba(255,255,255,0.08)",
                    borderRadius:
                      "8px",
                    padding:
                      "7px 9px",
                    outline:
                      "none",
                    fontSize:
                      "12px",
                    cursor:
                      "pointer",
                  }}
                >
                  <option>
                    This week
                  </option>

                  <option>
                    This month
                  </option>

                  <option>
                    Last month
                  </option>
                </select>
              </div>

              <div className="chart-wrap">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart
                    data={
                      realChartData
                    }
                  >
                    <defs>
                      <linearGradient
                        id="spendGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopOpacity={
                            0.25
                          }
                        />

                        <stop
                          offset="100%"
                          stopOpacity={
                            0
                          }
                        />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey="day"
                      axisLine={
                        false
                      }
                      tickLine={
                        false
                      }
                      tick={{
                        fontSize:
                          12,
                      }}
                    />

                    <YAxis hide />

                    <Tooltip
                      cursor={{
                        strokeDasharray:
                          "4 4",
                      }}
                      formatter={(
                        value
                      ) => [
                        `₹${Number(
                          value
                        ).toLocaleString(
                          "en-IN"
                        )}`,
                        "Spent",
                      ]}
                      contentStyle={{
                        borderRadius:
                          "12px",
                        border:
                          "1px solid rgba(255,255,255,.1)",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="amount"
                      strokeWidth={
                        2.5
                      }
                      fill="url(#spendGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>


            {/* CATEGORY */}

            <section className="panel category-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-kicker">
                    BREAKDOWN
                  </p>

                  <h3>
                    By category
                  </h3>
                </div>

                <button className="more-button">
                  <MoreHorizontal
                    size={20}
                  />
                </button>
              </div>

              <div className="category-total">
                <strong>
                  ₹
                  {thisMonthSpent.toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 0,
                    }
                  )}
                </strong>

                <span>
                  this month
                </span>
              </div>

              <div className="category-bars">
                {categoryData.length >
                0 ? (
                  categoryData
                    .slice(0, 4)
                    .map(
                      (item) => (
                        <div
                          className="category-row"
                          key={
                            item.category
                          }
                        >
                          <div className="category-info">
                            <span
                              className={`category-dot ${getCategoryClass(
                                item.category
                              )}`}
                              style={{
                                background:
                                  getCategoryColor(
                                    item.category
                                  ),
                              }}
                            />

                            <span>
                              {
                                item.category
                              }
                            </span>

                            <strong>
                              {
                                item.percentage
                              }
                              %
                            </strong>
                          </div>

                          <div className="bar">
                            <span
                              style={{
                                width: `${item.percentage}%`,
                              }}
                            />
                          </div>

                          <p>
                            ₹
                            {item.amount.toLocaleString(
                              "en-IN",
                              {
                                maximumFractionDigits: 0,
                              }
                            )}
                          </p>
                        </div>
                      )
                    )
                ) : (
                  <div
                    style={{
                      padding:
                        "30px 0",
                      textAlign:
                        "center",
                      color:
                        "#666f80",
                      fontSize:
                        "13px",
                    }}
                  >
                    No expenses
                    this month
                  </div>
                )}
              </div>
            </section>
          </div>


          {/* TRANSACTIONS */}

          <section className="panel transactions-panel">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">
                  ACTIVITY
                </p>

                <h3>
                  Recent transactions
                </h3>
              </div>

              <button className="view-all">
                View all{" "}
                <ArrowUpRight
                  size={15}
                />
              </button>
            </div>


            <div className="transactions-list">

              {expenses.length ===
              0 ? (
                fallbackTransactions.map(
                  (
                    transaction
                  ) => {
                    const Icon =
                      transaction.icon;

                    return (
                      <div
                        className="transaction"
                        key={
                          transaction.title
                        }
                      >
                        <div className="transaction-icon">
                          <Icon
                            size={19}
                          />
                        </div>

                        <div className="transaction-main">
                          <strong>
                            {
                              transaction.title
                            }
                          </strong>

                          <span>
                            {
                              transaction.category
                            }
                          </span>
                        </div>

                        <span className="transaction-date">
                          {
                            transaction.date
                          }
                        </span>

                        <strong className="transaction-amount">
                          {
                            transaction.amount
                          }
                        </strong>

                        <button className="more-button">
                          <MoreHorizontal
                            size={19}
                          />
                        </button>
                      </div>
                    );
                  }
                )
              ) : recentTransactions.length >
                0 ? (
                recentTransactions.map(
                  (
                    transaction
                  ) => {
                    const Icon =
                      transaction.icon;

                    return (
                      <div
                        className="transaction"
                        key={
                          transaction._id
                        }
                        style={{
                          position:
                            "relative",
                        }}
                      >
                        <div className="transaction-icon">
                          <Icon
                            size={19}
                          />
                        </div>

                        <div className="transaction-main">
                          <strong>
                            {
                              transaction.title
                            }
                          </strong>

                          <span>
                            {
                              transaction.category
                            }
                          </span>
                        </div>

                        <span className="transaction-date">
                          {formatDate(
                            transaction.date
                          )}
                        </span>

                        <strong className="transaction-amount">
                          {transaction.currency ===
                            "INR" ||
                          !transaction.currency
                            ? "₹"
                            : `${transaction.currency} `}

                          {Number(
                            transaction.amount
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        <button
                          className="more-button"
                          onClick={() =>
                            setOpenTransactionMenu(
                              openTransactionMenu ===
                                transaction._id
                                ? null
                                : transaction._id
                            )
                          }
                          title="Actions"
                        >
                          <MoreHorizontal
                            size={19}
                          />
                        </button>


                        {/* ACTION MENU */}

                        {openTransactionMenu ===
                          transaction._id && (
                          <div
                            style={{
                              position:
                                "absolute",
                              right:
                                "8px",
                              top:
                                "calc(100% - 2px)",
                              zIndex:
                                20,
                              minWidth:
                                "150px",
                              background:
                                "#17191e",
                              border:
                                "1px solid rgba(255,255,255,0.1)",
                              borderRadius:
                                "10px",
                              padding:
                                "5px",
                              boxShadow:
                                "0 14px 40px rgba(0,0,0,0.45)",
                            }}
                          >
                            <button
                              onClick={() => {
                                setEditingExpense(
                                  transaction
                                );

                                setOpenTransactionMenu(
                                  null
                                );
                              }}
                              style={{
                                width:
                                  "100%",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap:
                                  "9px",
                                border:
                                  "none",
                                background:
                                  "transparent",
                                color:
                                  "#d8dce4",
                                padding:
                                  "9px 10px",
                                borderRadius:
                                  "7px",
                                cursor:
                                  "pointer",
                                fontSize:
                                  "12px",
                                textAlign:
                                  "left",
                              }}
                            >
                              <Pencil
                                size={
                                  14
                                }
                              />

                              Edit expense
                            </button>

                            <button
                              onClick={() => {
                                setDeletingExpense(
                                  transaction
                                );

                                setOpenTransactionMenu(
                                  null
                                );
                              }}
                              style={{
                                width:
                                  "100%",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap:
                                  "9px",
                                border:
                                  "none",
                                background:
                                  "transparent",
                                color:
                                  "#f87171",
                                padding:
                                  "9px 10px",
                                borderRadius:
                                  "7px",
                                cursor:
                                  "pointer",
                                fontSize:
                                  "12px",
                                textAlign:
                                  "left",
                              }}
                            >
                              <Trash2
                                size={
                                  14
                                }
                              />

                              Delete expense
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }
                )
              ) : (
                <div
                  style={{
                    padding:
                      "40px 20px",
                    textAlign:
                      "center",
                  }}
                >
                  <Search
                    size={28}
                    color="#555d6c"
                    style={{
                      marginBottom:
                        "10px",
                    }}
                  />

                  <div
                    style={{
                      color:
                        "#aab1bf",
                      fontSize:
                        "14px",
                      marginBottom:
                        "5px",
                    }}
                  >
                    No expenses found
                  </div>

                  <div
                    style={{
                      color:
                        "#5f6878",
                      fontSize:
                        "12px",
                    }}
                  >
                    Try changing
                    your search or
                    filters.
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={
                        clearFilters
                      }
                      style={{
                        marginTop:
                          "14px",
                        border:
                          "none",
                        background:
                          "#f4f4f4",
                        color:
                          "#111",
                        padding:
                          "8px 12px",
                        borderRadius:
                          "7px",
                        cursor:
                          "pointer",
                        fontSize:
                          "12px",
                        fontWeight:
                          "600",
                      }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}

            </div>
          </section>
        </section>
        ) : (
          renderSecondaryPage()
        )}
      </main>

      <nav className="mobile-bottom-nav">
        <button className={activePage === "overview" ? "active" : ""} onClick={() => handleNavigation("overview")}><LayoutDashboard size={18} /><span>Overview</span></button>
        <button className={activePage === "transactions" ? "active" : ""} onClick={() => handleNavigation("transactions")}><Receipt size={18} /><span>Transactions</span></button>
        <button className={activePage === "analytics" ? "active" : ""} onClick={() => handleNavigation("analytics")}><PieChart size={18} /><span>Analytics</span></button>
        <button className={activePage === "budgets" ? "active" : ""} onClick={() => handleNavigation("budgets")}><Wallet size={18} /><span>Budgets</span></button>
        <button className={activePage === "settings" ? "active" : ""} onClick={() => handleNavigation("settings")}><Settings size={18} /><span>Settings</span></button>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-nav-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="mobile-drawer-header"><strong>SpendVault</strong><button onClick={() => setMobileMenuOpen(false)}><X size={20} /></button></div>
            <button onClick={() => handleNavigation("overview")}><LayoutDashboard size={18} /> Overview</button>
            <button onClick={() => handleNavigation("transactions")}><Receipt size={18} /> Transactions</button>
            <button onClick={() => handleNavigation("analytics")}><PieChart size={18} /> Analytics</button>
            <button onClick={() => handleNavigation("budgets")}><Wallet size={18} /> Budgets</button>
            <button onClick={() => handleNavigation("settings")}><Settings size={18} /> Settings</button>
          </div>
        </div>
      )}


      {/* =====================================================
          ADD EXPENSE MODAL
      ===================================================== */}

      {showAddExpense && (
        <AddExpenseModal
          onClose={() =>
            setShowAddExpense(
              false
            )
          }
          onExpenseAdded={(
            newExpense
          ) => {
            setExpenses(
              (previous) => [
                newExpense,
                ...previous,
              ]
            );
          }}
        />
      )}


      {/* =====================================================
          EDIT EXPENSE MODAL
      ===================================================== */}

      {editingExpense && (
        <EditExpenseModal
          expense={
            editingExpense
          }
          onClose={() =>
            setEditingExpense(
              null
            )
          }
          onExpenseUpdated={(
            updatedExpense
          ) => {
            setExpenses(
              (previous) =>
                previous.map(
                  (expense) =>
                    expense._id ===
                    updatedExpense._id
                      ? updatedExpense
                      : expense
                )
            );

            setEditingExpense(
              null
            );
          }}
        />
      )}


      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      {deletingExpense && (
        <div
          style={{
            position:
              "fixed",
            inset: 0,
            zIndex: 1000,
            background:
              "rgba(0,0,0,0.72)",
            backdropFilter:
              "blur(5px)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding:
              "20px",
          }}
        >
          <div
            style={{
              width:
                "100%",
              maxWidth:
                "400px",
              background:
                "#14161a",
              border:
                "1px solid rgba(255,255,255,0.09)",
              borderRadius:
                "16px",
              padding:
                "24px",
              boxShadow:
                "0 24px 80px rgba(0,0,0,0.55)",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
                marginBottom:
                  "18px",
              }}
            >
              <div
                style={{
                  width:
                    "40px",
                  height:
                    "40px",
                  borderRadius:
                    "10px",
                  background:
                    "rgba(239,68,68,0.1)",
                  color:
                    "#f87171",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                <Trash2
                  size={19}
                />
              </div>

              <button
                onClick={() =>
                  setDeletingExpense(
                    null
                  )
                }
                disabled={
                  deleteLoading
                }
                style={{
                  border:
                    "none",
                  background:
                    "transparent",
                  color:
                    "#697180",
                  cursor:
                    "pointer",
                }}
              >
                <X
                  size={20}
                />
              </button>
            </div>

            <h2
              style={{
                color:
                  "#fff",
                fontSize:
                  "18px",
                margin:
                  "0 0 8px",
              }}
            >
              Delete expense?
            </h2>

            <p
              style={{
                color:
                  "#8b93a1",
                fontSize:
                  "13px",
                lineHeight:
                  "1.6",
                margin:
                  "0 0 22px",
              }}
            >
              Are you sure you want
              to delete{" "}
              <strong
                style={{
                  color:
                    "#d8dce4",
                }}
              >
                "
                {
                  deletingExpense.title
                }
                "
              </strong>
              ? This action cannot
              be undone.
            </p>

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                gap:
                  "9px",
              }}
            >
              <button
                onClick={() =>
                  setDeletingExpense(
                    null
                  )
                }
                disabled={
                  deleteLoading
                }
                style={{
                  border:
                    "1px solid rgba(255,255,255,0.1)",
                  background:
                    "transparent",
                  color:
                    "#c4cad4",
                  padding:
                    "9px 14px",
                  borderRadius:
                    "8px",
                  cursor:
                    deleteLoading
                      ? "not-allowed"
                      : "pointer",
                  fontSize:
                    "12px",
                }}
              >
                Cancel
              </button>

              <button
                onClick={
                  handleDeleteExpense
                }
                disabled={
                  deleteLoading
                }
                style={{
                  border:
                    "none",
                  background:
                    "#dc2626",
                  color:
                    "#fff",
                  padding:
                    "9px 14px",
                  borderRadius:
                    "8px",
                  cursor:
                    deleteLoading
                      ? "not-allowed"
                      : "pointer",
                  fontSize:
                    "12px",
                  fontWeight:
                    "600",
                  opacity:
                    deleteLoading
                      ? 0.65
                      : 1,
                }}
              >
                {deleteLoading
                  ? "Deleting..."
                  : "Delete expense"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;