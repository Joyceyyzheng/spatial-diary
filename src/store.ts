import { create } from 'zustand'

interface StoreState {
  noteContentOpened: boolean;
  setNoteContentOpened: (value: boolean) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
}

const useStore = create<StoreState>((set) => ({
  noteContentOpened: false,
  setNoteContentOpened: (value: boolean) => set({ noteContentOpened: value }),
  selectedNoteId: null,
  setSelectedNoteId: (id: string | null) => set({ selectedNoteId: id })
}))

export default useStore;