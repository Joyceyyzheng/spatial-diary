import React from "react";
import useStore from "../store";

interface StickyNoteControlsProps {
  selectedNoteId: string | null;
  onMoveNote: (
    id: string,
    axis: "x" | "y" | "z",
    direction: "positive" | "negative"
  ) => void;
  // onRotateNote: (
  //   id: string,
  //   axis: "x" | "y" | "z",
  //   direction: "positive" | "negative"
  // ) => void;
}

const StickyNoteControls: React.FC<StickyNoteControlsProps> = ({
  selectedNoteId,
  onMoveNote,
  // onRotateNote,
}) => {
  const noteContentOpened = useStore((state) => state.noteContentOpened);
  //keyboard movement
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!selectedNoteId || noteContentOpened) return;

      // if (event.shiftKey) {
      //   switch (event.key.toLowerCase()) {
      //     case "d":
      //       onRotateNote(selectedNoteId, "y", "positive");
      //       console.log("rotation happening ");
      //       break;
      //     case "a":
      //       onRotateNote(selectedNoteId, "y", "negative");
      //       break;
      //     case "w":
      //       onRotateNote(selectedNoteId, "x", "positive");
      //       break;
      //     case "s":
      //       onRotateNote(selectedNoteId, "x", "negative");
      //       break;
      //     case "e":
      //       onRotateNote(selectedNoteId, "z", "positive");
      //       break;
      //     case "q":
      //       onRotateNote(selectedNoteId, "z", "negative");
      //       break;
      //   }
      // } else {
      switch (event.key.toLowerCase()) {
        case "d":
          onMoveNote(selectedNoteId, "x", "positive");
          break;
        case "a":
          onMoveNote(selectedNoteId, "x", "negative");
          break;
        case "w":
          onMoveNote(selectedNoteId, "y", "positive");
          break;
        case "s":
          onMoveNote(selectedNoteId, "y", "negative");
          break;
        case "e":
          onMoveNote(selectedNoteId, "z", "positive");
          break;
        case "q":
          onMoveNote(selectedNoteId, "z", "negative");
          break;
        //}
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedNoteId, onMoveNote]);

  if (!selectedNoteId) return null;

  return (
    <div className="sticky-note-controls" style={{ marginTop: "10px" }}>
      <p>Move Selected Note</p>
      <button onClick={() => onMoveNote(selectedNoteId, "x", "negative")}>
        Left - A
      </button>
      <button onClick={() => onMoveNote(selectedNoteId, "x", "positive")}>
        Right - D
      </button>
      <button onClick={() => onMoveNote(selectedNoteId, "y", "positive")}>
        Up - W
      </button>
      <button onClick={() => onMoveNote(selectedNoteId, "y", "negative")}>
        Down - S
      </button>
      <button onClick={() => onMoveNote(selectedNoteId, "z", "negative")}>
        Backward - Q
      </button>
      <button onClick={() => onMoveNote(selectedNoteId, "z", "positive")}>
        Forward - E
      </button>
    </div>
  );
};

export default StickyNoteControls;
