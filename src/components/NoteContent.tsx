import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import AudioRecorder from "./AudioRecorder";
import "./AudioRecorder.css";
import ImageUploader from "./ImageUploader";
import "./ImageUploader.css";
import useStore from "../store";
import "./NoteContent.css";
import Close from "../assets/note-content-close.svg";
import Move from "../assets/note-content-move.svg";
import Delete from "../assets/note-content-delete.svg";
import Edit from "../assets/note-content-edit.svg";
import Save from "../assets/note-content-save.svg";
import Play from "../assets/note-entry-audio-play.svg";
import Pause from "../assets/note-entry-audio-pause.svg";
import Prev from "../assets/note-prev.svg";
import Next from "../assets/note-next.svg";

interface NoteContentProps {
  noteId: string;
  onClose: () => void;
  onSave: (entries: NoteEntry[]) => void;
  initialEntries?: NoteEntry[];
  allNotes: StickyNoteData[];
  onNavigate: (noteId: string) => void;
  onDelete: (noteId: string) => void;
}
interface NoteEntry {
  id: string;
  timestamp: number;
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  audioName?: string;
}
const NoteContent: React.FC<NoteContentProps> = ({
  noteId,
  onClose,
  onSave,
  initialEntries = [],
  allNotes,
  onNavigate,
  onDelete,
}) => {
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [entries, setEntries] = useState<NoteEntry[]>(initialEntries);

  //audio
  const [audio, setAudio] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string>("");
  const [isAudioPlaying, setIsAudioPlaying] = useState<{
    [key: string]: boolean;
  }>({}); // 跟踪音频播放状态
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({}); // 引用音频元素

  // 从 store 获取导航相关的状态
  const currentNoteIndex = useStore((state) => state.currentNoteIndex);
  const totalNotes = useStore((state) => state.totalNotes);
  const setSelectedNoteId = useStore((state) => state.setSelectedNoteId);
  const setCurrentNoteIndex = useStore((state) => state.setCurrentNoteIndex);
  const setNoteContentOpened = useStore((state) => state.setNoteContentOpened);
  const [editSection, setEditSection] = useState(false);

  const handleMoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNoteId(null);
    setTimeout(() => {
      setSelectedNoteId(noteId);
    }, 0);
    setNoteContentOpened(false);
    onClose();
  };

  useEffect(() => {
    if (JSON.stringify(entries) !== JSON.stringify(initialEntries)) {
      setEntries(initialEntries);
      // console.log("Entries updated:", entries);
    }
  }, [initialEntries]);
  useEffect(() => {
    console.log("Entries updated:", entries);
    console.log("Entries to render:", entries);
  }, [entries]);

  useEffect(() => {
    // 当 noteId 改变时，重新加载笔记内容
    setEntries(initialEntries);
    setContent(""); // 清空编辑框
    setImage(null);
    setAudio(null);
    setAudioName("");
  }, [noteId, initialEntries]);

  const handleImageReady = (imageUrl: string) => {
    setImage(imageUrl || null);
  };

  // 处理音频就绪（从AudioRecorder组件）
  const handleAudioReady = (audioUrl: string, name: string) => {
    setAudio(audioUrl || null);
    setAudioName(name);
  };

  // 播放/暂停音频
  const toggleAudio = (audioUrl: string, entryId: string) => {
    const audioElement = audioRefs.current[entryId];

    if (audioElement) {
      if (isAudioPlaying[entryId]) {
        audioElement.pause();
      } else {
        audioElement.play();
      }

      setIsAudioPlaying((prev) => ({
        ...prev,
        [entryId]: !prev[entryId],
      }));
    }
  };

  const handleSave = async () => {
    if (!content && !image && !audio) return;

    const newEntry: NoteEntry = {
      id: uuidv4(), // 添加唯一ID
      timestamp: Date.now(),
      content,
      imageUrl: image || undefined,
      audioUrl: audio || undefined,
      audioName: audio ? audioName : undefined,
    };

    const updatedEntries = [...entries, newEntry]; // add new entry
    setEntries(updatedEntries);
    onSave(updatedEntries);
    setContent("");
    setImage(null);
    setAudio(null);
    setAudioName("");
  };

  const handlePrevNote = () => {
    const currentIndex = allNotes.findIndex((note) => note.id === noteId);
    if (currentIndex > -1) {
      const prevIndex = (currentIndex - 1 + allNotes.length) % allNotes.length;
      const prevNote = allNotes[prevIndex];
      onNavigate(prevNote.id);
    }
  };

  const handleNextNote = () => {
    const currentIndex = allNotes.findIndex((note) => note.id === noteId);
    if (currentIndex > -1) {
      const nextIndex = (currentIndex + 1) % allNotes.length;
      const nextNote = allNotes[nextIndex];
      onNavigate(nextNote.id);
    }
  };

  return (
    <div className="note-content-modal">
      <div className="note-content-popup">
        <div className="note-content-header">
          {/* <h3>Edit Note {noteId}</h3> */}
          <button className="note-content-close" onClick={onClose}>
            <img src={Close} alt="close icon" />
          </button>
          {/* <h3>Edit Note </h3> */}
          <div className="note-content-buttons">
            <button className="note-content-move" onClick={handleMoveClick}>
              <img src={Move} alt="move icon" />
            </button>
            <button
              className="note-content-delete"
              onClick={() => {
                onDelete(noteId);
                onClose();
              }}
            >
              <img src={Delete} alt="delete icon" />
            </button>
            <button
              className="note-content-edit"
              onClick={() => {
                if (editSection) {
                  handleSave();
                  setEditSection(false);
                } else {
                  setEditSection(true);
                }
              }}
            >
              {!editSection ? (
                <img src={Edit} alt="edit icon" />
              ) : (
                <img src={Save} alt="save icon" />
              )}
              {/* <img src={Edit} alt="edit icon" /> */}
            </button>
          </div>
        </div>
        {editSection && (
          <>
            {" "}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="I remember at here that..."
              className="note-content-input"
            />
            {/* <input type="file" accept="image/*" onChange={handleImageUpload} /> */}
            <div className="upload-controls">
              <div className="media-upload-section">
                {/* 使用新的ImageUploader组件 */}
                <ImageUploader
                  onImageReady={handleImageReady}
                  existingImage={image}
                />

                {/* 使用AudioRecorder组件 */}
                <AudioRecorder
                  onAudioReady={handleAudioReady}
                  existingAudio={audio ? { url: audio, name: audioName } : null}
                />
              </div>
            </div>
          </>
        )}
        <div className="note-content-body">
          {/* <button onClick={handleSave}>Save</button> */}

          <div className="note-history">
            {entries && entries.length > 0 ? (
              entries.map((entry, index) => (
                <div key={entry.id || `entry-${index}`} className="note-entry">
                  <div className="note-entry-header">
                    <span className="note-entry-time">
                      {new Date(entry.timestamp).toLocaleString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p>{entry.content || ""}</p>

                  {entry.imageUrl && entry.imageUrl !== "" && (
                    <img
                      key={`image-${entry.id}`}
                      src={entry.imageUrl}
                      alt={`Note ${index + 1}`}
                      style={{ maxWidth: "100%", marginTop: "10px" }}
                      onError={(e) => (e.currentTarget.style.display = "none")} // 处理无效图片
                    />
                  )}

                  {entry.audioUrl && (
                    <div className="entry-audio">
                      <div className="audio-player">
                        <button
                          onClick={() => toggleAudio(entry.audioUrl!, entry.id)}
                          className="audio-toggle-button flex flex-row gap-1"
                        >
                          {isAudioPlaying[entry.id] ? (
                            <img src={Pause} alt="pause icon" />
                          ) : (
                            <img src={Play} alt="play icon" />
                          )}{" "}
                          {entry.audioName || "Audio"}
                        </button>
                        <audio
                          key={`audio-${entry.id}`}
                          ref={(el) => (audioRefs.current[entry.id] = el)}
                          src={entry.audioUrl}
                          onEnded={() =>
                            setIsAudioPlaying((prev) => ({
                              ...prev,
                              [entry.id]: false,
                            }))
                          }
                          style={{ display: "none" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No previous entries.</p>
            )}
          </div>

          {/* 修改导航控制部分 */}
          <div className="note-navigation">
            <button onClick={handlePrevNote} disabled={allNotes.length <= 1}>
              <img src={Prev} alt="prev" />
            </button>

            <span className="note-counter">
              {allNotes.findIndex((note) => note.id === noteId) + 1} /{" "}
              {allNotes.length}
            </span>

            <button onClick={handleNextNote} disabled={allNotes.length <= 1}>
              <img src={Next} alt="next" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteContent;
