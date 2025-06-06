interface ExpenseFormData {
  name: string;
  amount: string | number;
  date: string;
  category: string;
  notes?: string;
}

export default ExpenseFormData;