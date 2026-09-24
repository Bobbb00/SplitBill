import { Member, SplitDetail, EditExpenseData } from "../types";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, ExpenseFormData } from "../utils/expenseSchema";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import axios from "axios";
import { UseExpenseFormProps } from "../types";

export function useExpenseForm({
  groupId,
  currentUserId,
  members,
  editData,
  onSuccess,
  onClose,
}: UseExpenseFormProps): { 
  form: UseFormReturn<ExpenseFormData>; 
  onSubmit: (data: ExpenseFormData) => Promise<void>; 
  loading: boolean; 
  apiError: string;
  applyTax: boolean;
  setApplyTax: (val: boolean) => void;
  applyService: boolean;
  setApplyService: (val: boolean) => void;
} {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  
  // States for Auto Tax & Service
  const [applyTax, setApplyTax] = useState(false);
  const [applyService, setApplyService] = useState(false);
  const taxRate = 11; // 11% PPN
  const serviceRate = 5; // 5% SC

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: 0,
      paid_by: currentUserId || (members[0]?.user_id ?? 0),
      splitMode: "equal",
      selectedMembers: [],
      exactAmounts: {},
      category_id: 1, // default
    },
  });

  const { watch, setValue, reset } = form;
  const exactAmounts = watch("exactAmounts") || {};
  const selectedMembers = watch("selectedMembers") || [];
  const amount = watch("amount") || 0;
  const splitMode = watch("splitMode");

  useEffect(() => {
    if (editData) {
      setValue("description", editData.description);
      setValue("amount", editData.amount);
      setValue("paid_by", editData.paid_by);
      if (editData.category_id) {
          setValue("category_id", editData.category_id);
      }
      
      const selectedIds = editData.splits.map((s: SplitDetail) => s.user_id);
      setValue("selectedMembers", selectedIds);

      const numAmount = editData.amount;
      const count = selectedIds.length;
      let isEqual = true;

      if (count > 0) {
        const expectedEqual = Math.floor(numAmount / count);
        const remainder = numAmount - expectedEqual * count;
        for (let i = 0; i < count; i++) {
          const expected = i === 0 ? expectedEqual + remainder : expectedEqual;
          if (editData.splits[i].amount !== expected) {
            isEqual = false;
            break;
          }
        }
      }

      setValue("splitMode", isEqual ? "equal" : "exact");

      const amountsRecord: Record<string, string> = {};
      editData.splits.forEach((s: SplitDetail) => {
        amountsRecord[String(s.user_id)] = String(s.amount);
      });
      setValue("exactAmounts", amountsRecord);
    } else {
      if (currentUserId) {
         setValue("paid_by", currentUserId);
      }
      if (members && members.length > 0 && selectedMembers.length === 0) {
         setValue("selectedMembers", members.map(m => m.user_id));
      }
    }
  }, [editData, currentUserId, setValue, members]);

  // Auto calculate Grand Total when exactAmounts or checkboxes change
  useEffect(() => {
    if (splitMode === "exact" && (applyTax || applyService)) {
      let exactTotal = 0;
      selectedMembers.forEach(id => {
         exactTotal += parseFloat(exactAmounts[String(id)] || "0") || 0;
      });

      let serviceAmt = 0;
      let taxAmt = 0;

      if (applyService) serviceAmt = exactTotal * (serviceRate / 100);
      if (applyTax) taxAmt = (exactTotal + serviceAmt) * (taxRate / 100);

      const grandTotal = Math.round(exactTotal + serviceAmt + taxAmt);
      if (grandTotal !== amount) {
          setValue("amount", grandTotal, { shouldValidate: true });
      }
    }
  }, [applyTax, applyService, exactAmounts, splitMode, selectedMembers, setValue]); // omitted amount intentionally to avoid loops

  const onSubmit = async (data: ExpenseFormData) => {
    setLoading(true);
    setApiError("");

    try {
      const finalSplits: SplitDetail[] = [];
      let numAmount = data.amount;

      if (data.splitMode === "equal") {
        const count = data.selectedMembers.length;
        const splitAmount = Math.floor(numAmount / count);
        const remainder = numAmount - splitAmount * count;

        data.selectedMembers.forEach((id, index) => {
          finalSplits.push({
            user_id: id,
            amount: index === 0 ? splitAmount + remainder : splitAmount,
          });
        });
      } else {
        // EXACT MODE
        let exactTotal = 0;
        data.selectedMembers.forEach(id => {
           exactTotal += parseFloat(data.exactAmounts![String(id)] || "0") || 0;
        });

        const serviceAmt = applyService ? exactTotal * (serviceRate / 100) : 0;
        const taxAmt = applyTax ? (exactTotal + serviceAmt) * (taxRate / 100) : 0;
        const totalDiff = serviceAmt + taxAmt;

        data.selectedMembers.forEach((id) => {
          let base = parseFloat(data.exactAmounts![String(id)] || "0") || 0;
          let finalVal = base;
          
          if (exactTotal > 0 && totalDiff > 0) {
             const proportion = base / exactTotal;
             finalVal = Math.round(base + (proportion * totalDiff));
          }
          finalSplits.push({ user_id: id, amount: finalVal });
        });
        
        // fix rounding
        let sumSplits = finalSplits.reduce((acc, curr) => acc + curr.amount, 0);
        let expectedTotal = Math.round(exactTotal + totalDiff);
        
        // If they manually changed the Grand Total to be DIFFERENT than calculated, trust their grand total
        if (numAmount !== expectedTotal && !applyTax && !applyService) {
           expectedTotal = numAmount;
           const diff = numAmount - exactTotal;
           finalSplits.length = 0; // reset
           
           data.selectedMembers.forEach((id) => {
              let base = parseFloat(data.exactAmounts![String(id)] || "0") || 0;
              let finalVal = base;
              if (exactTotal > 0 && diff !== 0) {
                 const proportion = base / exactTotal;
                 finalVal = Math.round(base + (proportion * diff));
              }
              finalSplits.push({ user_id: id, amount: finalVal });
           });
           
           sumSplits = finalSplits.reduce((acc, curr) => acc + curr.amount, 0);
        }

        if (applyTax || applyService) { numAmount = expectedTotal; }

        if (sumSplits !== expectedTotal && finalSplits.length > 0) {
           finalSplits[0].amount += (expectedTotal - sumSplits);
        }
      }

      // Safety check: force numAmount to exactly match sum of splits to satisfy backend
      numAmount = finalSplits.reduce((acc, curr) => acc + curr.amount, 0);

      const payload = {
        description: data.description,
        amount: numAmount,
        category_id: data.category_id,
        paid_by: data.paid_by,
        splits: finalSplits,
      };

      if (editData) {
        await api.put(`/groups/${groupId}/expenses/${editData.id}`, payload);
      } else {
        await api.post(`/groups/${groupId}/expenses`, payload);
      }
      
      reset();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setApiError(
          err.response?.data?.message ||
            (editData
              ? "Gagal mengupdate pengeluaran"
              : "Gagal menambahkan pengeluaran"),
        );
      } else {
        setApiError("Terjadi kesalahan tidak terduga");
      }
    } finally {
      setLoading(false);
    }
  };

  return { 
    form, 
    onSubmit, 
    loading, 
    apiError,
    applyTax,
    setApplyTax,
    applyService,
    setApplyService 
  };
}
