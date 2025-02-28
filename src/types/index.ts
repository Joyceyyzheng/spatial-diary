export interface NoteEntry {
  id: string;
  timestamp: number;
  content?: string;
  imageUrl?: string;
  position?: [number, number, number];
}

export interface StickyNoteData {
  id: string;
  sceneId: string;
  position: [number, number, number];
  entries?: NoteEntry[];
}

export interface StickyNoteProps {
  id: string;
  url: string;
  position: [number, number, number];
  content?: string;
  imageUrl?: string;
  isSelected: boolean;
  onSelect: () => void;
  onMove?: (id: string, axis: "x" | "y" | "z", direction: "positive" | "negative") => void;
} 