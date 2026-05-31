import { create } from 'zustand';

interface AIConsultantStore {
  isOpen: boolean;
  chatType: 'consultation' | 'chat';
  setIsOpen: (isOpen: boolean) => void;
  setChatType: (chatType: 'consultation' | 'chat') => void;
  openWith: (type: 'consultation' | 'chat') => void;
}

export const useAIConsultantStore = create<AIConsultantStore>((set) => ({
  isOpen: false,
  chatType: 'consultation',
  setIsOpen: (isOpen) => set({ isOpen }),
  setChatType: (chatType) => set({ chatType }),
  openWith: (type) => set({ isOpen: true, chatType: type }),
}));
