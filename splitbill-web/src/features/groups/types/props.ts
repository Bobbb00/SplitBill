import { Member, EditExpenseData, Expense } from "./index";
import { LucideIcon } from "lucide-react";

export interface CreateExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: number;
  members: Member[];
  currentUserId: number | null;
  editData?: EditExpenseData | null;
}

export interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface DashboardSummaryProps {
  groupId: number;
}

export interface SummaryCardProps {
  title: string;
  amount: number;
  description: string;
  Icon: LucideIcon;
  variant: "success" | "danger";
}

export interface ExpenseListProps {
  groupId: number;
  currentUserId: number | null;
  refreshKey: number;
  onEdit: (expense: Expense) => void;
}

export interface GroupCardProps {
  id: number;
  name: string;
  description: string;
}

export interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface MemberListProps {
  members: Member[];
  isAdmin: boolean;
  currentUserId: number | null;
  onRemoveMember: (memberId: number) => void;
  onLeaveGroup: () => void;
}

export interface UseExpenseFormProps {
  groupId: number;
  currentUserId: number | null;
  members: Member[];
  editData?: EditExpenseData | null;
  onSuccess: () => void;
  onClose: () => void;
}
