import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

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

  const handleImageChange = (imageUrl: string) => {
    setImage(imageUrl);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImage(imageUrl);
        // handleImageChange(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!content && !image) return;

    const newEntry: NoteEntry = {
      content,
      imageUrl: image,
    };

    const updatedEntries = [...entries, newEntry]; // add new entry
    setEntries(updatedEntries);
    onSave(updatedEntries);
    setContent("");
    setImage(null);
  };

  return (
    <div className="note-content-popup">
      <div className="note-content-header">
        <h3>Edit Note {noteId}</h3>
        <button onClick={onClose}>Close</button>
      </div>

      <div className="note-content-body">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your note content..."
        />
        <input type="file" accept="image/*" onChange={handleImageUpload} />
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
