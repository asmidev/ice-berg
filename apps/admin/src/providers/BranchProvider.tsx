'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface BranchContextType {
  branchId: string;
  setBranchId: (id: string) => void;
  isReady: boolean;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [branchId, setBranchState] = useState<string>('all');
  const [isReady, setIsReady] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize from URL or LocalStorage
  useEffect(() => {
    const urlBranch = searchParams.get('branch_id');
    const localBranch = localStorage.getItem('branch_id');
    const initialBranch = urlBranch || localBranch || 'all';
    
    setBranchState(initialBranch);
    if (!localBranch) localStorage.setItem('branch_id', initialBranch);
    setIsReady(true);
  }, [searchParams, router, pathname]);

  // Update function that handles everything
  const setBranchId = (id: string) => {
    if (id === branchId && searchParams.get('branch_id') === id) return;
    
    setBranchState(id);
    localStorage.setItem('branch_id', id);
    
    const params = new URLSearchParams(window.location.search);
    params.set('branch_id', id);
    router.push(`${pathname}?${params.toString()}`);
    
    // Trigger a custom event for non-react or outside-context listeners
    window.dispatchEvent(new CustomEvent('branch-change', { detail: id }));
  };

  return (
    <BranchContext.Provider value={{ branchId, setBranchId, isReady }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
}
