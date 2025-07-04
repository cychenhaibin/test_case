import { create } from 'zustand';

interface ApiNameState {
  apiNameList: string[];
  setApiNameList: (list: string[]) => void;
  originalCaseData: any[];
  setOriginalCaseData: (data: any[]) => void;
}

export const useApiNameStore = create<ApiNameState>(set => ({
  apiNameList: [],
  setApiNameList: (list) => set({ apiNameList: list }),
  originalCaseData: [],
  setOriginalCaseData: (data) => set({ originalCaseData: data }),
}));