import mongoose from "mongoose";
const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Food & Dining",
        "Groceries",
        "Transport",
        "Fuel",
        "Shopping",
        "Bills",
        "Health & Medical",
        "Personal Care",
        "Entertainment",
        "Subscriptions",
        "Education",
        "Travel",
        "Rent",
        "Utilities",
        "Savings",
        "Investments",
        "Loan / EMI",
        "Insurance",
        "Gifts & Donations",
        "Pets",
        "Kids",
        "Other",
      ],
    },

    paymentMethod: {
      type: String,
      enum: [
        "UPI",
        "Cash",
        "Debit Card",
        "Credit Card",
        "Bank Transfer",
        "Other",
      ],
      default: "UPI",
    },

    date: {
      type: Date,
      default: Date.now,
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    receiptUrl: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING_APPROVAL",
        "APPROVED",
        "REJECTED",
        "REIMBURSEMENT_PENDING",
        "PROCESSING",
        "PAID",
      ],
      default: "DRAFT",
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;