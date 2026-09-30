import { useEffect, useState } from "react";
import {
  X,
  Receipt,
  IndianRupee,
  CalendarDays,
  FileText,
} from "lucide-react";
import { updateExpense } from "../services/expenseService";

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

const formatDateForInput = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toISOString().split("T")[0];
};

const EditExpenseModal = ({ expense, onClose, onExpenseUpdated }) => {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Food & Dining",
    paymentMethod: "UPI",
    date: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title || "",
        amount: expense.amount || "",
        category: expense.category || "Food & Dining",
        paymentMethod: expense.paymentMethod || "UPI",
        date: formatDateForInput(expense.date),
        description: expense.description || "",
      });
    }
  }, [expense]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.title.trim()) {
      setError("Expense title is required.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    if (!formData.date) {
      setError("Please select a date.");
      return;
    }

    try {
      setLoading(true);

      const response = await updateExpense(expense._id, {
        title: formData.title.trim(),
        amount: Number(formData.amount),
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        date: formData.date,
        description: formData.description.trim(),
      });

      onExpenseUpdated(response.expense);
      onClose();
    } catch (err) {
      console.error("Update expense error:", err);

      setError(
        err.response?.data?.message ||
          "Something went wrong while updating the expense."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="expense-modal">
        <div className="modal-header">
          <div className="modal-title-section">
            <div className="modal-icon">
              <Receipt size={21} />
            </div>

            <div>
              <h2>Edit expense</h2>
              <p>Update your transaction details</p>
            </div>
          </div>

          <button className="modal-close" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            {error && (
              <div
                style={{
                  padding: "10px 12px",
                  marginBottom: "16px",
                  borderRadius: "8px",
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#f87171",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Expense title</label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Zomato dinner"
              />
            </div>

            <div className="form-group">
              <label>Amount</label>

              <div className="input-with-icon">
                <IndianRupee size={17} />

                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-row">

              <div className="form-group">
                <label>Category</label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Payment method</label>

                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="form-group">
              <label>Date</label>

              <div className="input-with-icon">
                <CalendarDays size={17} />

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Description <span>(optional)</span>
              </label>

              <div className="textarea-with-icon">
                <FileText size={17} />

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add notes about this expense..."
                  rows="3"
                />
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-button"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;