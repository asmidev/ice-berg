"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import api from "@/lib/api";

interface DiscountTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discount?: any;
  onSuccess: () => void;
}

export function DiscountTypeDialog({ 
  open, 
  onOpenChange, 
  discount, 
  onSuccess 
}: DiscountTypeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "PERCENT",
    value: 0,
    is_active: true
  });

  useEffect(() => {
    if (discount) {
      setFormData({
        name: discount.name,
        type: discount.type,
        value: Number(discount.value),
        is_active: discount.is_active
      });
    } else {
      setFormData({
        name: "",
        type: "PERCENT",
        value: 0,
        is_active: true
      });
    }
  }, [discount, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Nomini kriting");

    try {
      setLoading(true);
      await api.post("/discounts", {
        ...formData,
        id: discount?.id
      });
      toast.success(discount ? "Muvaffaqiyatli tahrirlandi" : "Yangi chegirma yaratildi");
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
      <DialogContent className="sm:max-w-[480px] rounded-[16px] border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="px-8 py-6 bg-zinc-50/50 border-b border-zinc-100">
          <DialogTitle className="text-xl font-black text-zinc-900">
            {discount ? "Chegirmani tahrirlash" : "Yangi chegirma turi"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-[13px] font-bold text-zinc-600 ml-1">Chegirma nomi</Label>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masalan: Grant 100% yoki Oila a'zosi"
              className="h-11 rounded-xl border-zinc-200 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[13px] font-bold text-zinc-600 ml-1">Turi</Label>
              <Select 
                value={formData.type} 
                onValueChange={(val) => setFormData({ ...formData, type: val as any })}
              >
                <SelectTrigger className="h-11 rounded-xl border-zinc-200">
                  <SelectValue placeholder="Tanlang" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-zinc-200">
                  <SelectItem value="PERCENT">Foiz (%)</SelectItem>
                  <SelectItem value="FIXED">Qat'iy summa (cash)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-bold text-zinc-600 ml-1">Qiymati</Label>
              <Input 
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                className="h-11 rounded-xl border-zinc-200 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold text-zinc-900">Aktiv holat</Label>
              <p className="text-xs text-zinc-500 font-medium">Ushbu chegirma o'quvchilarga biriktirilishi mumkin.</p>
            </div>
            <Switch 
              checked={formData.is_active}
              onCheckedChange={(val) => setFormData({ ...formData, is_active: val })}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="h-11 rounded-xl font-bold text-zinc-500 hover:text-zinc-900 px-6"
            >
              Bekor qilish
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="h-11 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 shadow-sm shadow-pink-500/20"
            >
              {loading ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
