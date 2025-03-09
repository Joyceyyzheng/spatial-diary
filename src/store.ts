import { create } from 'zustand'

interface StoreState {
  noteContentOpened: boolean;
  setNoteContentOpened: (value: boolean) => void;
}

const useStore = create<StoreState>((set) => ({
  noteContentOpened: false,
  setNoteContentOpened: (value: boolean) => set({ noteContentOpened: value })
}))

export default useStore;