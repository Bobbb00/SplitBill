export interface Member {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

export interface SplitDetail {
  user_id: number;
  amount: number;
}

export interface EditExpenseData {
  id: number;
  description: string;
  amount: number;
  paid_by: number;
  category_id?: number;
  splits: SplitDetail[];
}

export interface ExpenseSplit {
  user_id: number;
  name: string;
  amount_owed: number;
  is_paid: boolean;
}

export interface Expense {
  id: number;
  group_id: number;
  paid_by: number;
  paid_by_name: string;
  description: string;
  amount: number;
  created_at: string;
  splits: ExpenseSplit[];
}

export * from "./props";
