import { z } from "zod";

export const expenseSchema = z.object({
  description: z.string().min(1, "Judul pengeluaran wajib diisi"),
  amount: z.number().min(1, "Total pengeluaran minimal Rp 1"),
  paid_by: z.number().min(1, "Pilih siapa yang membayar"),
  category_id: z.number().min(1, "Kategori Wajib dipilih"),
  splitMode: z.enum(["equal", "exact"]),
  selectedMembers: z.array(z.number()).min(1, "Pilih minimal 1 anggota untuk patungan"),
  exactAmounts: z.record(z.string(), z.string()).optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

