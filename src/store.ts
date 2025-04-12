import { create } from 'zustand'

interface StoreState {
  noteContentOpened: boolean;
  setNoteContentOpened: (value: boolean) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
  currentNoteIndex: number;
  setCurrentNoteIndex: (index: number) => void;
  totalNotes: number;
  setTotalNotes: (total: number) => void;
}

const useStore = create<StoreState>((set) => ({
  noteContentOpened: false,
  setNoteContentOpened: (value: boolean) => set({ noteContentOpened: value }),
  selectedNoteId: null,
  setSelectedNoteId: (id: string | null) => set({ selectedNoteId: id }),
  currentNoteIndex: 0,
  setCurrentNoteIndex: (index: number) => set({ currentNoteIndex: index }),
  totalNotes: 0,
  setTotalNotes: (total: number) => set({ totalNotes: total })
}))

export default useStore;