'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, Upload, X, AlertCircle, CheckCircle2, 
  ArrowRight, Download, FileType, Table as TableIcon, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
  templateHeaders: string[];
  exampleData?: string[];
  title: string;
  description: string;
}

export function ImportExcelModal({ 
  isOpen, 
  onClose, 
  onImport, 
  templateHeaders,
  exampleData,
  title,
  description
}: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
        toast.error('Faqat Excel (.xlsx, .xls) yoki CSV fayllarini yuklash mumkin');
        return;
      }
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet);
      
      if (json.length === 0) {
        toast.error('Fayl bo\'sh');
        return;
      }

      setPreviewData(json);
      setStep(2);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadTemplate = () => {
    // 1-qator: Sarlavhalar
    // 2-qator: Yo'riqnoma (Instruction)
    // 3-qator: Misol (Example)
    const instructions = templateHeaders.map(() => "To'ldirish uchun yo'riqnoma");
    const dataRows = [templateHeaders];
    
    if (exampleData && exampleData.length > 0) {
      dataRows.push(exampleData);
    }

    const ws = XLSX.utils.aoa_to_sheet(dataRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `${title}_Template.xlsx`);
  };

  const submitImport = async () => {
    setLoading(true);
    try {
      await onImport(previewData);
      toast.success(`${previewData.length} ta ma'lumot muvaffaqiyatli import qilindi`);
      handleClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Import qilishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl shadow-slate-950/20 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
              <p className="text-sm text-slate-500 font-medium">{description}</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Upload Zone */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-[24px] p-12 flex flex-col items-center justify-center gap-4 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden" 
                    accept=".xlsx,.xls,.csv"
                  />
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-slate-900">Excel faylni yuklang</p>
                    <p className="text-sm text-slate-500 mt-1">Faylni shu yerga tashlang yoki bosing</p>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Shablon yuklab olish</h4>
                      <p className="text-xs text-slate-500 mt-1 mb-3">Xatolik bo'lmasligi uchun bizning shablondan foydalaning.</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleDownloadTemplate}
                        className="h-8 text-xs font-bold border-slate-200"
                      >
                        Shablonni yuklash
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Talablar</h4>
                      <ul className="text-xs text-slate-500 mt-1 space-y-1">
                        <li>• Sarlavhalar shablondagidek bo'lishi shart</li>
                        <li>• Bo'sh qatorlar import qilinmaydi</li>
                        <li>• Telefon raqamlari +998 bilan boshlanishi tavsiya etiladi</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                      {previewData.length}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Ma'lumotlar tekshirildi</h4>
                      <p className="text-xs text-slate-500 tracking-tight">Import qilishdan oldin ko'rib chiqing</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setStep(1)}
                    className="text-slate-500 hover:text-slate-900"
                  >
                    Faylni o'zgartirish
                  </Button>
                </div>

                {/* Table Preview */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                          {templateHeaders.map(h => (
                            <th key={h} className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 10).map((row, i) => (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            {templateHeaders.map(h => (
                              <td key={h} className="px-4 py-3 text-sm font-medium text-slate-700 truncate max-w-[200px]">
                                {row[h] || row[Object.keys(row).find(k => k.toLowerCase().includes(h.toLowerCase())) || h] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {previewData.length > 10 && (
                    <div className="px-4 py-3 bg-slate-50/50 text-center border-t border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Va yana {previewData.length - 10} ta qator...</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 bg-white flex items-center justify-end gap-3 sticky bottom-0 z-10">
          <Button 
            variant="ghost" 
            onClick={handleClose}
            className="rounded-xl font-bold text-slate-500"
          >
            Bekor qilish
          </Button>
          
          {step === 2 && (
            <Button 
              onClick={submitImport}
              disabled={loading}
              className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white min-w-[160px] shadow-lg shadow-emerald-600/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Tasdiqlash va Import <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
