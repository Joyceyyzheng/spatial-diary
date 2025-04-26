import React from "react";
import useStore from "../store";
import "./StickyNoteControl.css";
import Up from "../assets/control-up.svg";
import Down from "../assets/control-down.svg";
import Left from "../assets/control-left.svg";
import Right from "../assets/control-right.svg";
import Zup from "../assets/control-z-up.svg";
import ZDown from "../assets/control-z-down.svg";

interface StickyNoteControlsProps {
  selectedNoteId: string | null;
  onMoveNote: (
    noteId: string,
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
  const setSelectedNoteId = useStore((state) => state.setSelectedNoteId);
  const [isVisible, setIsVisible] = React.useState(true);
  //const isVisible = selectedNoteId !== null;
  //console.log("selectedNoteId:", selectedNoteId, "isVisible:", isVisible);

  // 当选择新的便签时，显示控制面板
  React.useEffect(() => {
    if (selectedNoteId != null && !noteContentOpened) {
      setIsVisible(true);
    }
  }, [selectedNoteId, noteContentOpened]);

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
        case "arrowright":
          onMoveNote(selectedNoteId, "x", "positive");
          break;
        case "a":
        case "arrowleft":
          onMoveNote(selectedNoteId, "x", "negative");
          break;
        case "w":
        case "arrowup":
          onMoveNote(selectedNoteId, "y", "positive");
          break;
        case "s":
        case "arrowdown":
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

  return (
    <div className={`sticky-note-controls ${!isVisible ? "hidden" : ""}`}>
      <button
        className="close-controls"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedNoteId(null);
          setIsVisible(false);
        }}
      >
        ×
      </button>
      {/* <p>Move Selected Note</p> */}

      <button
        className="move-up control-button"
        onClick={() => onMoveNote(selectedNoteId!, "y", "positive")}
      >
        <img src={Up} alt="up" />
      </button>
      <button
        className="move-down control-button"
        onClick={() => onMoveNote(selectedNoteId!, "y", "negative")}
      >
        <img src={Down} alt="down" />
      </button>
      <button
        className="move-left control-button"
        onClick={() => onMoveNote(selectedNoteId!, "x", "negative")}
      >
        <img src={Left} alt="left" />
      </button>
      <button
        className="move-right control-button"
        onClick={() => onMoveNote(selectedNoteId!, "x", "positive")}
      >
        <img src={Right} alt="right" />
      </button>
      <button
        className="move-up-z control-button"
        onClick={() => onMoveNote(selectedNoteId!, "z", "positive")}
      >
        <img src={Zup} alt="z-up" />
      </button>
      <button
        className="move-down-z control-button"
        onClick={() => onMoveNote(selectedNoteId!, "z", "negative")}
      >
        <img src={ZDown} alt="z-down" />
      </button>
      <span className="control-text">
        You can also use WASDQE to move the memory!
      </span>
    </div>
  );
};

export default StickyNoteControls;
