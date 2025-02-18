import React from "react";

interface StickyNoteControlsProps {
  selectedNoteId: string | null;
  onMoveNote: (
    id: string,
    axis: "x" | "y" | "z",
    direction: "positive" | "negative"
  ) => void;
}

const StickyNoteControls: React.FC<StickyNoteControlsProps> = ({
  selectedNoteId,
  onMoveNote,
}) => {
  if (!selectedNoteId) return null;

  return (
    <div className="sticky-note-controls" style={{ marginTop: "10px" }}>
      <p>Move Selected Note</p>
      <button onClick={() => onMoveNote(selectedNoteId, "x", "negative")}>
        Left (-X)
      </button>
      <button onClick={() => onMoveNote(selectedNoteId, "x", "positive")}>
        Right (+X)
      </button>
      <button onClick={() => onMoveNote(selectedNoteId, "y", "positive")}>
        Up (+Y)
      </button>
      <button onClick={() => onMoveNote(selectedNoteId, "y", "negative")}>
        Down (-Y)
      </button>
      <button onClick={() => onMoveNote(selectedNoteId, "z", "negative")}>
        Backward (-Z)
      </button>
      <button onClick={() => onMoveNote(selectedNoteId, "z", "positive")}>
        Forward (+Z)
      </button>
    </div>
  );
};

export default StickyNoteControls;
