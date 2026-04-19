"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";

interface AssignDiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  onSuccess: () => void;
}

export function AssignDiscountDialog({ 
  open, 
  onOpenChange, 
  studentId, 
  onSuccess 
}: AssignDiscountDialogProps) {
  const [loading, setLoading] = useState(false);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState("");
  const [duration, setDuration] = useState("0"); // 0 means unlimited

  useEffect(() => {
    if (open) {
      fetchDiscounts();
    }
  }, [open]);

  const fetchDiscounts = async () => {
    try {
      const res = await api.get("/discounts");
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setDiscounts(data.filter((d: any) => d.is_active));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssign = async () => {
    if (!selectedDiscountId) return toast.error("Chegirmani tanlang");

    let expires_at = null;
    if (duration !== "0") {
      const date = new Date();
      date.setMonth(date.getMonth() + parseInt(duration));
      expires_at = date.toISOString();
    }

    try {
      setLoading(true);
      await api.post("/discounts/assign", {
        student_id: studentId,
        discount_id: selectedDiscountId,
        expires_at
      });
      toast.success("Chegirma muvaffaqiyatli biriktirildi");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-[16px] border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="px-8 py-6 bg-zinc-50/50 border-b border-zinc-100">
          <DialogTitle className="text-xl font-black text-zinc-900">
            Chegirma biriktirish
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[13px] font-bold text-zinc-600 ml-1">Mavjud chegirma turlari</Label>
              <Select 
                value={selectedDiscountId} 
                onValueChange={setSelectedDiscountId}
              >
                <SelectTrigger className="h-12 rounded-xl border-zinc-200">
                  <SelectValue placeholder="Chegirmani tanlang" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-200">
                  {discounts.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="py-3">
                      <div className="flex flex-col">
                        <span className="font-bold">{d.name}</span>
                        <span className="text-[10px] text-zinc-400">
                          {d.type === 'PERCENT' ? `${d.value}% chegirma` : `${Number(d.value).toLocaleString()} sum`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-bold text-zinc-600 ml-1">Amal qilish muddati</Label>
              <Select 
                value={duration} 
                onValueChange={setDuration}
              >
                <SelectTrigger className="h-12 rounded-xl border-zinc-200">
                  <SelectValue placeholder="Muddatni tanlang" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-200">
                  <SelectItem value="0">Cheksiz (doimiy)</SelectItem>
                  <SelectItem value="1">1 oy</SelectItem>
                  <SelectItem value="3">3 oy</SelectItem>
                  <SelectItem value="6">6 oy</SelectItem>
                  <SelectItem value="12">1 yil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100">
            <p className="text-[11px] font-bold text-pink-700 leading-relaxed">
              * Diqqat: Tanlangan chegirma ushbu o'quvchining moliya hisob-kitoblariga darhol ta'sir qiladi va belgilangan muddatdan keyin bekor bo'ladi.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="h-11 rounded-xl font-bold text-zinc-500 hover:text-zinc-900 px-6"
            >
              Bekor qilish
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={loading || !selectedDiscountId}
              className="h-11 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 shadow-sm shadow-pink-500/20"
            >
              {loading ? "Biriktirilmoqda..." : "Biriktirish"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
