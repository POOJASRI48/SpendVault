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
  ShoppingCart,
  Car,
  ReceiptText,
  Clapperboard,
  HeartPulse,
  GraduationCap,
  Plane,
  Repeat2,
  Package,
  Home,
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
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  Lightbulb,
  Target,
  PiggyBank,
  TrendingUp,
  CircleDollarSign,
  Sun,
  Moon,
  FileDown,
} from "lucide-react";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

import "./App.css";

import {
  loginUser,
  registerUser,
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
  const iconMap = {
    "Food & Dining": Utensils,
    Groceries: ShoppingCart,
    Fuel: Fuel,
    Transportation: Car,
    Shopping: ShoppingBag,
    "Bills & Utilities": ReceiptText,
    Entertainment: Clapperboard,
    Healthcare: HeartPulse,
    Education: GraduationCap,
    Travel: Plane,
    Subscriptions: Repeat2,
    Other: Package,
  };

  return iconMap[category] || Package;
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

const monthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const monthLabel = (date) =>
  date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

const shortMonthLabel = (date) =>
  date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

const getMonthFromKey = (key) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
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

  const [authMode, setAuthMode] = useState("login");

  const [error, setError] = useState("");

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

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
    useState("This month");

  const [selectedMonthKey, setSelectedMonthKey] =
    useState(monthKey(new Date()));

  const [savingsGoal, setSavingsGoal] = useState(0);

  const [savingsGoalInput, setSavingsGoalInput] = useState("");

  const [monthlyIncome, setMonthlyIncome] = useState(0);

  const [monthlyIncomeInput, setMonthlyIncomeInput] = useState("");

  const [openTransactionMenu, setOpenTransactionMenu] =
    useState(null);

  /* NAVIGATION */

  const [activePage, setActivePage] =
    useState("overview");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("spendvault_theme") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("spendvault_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => current === "dark" ? "light" : "dark");
  };

  const exportToPdf = () => {
    window.print();
  };

  const handleNavigation = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    setOpenTransactionMenu(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* USER-SPECIFIC FINANCIAL SETTINGS
     Income and savings goal must belong to the logged-in account,
     not to the browser as one shared global value. */
  const getUserStorageKey = (key) =>
    user?._id ? `spendvault_${user._id}_${key}` : null;

  useEffect(() => {
    if (!user?._id) {
      setMonthlyIncome(0);
      setSavingsGoal(0);
      return;
    }

    const incomeKey = getUserStorageKey("monthly_income");
    const savingsKey = getUserStorageKey("savings_goal");

    const savedIncome = localStorage.getItem(incomeKey);
    const savedSavingsGoal = localStorage.getItem(savingsKey);

    setMonthlyIncome(savedIncome ? Number(savedIncome) || 0 : 0);
    setSavingsGoal(
      savedSavingsGoal ? Number(savedSavingsGoal) || 0 : 0
    );
    setMonthlyIncomeInput("");
    setSavingsGoalInput("");
  }, [user?._id]);

  const saveMonthlyIncome = () => {
    const value = Number(monthlyIncomeInput);
    if (!Number.isFinite(value) || value < 0 || !user?._id) return;

    const storageKey = getUserStorageKey("monthly_income");
    localStorage.setItem(storageKey, String(value));
    setMonthlyIncome(value);
    setMonthlyIncomeInput("");
  };

  const selectedMonthDate = useMemo(
    () => getMonthFromKey(selectedMonthKey),
    [selectedMonthKey]
  );

  const shiftSelectedMonth = (offset) => {
    const next = new Date(selectedMonthDate);
    next.setMonth(next.getMonth() + offset);
    setSelectedMonthKey(monthKey(next));
  };

  const saveSavingsGoal = () => {
    const value = Number(savingsGoalInput);
    if (!Number.isFinite(value) || value < 0 || !user?._id) return;

    const storageKey = getUserStorageKey("savings_goal");
    localStorage.setItem(storageKey, String(value));
    setSavingsGoal(value);
    setSavingsGoalInput("");
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
     SELECTED MONTH SPENDING
  ========================================================= */

  const thisMonthExpenses = useMemo(() => {
    const start = startOfMonth(selectedMonthDate);
    const end = endOfMonth(selectedMonthDate);

    return expenses.filter((expense) => {
      const date = new Date(expense.date);
      return !Number.isNaN(date.getTime()) && date >= start && date <= end;
    });
  }, [expenses, selectedMonthDate]);

  /* =========================================================
     SELECTED MONTH TOTAL
  ========================================================= */

  const thisMonthSpent = useMemo(() => {
    return thisMonthExpenses.reduce(
      (total, expense) => total + Number(expense.amount || 0),
      0
    );
  }, [thisMonthExpenses]);

  /* =========================================================
     SELECTED MONTH METRICS
  ========================================================= */

  const averageExpense = useMemo(() => {
    if (thisMonthExpenses.length === 0) return 0;
    return thisMonthSpent / thisMonthExpenses.length;
  }, [thisMonthExpenses, thisMonthSpent]);

  const previousMonthDate = useMemo(() => {
    const date = new Date(selectedMonthDate);
    date.setMonth(date.getMonth() - 1);
    return date;
  }, [selectedMonthDate]);

  const previousMonthExpenses = useMemo(() => {
    const start = startOfMonth(previousMonthDate);
    const end = endOfMonth(previousMonthDate);

    return expenses.filter((expense) => {
      const date = new Date(expense.date);
      return !Number.isNaN(date.getTime()) && date >= start && date <= end;
    });
  }, [expenses, previousMonthDate]);

  const previousMonthSpent = useMemo(
    () =>
      previousMonthExpenses.reduce(
        (total, expense) => total + Number(expense.amount || 0),
        0
      ),
    [previousMonthExpenses]
  );

  const monthChangePercentage = useMemo(() => {
    if (previousMonthSpent === 0) {
      return thisMonthSpent > 0 ? 100 : 0;
    }

    return (
      ((thisMonthSpent - previousMonthSpent) /
        previousMonthSpent) *
      100
    );
  }, [thisMonthSpent, previousMonthSpent]);

  const dailyAverage = useMemo(() => {
    const today = new Date();
    const isCurrentMonth =
      monthKey(selectedMonthDate) === monthKey(today);

    const daysElapsed = isCurrentMonth
      ? Math.max(today.getDate(), 1)
      : new Date(
          selectedMonthDate.getFullYear(),
          selectedMonthDate.getMonth() + 1,
          0
        ).getDate();

    return thisMonthSpent / daysElapsed;
  }, [selectedMonthDate, thisMonthSpent]);

  const monthlyTrendData = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(selectedMonthDate);
      date.setMonth(date.getMonth() - (5 - index));

      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const amount = expenses.reduce((total, expense) => {
        const expenseDate = new Date(expense.date);

        return !Number.isNaN(expenseDate.getTime()) &&
          expenseDate >= start &&
          expenseDate <= end
          ? total + Number(expense.amount || 0)
          : total;
      }, 0);

      return {
        month: shortMonthLabel(date),
        amount,
      };
    });
  }, [expenses, selectedMonthDate]);

  /* =========================================================
     MONTHLY BUDGET
  ========================================================= */

  const budgetRemaining = MONTHLY_BUDGET - thisMonthSpent;

  const budgetUsedPercentage =
    MONTHLY_BUDGET > 0
      ? (thisMonthSpent / MONTHLY_BUDGET) * 100
      : 0;

  const monthlySavings = monthlyIncome - thisMonthSpent;

  const savingsRate =
    monthlyIncome > 0
      ? (monthlySavings / monthlyIncome) * 100
      : 0;

  const savingsProgress =
    savingsGoal > 0
      ? Math.min(
          Math.max(
            (Math.max(monthlySavings, 0) / savingsGoal) * 100,
            0
          ),
          100
        )
      : 0;

  const incomeComparisonData = useMemo(
    () => [
      {
        label: shortMonthLabel(selectedMonthDate),
        income: monthlyIncome,
        spending: thisMonthSpent,
        savings: Math.max(monthlySavings, 0),
      },
    ],
    [monthlyIncome, thisMonthSpent, monthlySavings, selectedMonthDate]
  );

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
     SELECTED MONTH DAILY CHART + SMART INSIGHTS
  ========================================================= */

  const realChartData = useMemo(() => {
    const end = endOfMonth(selectedMonthDate);
    const daysInMonth = end.getDate();
    const grouped = {};

    thisMonthExpenses.forEach((expense) => {
      const date = new Date(expense.date);
      const day = date.getDate();

      grouped[day] =
        (grouped[day] || 0) +
        Number(expense.amount || 0);
    });

    return Array.from({ length: daysInMonth }, (_, index) => ({
      day: String(index + 1),
      amount: grouped[index + 1] || 0,
    }));
  }, [thisMonthExpenses, selectedMonthDate]);

  const smartInsights = useMemo(() => {
    const insights = [];
    const topCategory = categoryData[0];

    if (monthlyIncome > 0) {
      if (monthlySavings >= 0) {
        insights.push({
          type: "positive",
          icon: PiggyBank,
          title: "Great progress!",
          text: `You saved ₹${monthlySavings.toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          })} this month — ${Math.max(savingsRate, 0).toFixed(0)}% of your income.`,
        });
      } else {
        insights.push({
          type: "warning",
          icon: ArrowUpRight,
          title: "Spending is above income",
          text: `You are ₹${Math.abs(monthlySavings).toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          })} over your monthly income.`,
        });
      }
    } else {
      insights.push({
        type: "trend",
        icon: Wallet,
        title: "Set your monthly income",
        text: "Add it from Settings to unlock savings and income insights.",
      });
    }

    if (topCategory) {
      insights.push({
        type: "category",
        icon: getCategoryIcon(topCategory.category),
        title: `${topCategory.category} is your biggest category`,
        text: `₹${topCategory.amount.toLocaleString("en-IN", {
          maximumFractionDigits: 0,
        })} • ${topCategory.percentage}% of ${monthLabel(selectedMonthDate)}`,
      });
    }

    if (previousMonthSpent > 0) {
      const direction =
        monthChangePercentage > 0
          ? "higher"
          : monthChangePercentage < 0
          ? "lower"
          : "the same";

      insights.push({
        type: "trend",
        icon: TrendingUp,
        title: `Spending is ${direction} than last month`,
        text: `${Math.abs(monthChangePercentage).toFixed(
          0
        )}% change compared with ${shortMonthLabel(previousMonthDate)}.`,
      });
    }

    if (thisMonthSpent > MONTHLY_BUDGET) {
      insights.push({
        type: "warning",
        icon: ArrowUpRight,
        title: "Budget exceeded",
        text: `₹${Math.abs(budgetRemaining).toLocaleString("en-IN", {
          maximumFractionDigits: 0,
        })} over your monthly budget.`,
      });
    }

    return insights.slice(0, 4);
  }, [
    categoryData,
    monthlyIncome,
    monthlySavings,
    savingsRate,
    thisMonthSpent,
    selectedMonthDate,
    previousMonthSpent,
    monthChangePercentage,
    previousMonthDate,
    budgetRemaining,
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
            <section className="panel category-panel"><div className="panel-header"><div><p className="panel-kicker">BREAKDOWN</p><h3>Top categories</h3></div></div><div className="category-bars">{categoryData.length ? categoryData.slice(0, 8).map((item) => { const CategoryIcon = getCategoryIcon(item.category); const categoryColor = getCategoryColor(item.category); return (<div className="category-row" key={item.category}><div className="category-row-top"><div className="category-info"><span className="category-icon" style={{ "--category-color": categoryColor, "--category-soft": `${categoryColor}22` }}><CategoryIcon size={15} /></span><div className="category-name-wrap"><span>{item.category}</span><small>₹{item.amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</small></div></div><strong className="category-percentage">{item.percentage}%</strong></div><div className="bar" style={{ "--category-color": categoryColor }}><span style={{ width: `${Math.max(item.percentage, 4)}%`, background: categoryColor }} /></div></div>); }) : <div className="page-empty-state">No spending data yet.</div>}</div></section>
          </div>
        </section>
      );
    }

    if (activePage === "budgets") {
      return (
        <section className="dashboard page-dashboard"><div className="welcome-row"><div><p className="eyebrow">{pageConfig.eyebrow}</p><h1>{pageConfig.title}</h1><p className="subtitle">{pageConfig.subtitle}</p></div><div className="page-icon-card"><PageIcon size={21} /></div></div><section className="panel budget-page-card"><div className="budget-page-top"><div><p className="panel-kicker">MONTHLY BUDGET</p><h2>₹{MONTHLY_BUDGET.toLocaleString("en-IN")}</h2><span>{monthLabel(selectedMonthDate)} spending limit</span></div><div className="budget-page-number">{budgetUsedPercentage.toFixed(0)}%</div></div><div className="budget-progress"><span style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }} /></div><div className="budget-page-stats"><div><span>Spent</span><strong>₹{thisMonthSpent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong></div><div><span>Remaining</span><strong>₹{Math.max(budgetRemaining, 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong></div></div></section></section>
      );
    }

    return (
      <section className="dashboard page-dashboard">
        <div className="welcome-row">
          <div>
            <p className="eyebrow">{pageConfig.eyebrow}</p>
            <h1>{pageConfig.title}</h1>
            <p className="subtitle">{pageConfig.subtitle}</p>
          </div>
          <div className="page-icon-card"><PageIcon size={21} /></div>
        </div>

        <section className="panel settings-page-card">
          <div className="settings-profile">
            <div className="settings-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "P"}
            </div>
            <div>
              <h3>{user?.name || "Pooj"}</h3>
              <p>{user?.email || ""}</p>
            </div>
          </div>

          <div className="income-setting-section">
            <div className="income-setting-heading">
              <div className="income-setting-icon">
                <Wallet size={18} />
              </div>
              <div>
                <p className="panel-kicker">MONTHLY INCOME</p>
                <h3>Set your monthly income</h3>
                <span>
                  This amount is used to calculate spending, savings and savings rate.
                </span>
              </div>
            </div>

            <div className="income-setting-form">
              <div className="income-input-wrap">
                <span>₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={monthlyIncomeInput}
                  onChange={(e) => setMonthlyIncomeInput(e.target.value)}
                  placeholder={
                    monthlyIncome > 0
                      ? String(monthlyIncome)
                      : "e.g. 50000"
                  }
                />
              </div>

              <button
                type="button"
                className="income-save-button"
                onClick={saveMonthlyIncome}
                disabled={!monthlyIncomeInput}
              >
                <PiggyBank size={15} />
                Save income
              </button>
            </div>

            <div className="income-setting-current">
              <span>Current monthly income</span>
              <strong>
                {monthlyIncome > 0
                  ? `₹${monthlyIncome.toLocaleString("en-IN")}`
                  : "Not set"}
              </strong>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <strong>Account</strong>
              <span>Your SpendVault personal account</span>
            </div>
            <Mail size={18} />
          </div>

          <button className="settings-logout" onClick={handleLogout}>
            <LogOut size={17} /> Log out
          </button>
        </section>
      </section>
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
     AUTH SCREEN
  ========================================================= */

  if (!user) {
    const isRegister = authMode === "register";

    const switchAuthMode = (mode) => {
      setAuthMode(mode);
      setLoginError("");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
    };

    const handleRegister = async (event) => {
      event.preventDefault();
      setLoginError("");

      if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        setLoginError("Please fill in all fields.");
        return;
      }

      if (password.length < 6) {
        setLoginError("Password must be at least 6 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setLoginError("Passwords do not match.");
        return;
      }

      try {
        setLoginLoading(true);

        const data = await registerUser(
          name.trim(),
          email.trim(),
          password
        );

        if (!data.token) {
          throw new Error("Registration token was not returned.");
        }

        localStorage.setItem("spendvault_token", data.token);

        const userData = await getCurrentUser();
        setUser(userData.user);

        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } catch (err) {
        console.error("Registration failed:", err);

        setLoginError(
          err.response?.data?.message ||
            err.message ||
            "Unable to create your account."
        );
      } finally {
        setLoginLoading(false);
      }
    };

    const handleAuthSubmit = isRegister
      ? handleRegister
      : handleLogin;

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
            maxWidth: isRegister ? "460px" : "420px",
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
                letterSpacing: "-0.5px",
              }}
            >
              SpendVault
            </span>
          </div>

          <div
            style={{
              background: "rgba(18, 19, 22, 0.95)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "20px",
              padding: "32px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ marginBottom: "28px" }}>
              <p
                style={{
                  color: "#8d96a8",
                  fontSize: "11px",
                  letterSpacing: "1.5px",
                  marginBottom: "8px",
                }}
              >
                {isRegister ? "GET STARTED" : "SECURE ACCESS"}
              </p>

              <h1
                style={{
                  color: "#fff",
                  fontSize: "28px",
                  margin: 0,
                  letterSpacing: "-0.8px",
                }}
              >
                {isRegister ? "Create your account" : "Welcome back"}
              </h1>

              <p
                style={{
                  color: "#777f90",
                  fontSize: "14px",
                  marginTop: "9px",
                }}
              >
                {isRegister
                  ? "Start tracking your spending with SpendVault."
                  : "Sign in to manage your expenses."}
              </p>
            </div>

            {loginError && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  marginBottom: "18px",
                  color: "#ff9b9b",
                  background: "rgba(255,70,70,0.08)",
                  border: "1px solid rgba(255,70,70,0.18)",
                  fontSize: "13px",
                }}
              >
                {loginError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit}>
              {isRegister && (
                <div style={{ marginBottom: "18px" }}>
                  <label
                    style={{
                      display: "block",
                      color: "#aab1bf",
                      fontSize: "13px",
                      marginBottom: "8px",
                    }}
                  >
                    Name
                  </label>

                  <div style={{ position: "relative" }}>
                    <CircleDollarSign
                      size={17}
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#697180",
                      }}
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        background: "#0d0f12",
                        border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: "10px",
                        padding: "13px 14px 13px 42px",
                        color: "#fff",
                        outline: "none",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#aab1bf",
                    fontSize: "13px",
                    marginBottom: "8px",
                  }}
                >
                  Email
                </label>

                <div style={{ position: "relative" }}>
                  <Mail
                    size={17}
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#697180",
                    }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "#0d0f12",
                      border: "1px solid rgba(255,255,255,0.09)",
                      borderRadius: "10px",
                      padding: "13px 14px 13px 42px",
                      color: "#fff",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#aab1bf",
                    fontSize: "13px",
                    marginBottom: "8px",
                  }}
                >
                  Password
                </label>

                <div style={{ position: "relative" }}>
                  <Lock
                    size={17}
                    style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#697180",
                    }}
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRegister ? "At least 6 characters" : "Enter your password"}
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "#0d0f12",
                      border: "1px solid rgba(255,255,255,0.09)",
                      borderRadius: "10px",
                      padding: "13px 45px 13px 42px",
                      color: "#fff",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      color: "#697180",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {isRegister && (
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      color: "#aab1bf",
                      fontSize: "13px",
                      marginBottom: "8px",
                    }}
                  >
                    Confirm password
                  </label>

                  <div style={{ position: "relative" }}>
                    <Lock
                      size={17}
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#697180",
                      }}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        background: "#0d0f12",
                        border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: "10px",
                        padding: "13px 14px 13px 42px",
                        color: "#fff",
                        outline: "none",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                </div>
              )}

              {!isRegister && <div style={{ marginBottom: "24px" }} />}

              <button
                type="submit"
                disabled={loginLoading}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: "10px",
                  padding: "13px",
                  background: "#f4f4f4",
                  color: "#111",
                  fontWeight: "700",
                  fontSize: "14px",
                  cursor: loginLoading ? "not-allowed" : "pointer",
                  opacity: loginLoading ? 0.65 : 1,
                }}
              >
                {loginLoading
                  ? isRegister
                    ? "Creating account..."
                    : "Signing in..."
                  : isRegister
                    ? "Create account"
                    : "Sign in"}
              </button>
            </form>

            <div
              style={{
                textAlign: "center",
                marginTop: "22px",
                paddingTop: "20px",
                borderTop: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <span style={{ color: "#697180", fontSize: "13px" }}>
                {isRegister ? "Already have an account?" : "Don't have an account?"}
              </span>{" "}
              <button
                type="button"
                onClick={() => switchAuthMode(isRegister ? "login" : "register")}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#f4f4f4",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {isRegister ? "Sign in" : "Create account"}
              </button>
            </div>

            <p
              style={{
                textAlign: "center",
                color: "#555d6c",
                fontSize: "12px",
                marginTop: "18px",
                marginBottom: 0,
              }}
            >
              Your session is secured with JWT authentication.
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
    <div className={`app-shell ${theme === "light" ? "light-theme" : "dark-theme"}`}>

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
            <button
              className="icon-button theme-toggle"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              className="icon-button pdf-export-button"
              onClick={exportToPdf}
              title="Export current dashboard as PDF"
              aria-label="Export current dashboard as PDF"
            >
              <FileDown size={18} />
            </button>

            <button className="icon-button notification-button">
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

            <div className="welcome-row">
              <div>
                <p className="eyebrow">SPENDVAULT OVERVIEW</p>
                <h1>
                  Good evening, {user?.name || "Pooj"} <span>👋</span>
                </h1>
                <p className="subtitle">
                  A month-by-month view of where your money goes.
                </p>
              </div>

              <button
                className="add-button"
                onClick={() => setShowAddExpense(true)}
              >
                <Plus size={17} />
                Add expense
              </button>
            </div>

            {error && (
              <div className="error-banner">
                {error}
              </div>
            )}

            {/* MONTH CONTROL */}
            <section className="month-control panel">
              <div className="month-control-left">
                <div className="month-control-icon">
                  <CalendarRange size={17} />
                </div>

                <div>
                  <span className="month-control-label">
                    MANAGE MONTH
                  </span>
                  <strong>{monthLabel(selectedMonthDate)}</strong>
                </div>
              </div>

              <div className="month-control-actions">
                <button
                  type="button"
                  className="month-arrow"
                  onClick={() => shiftSelectedMonth(-1)}
                  title="Previous month"
                >
                  <ChevronLeft size={17} />
                </button>

                <input
                  type="month"
                  value={selectedMonthKey}
                  onChange={(e) => setSelectedMonthKey(e.target.value)}
                  aria-label="Select month"
                />

                <button
                  type="button"
                  className="month-arrow"
                  onClick={() => shiftSelectedMonth(1)}
                  title="Next month"
                >
                  <ChevronRight size={17} />
                </button>

                <button
                  type="button"
                  className="today-month-button"
                  onClick={() => setSelectedMonthKey(monthKey(new Date()))}
                >
                  Current
                </button>
              </div>
            </section>

            {/* MONTHLY MONEY FLOW KPI CARDS */}
            <div className="stats-grid monthly-stats-grid income-stats-grid">

              <div className="stat-card stat-income">
                <div className="stat-top">
                  <span>Monthly income</span>
                  <div className="stat-icon">
                    <Wallet size={15} />
                  </div>
                </div>

                <h2>
                  {monthlyIncome > 0
                    ? `₹${monthlyIncome.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}`
                    : "Not set"}
                </h2>

                <div className="stat-change">
                  {monthlyIncome > 0
                    ? `For ${shortMonthLabel(selectedMonthDate)}`
                    : "Set it from Settings"}
                </div>
              </div>

              <div className="stat-card stat-spend">
                <div className="stat-top">
                  <span>This month spent</span>
                  <div className="stat-icon">
                    <CircleDollarSign size={15} />
                  </div>
                </div>

                <h2>
                  ₹{thisMonthSpent.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </h2>

                <div
                  className={`stat-change ${
                    monthChangePercentage > 0
                      ? "negative"
                      : monthChangePercentage < 0
                      ? "positive"
                      : ""
                  }`}
                >
                  {monthChangePercentage > 0 ? (
                    <ArrowUpRight size={13} />
                  ) : monthChangePercentage < 0 ? (
                    <ArrowDownRight size={13} />
                  ) : null}

                  {previousMonthSpent > 0
                    ? `${Math.abs(monthChangePercentage).toFixed(1)}%`
                    : "—"}{" "}
                  <span>vs {shortMonthLabel(previousMonthDate)}</span>
                </div>
              </div>

              <div className="stat-card stat-savings">
                <div className="stat-top">
                  <span>Savings</span>
                  <div className="stat-icon">
                    <PiggyBank size={15} />
                  </div>
                </div>

                <h2 className={monthlySavings < 0 ? "danger-value" : ""}>
                  {monthlyIncome > 0
                    ? `${monthlySavings < 0 ? "- " : ""}₹${Math.abs(
                        monthlySavings
                      ).toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}`
                    : "Not set"}
                </h2>

                <div className="stat-change">
                  {monthlyIncome > 0
                    ? monthlySavings >= 0
                      ? "Available to save"
                      : "Over income"
                    : "Add monthly income first"}
                </div>
              </div>

              <div className="stat-card stat-rate">
                <div className="stat-top">
                  <span>Savings rate</span>
                  <div className="budget-ring savings-ring">
                    {monthlyIncome > 0
                      ? `${Math.max(savingsRate, 0).toFixed(0)}%`
                      : "—"}
                  </div>
                </div>

                <h2>
                  {monthlyIncome > 0
                    ? `${savingsRate.toFixed(0)}%`
                    : "—"}
                </h2>

                <div className="progress savings-progress">
                  <span
                    style={{
                      width: `${Math.min(Math.max(savingsRate, 0), 100)}%`,
                    }}
                  />
                </div>

                <div className="budget-label">
                  <span>
                    {monthlyIncome > 0
                      ? savingsRate >= 0
                        ? "Income saved"
                        : "Negative savings"
                      : "Set income"}
                  </span>
                  <span>{shortMonthLabel(selectedMonthDate)}</span>
                </div>
              </div>
            </div>

            {/* MONTHLY TREND + CATEGORY PIE */}
            <div className="content-grid analytics-main-grid">

              <section className="panel chart-panel monthly-trend-panel income-comparison-panel">
                <div className="panel-header">
                  <div>
                    <p className="panel-kicker">INCOME VS SPENDING</p>
                    <h3>Where your money stands</h3>
                    <span className="panel-subtext">
                      {monthLabel(selectedMonthDate)} • income, expenses and available savings
                    </span>
                  </div>
                </div>

                <div className="chart-wrap monthly-chart-wrap">
                  {monthlyIncome > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={incomeComparisonData}
                        barCategoryGap="24%"
                      >
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 9 }}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 8 }}
                          tickFormatter={(value) =>
                            `₹${Number(value).toLocaleString("en-IN")}`
                          }
                        />

                        <Tooltip
                          formatter={(value, name) => [
                            `₹${Number(value).toLocaleString("en-IN")}`,
                            name === "income"
                              ? "Income"
                              : name === "spending"
                              ? "Expenses"
                              : "Savings",
                          ]}
                          contentStyle={{
                            background: "#171b22",
                            border: "1px solid rgba(255,255,255,.1)",
                            borderRadius: "10px",
                            color: "#fff",
                          }}
                        />

                        <Bar
                          dataKey="income"
                          name="Income"
                          fill="#22d3a0"
                          radius={[5, 5, 0, 0]}
                        />
                        <Bar
                          dataKey="spending"
                          name="Expenses"
                          fill="#4f8cff"
                          radius={[5, 5, 0, 0]}
                        />
                        <Bar
                          dataKey="savings"
                          name="Savings"
                          fill="#9b7cff"
                          radius={[5, 5, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="income-chart-empty">
                      <Wallet size={24} />
                      <strong>Add your monthly income</strong>
                      <span>Go to Settings → Monthly Income to activate this comparison.</span>
                      <button
                        type="button"
                        className="inline-action-button"
                        onClick={() => handleNavigation("settings")}
                      >
                        Open Settings
                      </button>
                    </div>
                  )}
                </div>
              </section>

              <section className="panel category-panel pie-panel">
                <div className="panel-header">
                  <div>
                    <p className="panel-kicker">SPENDING CATEGORIES</p>
                    <h3>Where your money went</h3>
                    <span className="panel-subtext">
                      {monthLabel(selectedMonthDate)}
                    </span>
                  </div>
                </div>

                {categoryData.length > 0 ? (
                  <>
                    <div className="pie-chart-wrap">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={categoryData}
                            dataKey="amount"
                            nameKey="category"
                            cx="50%"
                            cy="48%"
                            innerRadius="48%"
                            outerRadius="76%"
                            paddingAngle={2}
                            stroke="none"
                          >
                            {categoryData.map((item) => (
                              <Cell
                                key={item.category}
                                fill={getCategoryColor(item.category)}
                              />
                            ))}
                          </Pie>

                          <Tooltip
                            formatter={(value, name) => [
                              `₹${Number(value).toLocaleString("en-IN")}`,
                              name,
                            ]}
                            contentStyle={{
                              background: "#171b22",
                              border: "1px solid rgba(255,255,255,.1)",
                              borderRadius: "10px",
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>

                      <div className="pie-center">
                        <strong>
                          ₹{thisMonthSpent.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </strong>
                        <span>Total</span>
                      </div>
                    </div>

                    <div className="pie-legend">
                      {categoryData.slice(0, 6).map((item) => (
                        <div className="pie-legend-item" key={item.category}>
                          <span
                            className="pie-legend-dot"
                            style={{
                              background: getCategoryColor(item.category),
                            }}
                          />
                          <span className="pie-legend-name">
                            {item.category}
                          </span>
                          <strong>{item.percentage}%</strong>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="category-empty">
                    <div className="category-empty-icon">
                      <PieChart size={20} />
                    </div>
                    <span>No spending data for this month</span>
                    <small>Add an expense or select another month.</small>
                  </div>
                )}
              </section>
            </div>

            {/* TRANSACTIONS + SMART INSIGHTS */}
            <div className="dashboard-lower-grid">

              <section className="panel transactions-panel">
                <div className="panel-header">
                  <div>
                    <p className="panel-kicker">ACTIVITY</p>
                    <h3>
                      Recent transactions
                    </h3>
                    <span className="panel-subtext">
                      {thisMonthExpenses.length} transaction
                      {thisMonthExpenses.length === 1 ? "" : "s"} in{" "}
                      {shortMonthLabel(selectedMonthDate)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="view-all"
                    onClick={() => handleNavigation("transactions")}
                  >
                    View all <ArrowUpRight size={14} />
                  </button>
                </div>

                <div className="transactions-list">
                  {thisMonthExpenses.length > 0 ? (
                    [...thisMonthExpenses]
                      .sort(
                        (a, b) =>
                          new Date(b.date) - new Date(a.date)
                      )
                      .slice(0, 6)
                      .map((transaction) => {
                        const Icon = getCategoryIcon(transaction.category);

                        return (
                          <div
                            className="transaction"
                            key={transaction._id}
                          >
                            <div
                              className={`transaction-icon ${getCategoryClass(
                                transaction.category
                              )}`}
                              style={{
                                color: getCategoryColor(transaction.category),
                              }}
                            >
                              <Icon size={17} />
                            </div>

                            <div className="transaction-main">
                              <strong>{transaction.title}</strong>
                              <span>
                                {transaction.category} •{" "}
                                {formatDate(transaction.date)}
                              </span>
                            </div>

                            <span className="transaction-date">
                              {formatDate(transaction.date)}
                            </span>

                            <strong className="transaction-amount">
                              {transaction.currency === "INR" ||
                              !transaction.currency
                                ? "₹"
                                : `${transaction.currency} `}
                              {Number(transaction.amount).toLocaleString(
                                "en-IN"
                              )}
                            </strong>

                            <button
                              className="more-button"
                              onClick={() =>
                                setOpenTransactionMenu(
                                  openTransactionMenu === transaction._id
                                    ? null
                                    : transaction._id
                                )
                              }
                              title="Actions"
                            >
                              <MoreHorizontal size={17} />
                            </button>

                            {openTransactionMenu === transaction._id && (
                              <div className="action-menu">
                                <button
                                  onClick={() => {
                                    setEditingExpense(transaction);
                                    setOpenTransactionMenu(null);
                                  }}
                                >
                                  <Pencil size={14} />
                                  Edit expense
                                </button>

                                <button
                                  className="delete"
                                  onClick={() => {
                                    setDeletingExpense(transaction);
                                    setOpenTransactionMenu(null);
                                  }}
                                >
                                  <Trash2 size={14} />
                                  Delete expense
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                  ) : (
                    <div className="page-empty-state compact-empty">
                      <Receipt size={23} />
                      <span>No transactions in {monthLabel(selectedMonthDate)}.</span>
                      <button
                        className="inline-action-button"
                        onClick={() => setShowAddExpense(true)}
                      >
                        <Plus size={14} /> Add expense
                      </button>
                    </div>
                  )}
                </div>
              </section>

              <div className="dashboard-side-stack">

                <section className="panel insights-panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">SMART INSIGHTS</p>
                      <h3>What your spending says</h3>
                    </div>
                    <div className="insight-header-icon">
                      <Lightbulb size={16} />
                    </div>
                  </div>

                  <div className="insights-list">
                    {smartInsights.length > 0 ? (
                      smartInsights.map((insight, index) => {
                        const InsightIcon = insight.icon;

                        return (
                          <div
                            className={`insight-card ${insight.type}`}
                            key={`${insight.title}-${index}`}
                          >
                            <div className="insight-icon">
                              <InsightIcon size={14} />
                            </div>

                            <div>
                              <strong>{insight.title}</strong>
                              <span>{insight.text}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="page-empty-state compact-empty">
                        Add expenses to unlock insights.
                      </div>
                    )}
                  </div>
                </section>

                <section className="panel savings-panel">
                  <div className="panel-header">
                    <div>
                      <p className="panel-kicker">SAVINGS GOAL</p>
                      <h3>Keep an amount unspent</h3>
                    </div>
                    <div className="goal-icon">
                      <PiggyBank size={16} />
                    </div>
                  </div>

                  <div className="goal-note">
                    Your goal is measured against the savings available after this month's expenses.
                  </div>

                  {savingsGoal > 0 ? (
                    <>
                      <div className="goal-summary">
                        <div>
                          <span>Target</span>
                          <strong>
                            ₹{savingsGoal.toLocaleString("en-IN")}
                          </strong>
                        </div>

                        <div className="goal-percent">
                          {Math.round(savingsProgress)}%
                        </div>
                      </div>

                      <div className="goal-progress">
                        <span
                          style={{
                            width: `${savingsProgress}%`,
                          }}
                        />
                      </div>

                      <div className="goal-footer">
                        <span>
                          ₹{Math.min(
                            Math.max(monthlySavings, 0),
                            savingsGoal
                          ).toLocaleString("en-IN")} available
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setSavingsGoalInput(String(savingsGoal));
                            setSavingsGoal(0);
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="goal-setter">
                      <div className="goal-input-wrap">
                        <span>₹</span>
                        <input
                          type="number"
                          min="0"
                          value={savingsGoalInput}
                          onChange={(e) =>
                            setSavingsGoalInput(e.target.value)
                          }
                          placeholder="e.g. 5000"
                        />
                      </div>

                      <button
                        type="button"
                        className="goal-save-button"
                        onClick={saveSavingsGoal}
                        disabled={!savingsGoalInput}
                      >
                        <Target size={14} />
                        Set goal
                      </button>
                    </div>
                  )}
                </section>

              </div>
            </div>
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