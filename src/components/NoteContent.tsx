import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import AudioRecorder from "./AudioRecorder";
import "./AudioRecorder.css";
import ImageUploader from "./ImageUploader";
import "./ImageUploader.css";

interface NoteContentProps {
  noteId: string;
  onClose: () => void;
  onSave: (entries: NoteEntry[]) => void;
  initialEntries?: NoteEntry[];
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
}) => {
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [entries, setEntries] = useState<NoteEntry[]>(initialEntries);

  //audio
  const [audio, setAudio] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string>("");
  const [isAudioPlaying, setIsAudioPlaying] = useState<{
    [key: string]: boolean;
  }>({}); // 跟踪音频播放状态
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({}); // 引用音频元素

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

  // const handleImageChange = (imageUrl: string) => {
  //   setImage(imageUrl);
  // };

  // const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       const imageUrl = e.target?.result as string;
  //       setImage(imageUrl);
  //       // handleImageChange(imageUrl);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleImageReady = (imageUrl: string) => {
    setImage(imageUrl || null);
  };

  //audio handle
  // const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       const audioUrl = e.target?.result as string;
  //       setAudio(audioUrl);
  //       setAudioName(file.name);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

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

  return (
    <div className="note-content-popup">
      <div className="note-content-header">
        {/* <h3>Edit Note {noteId}</h3> */}
        <h3>Edit Note </h3>
        <button onClick={onClose}>Close</button>
      </div>

      <div className="note-content-body">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your note content..."
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
          {/* <div className="upload-section">
            <label htmlFor="audio-upload" className="upload-label">
              上传音频
            </label>
            <input
              id="audio-upload"
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="file-input"
            />
          </div> */}
        </div>

        {/* {audio && (
          <div className="audio-preview">
            <p>已选择音频: {audioName}</p>
            <audio controls src={audio} />
          </div>
        )} */}

        <button onClick={handleSave}>Save</button>

        <div className="note-history">
          {entries && entries.length > 0 ? (
            entries.map((entry, index) => (
              <div key={index} className="note-entry">
                <p>{entry.content || "(No content)"}</p>

                {entry.imageUrl && entry.imageUrl !== "" && (
                  <img
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
                        className="audio-toggle-button"
                      >
                        {isAudioPlaying[entry.id] ? "暂停" : "播放"}{" "}
                        {entry.audioName || "音频"}
                      </button>
                      <audio
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
      </div>
    </div>
  );
};

export default NoteContent;
