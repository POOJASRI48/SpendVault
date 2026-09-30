import { useState } from "react";
import { X, Receipt, IndianRupee, CalendarDays, FileText } from "lucide-react";
import { createExpense } from "../services/expenseService";

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

const paymentMethods = [
  "UPI",
  "Credit Card",
  "Debit Card",
  "Cash",
  "Bank Transfer",
];

function AddExpenseModal({ onClose, onExpenseAdded }) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food & Dining",
    paymentMethod: "UPI",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.title.trim()) {
      setError("Please enter an expense title.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      setSaving(true);

      const data = await createExpense({
        title: form.title.trim(),
        amount: Number(form.amount),
        currency: "INR",
        category: form.category,
        paymentMethod: form.paymentMethod,
        date: form.date,
        description: form.description.trim(),
      });

      onExpenseAdded(data.expense);

      onClose();
    } catch (err) {
      console.error("Create expense failed:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create expense. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(8px)",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#111317",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "20px",
          boxShadow: "0 30px 100px rgba(0,0,0,0.55)",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "22px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.07)",
                color: "#fff",
              }}
            >
              <Receipt size={19} />
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#fff",
                  fontSize: "18px",
                }}
              >
                Add expense
              </h2>

              <p
                style={{
                  margin: "4px 0 0",
                  color: "#747c8c",
                  fontSize: "12px",
                }}
              >
                Record a new transaction
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              color: "#7e8695",
              cursor: "pointer",
              padding: "6px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          {error && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px 14px",
                borderRadius: "10px",
                background: "rgba(255,70,70,0.08)",
                border: "1px solid rgba(255,70,70,0.18)",
                color: "#ff9b9b",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          {/* TITLE */}

          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#aab1bf",
                fontSize: "13px",
              }}
            >
              Expense title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Zomato dinner"
              style={inputStyle}
            />
          </div>

          {/* AMOUNT */}

          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#aab1bf",
                fontSize: "13px",
              }}
            >
              Amount
            </label>

            <div style={{ position: "relative" }}>
              <IndianRupee
                size={16}
                style={iconStyle}
              />

              <input
                name="amount"
                type="number"
                min="1"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                }}
              />
            </div>
          </div>

          {/* CATEGORY + PAYMENT */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
              marginBottom: "18px",
            }}
          >
            <div>
              <label style={labelStyle}>
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={inputStyle}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>
                Payment method
              </label>

              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                style={inputStyle}
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DATE */}

          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>
              Date
            </label>

            <div style={{ position: "relative" }}>
              <CalendarDays
                size={16}
                style={iconStyle}
              />

              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                }}
              />
            </div>
          </div>

          {/* DESCRIPTION */}

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>
              Description
              <span
                style={{
                  color: "#555d6c",
                  marginLeft: "5px",
                }}
              >
                (optional)
              </span>
            </label>

            <div style={{ position: "relative" }}>
              <FileText
                size={16}
                style={{
                  ...iconStyle,
                  top: "17px",
                  transform: "none",
                }}
              />

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Add notes about this expense..."
                rows={3}
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                  resize: "vertical",
                }}
              />
            </div>
          </div>

          {/* BUTTONS */}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: "11px 18px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.09)",
                background: "transparent",
                color: "#aab1bf",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "11px 20px",
                borderRadius: "10px",
                border: "none",
                background: "#f4f4f4",
                color: "#111",
                fontWeight: "700",
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving
                ? "Saving..."
                : "Save expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.09)",
  background: "#0c0e11",
  color: "#fff",
  outline: "none",
  fontSize: "13px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "#aab1bf",
  fontSize: "13px",
};

const iconStyle = {
  position: "absolute",
  left: "14px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#697180",
};

export default AddExpenseModal;
