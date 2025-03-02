import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  saveScene,
  getSceneById,
  saveModel,
  getModel,
  saveStickyNote,
  getStickyNotesBySceneId,
  deleteStickyNote,
} from "../DB";

import { v4 as uuidv4 } from "uuid";
import SceneRenderer from "../components/SceneRenderer";
import StickyNoteControls from "../components/StickyNoteControl";
import NoteContent from "../components/NoteContent";
import { StickyNoteData, NoteEntry } from "../types";
import SceneInfo from "./SceneInfo";

const ScenePage: React.FC = () => {
  const { sceneId } = useParams<{ sceneId: string }>(); // Use specific type for useParams
  const navigate = useNavigate();

  const [scene, setScene] = useState<{ id: string; name: string } | null>(null);
  const [sceneName, setSceneName] = useState<string>("");

  useEffect(() => {
    async function loadScene() {
      if (sceneId) {
        const storedScene = await getSceneById(sceneId);
        if (storedScene) {
          setScene(storedScene);
          setSceneName(storedScene.name);
        }
      }
    }
    loadScene();
  }, [sceneId]);

  const handleSaveScene = async () => {
    if (!sceneId) return;
    const newScene = { id: sceneId, name: sceneName || `Scene ${sceneId}` };
    await saveScene(newScene);
    setScene(newScene);
  };

  // Handle 3D model upload and data
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    async function loadModel() {
      if (!sceneId) return;
      const storedModel = await getModel(sceneId);
      if (storedModel) setFileData(storedModel.model);
    }
    loadModel();
  }, [sceneId]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      await saveModel(sceneId!, file);
      setFileData(await file.arrayBuffer());
    }
  };

  // Sticky Notes functionality
  const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [showNoteContent, setShowNoteContent] = useState<boolean>(false);

  // Load sticky notes from the DB
  useEffect(() => {
    async function loadStickyNotes() {
      if (sceneId) {
        const storedNotes = await getStickyNotesBySceneId(sceneId);
        setStickyNotes(storedNotes);
        console.log("Notes loaded from DB:", storedNotes);
      }
    }
    loadStickyNotes();
  }, [sceneId]);

  // add new sticky note
  const addStickyNote = async () => {
    if (!sceneId) return;
    const newNote: StickyNoteData = {
      id: uuidv4(),
      sceneId,
      position: [
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
      ] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      entries: [],
    };

    const updatedNotes = [...stickyNotes, newNote];
    setStickyNotes(updatedNotes);

    await saveStickyNote({ ...newNote, sceneId: sceneId });
    setSelectedNoteId(newNote.id);
  };

  // move sticky note in 3D space
  const moveStickyNote = async (
    id: string,
    axis: "x" | "y" | "z",
    direction: "positive" | "negative"
  ) => {
    const updatedNotes = stickyNotes.map((note) =>
      note.id === id
        ? {
            ...note,
            position: [
              note.position[0] +
                (axis === "x" ? (direction === "positive" ? 0.1 : -0.1) : 0),
              note.position[1] +
                (axis === "y" ? (direction === "positive" ? 0.1 : -0.1) : 0),
              note.position[2] +
                (axis === "z" ? (direction === "positive" ? 0.1 : -0.1) : 0),
            ],
          }
        : note
    );
    setStickyNotes(updatedNotes);

    const updatedNote = updatedNotes.find((note) => note.id === id);
    if (updatedNote) {
      await saveStickyNote({ ...updatedNote, sceneId: sceneId! });
      console.log("Note position saved:", updatedNote.position);
    }
  };

  //rotate sticky note
  const rotateStickyNote = async (
    id: string,
    axis: "x" | "y" | "z",
    direction: "positive" | "negative"
  ) => {
    const rotationAmount =
      (Math.PI / 32) * (direction === "positive" ? 50 : -50);
    console.log(rotationAmount);

    const updatedNotes = stickyNotes.map((note) => {
      if (note.id !== id) return note;

      const currentRotation = note.rotation || [0, 0, 0];

      return {
        ...note,
        rotation: [
          currentRotation[0] + (axis === "x" ? rotationAmount : 0),
          currentRotation[1] + (axis === "y" ? rotationAmount : 0),
          currentRotation[2] + (axis === "z" ? rotationAmount : 0),
        ] as [number, number, number],
      };
    });
    setStickyNotes(updatedNotes);

    const updatedNote = updatedNotes.find((note) => note.id === id);
    if (updatedNote) {
      await saveStickyNote({ ...updatedNote, sceneId: sceneId! });
    }
  };

  // delete sticky note
  const deleteNote = async (noteId: string) => {
    await deleteStickyNote(noteId);
    const updated = stickyNotes.filter((note) => note.id !== noteId);
    setStickyNotes(updated);
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
    }
  };

  const handleNoteContentSave = async (entries: NoteEntry[]) => {
    const updatedNotes = stickyNotes.map((note) =>
      note.id === selectedNoteId
        ? {
            ...note,
            entries,
          }
        : note
    );
    setStickyNotes(updatedNotes);

    const updatedNote = updatedNotes.find((note) => note.id === selectedNoteId);
    if (updatedNote) {
      console.log("Saving to DB:", updatedNote);
      await saveStickyNote({ ...updatedNote, sceneId: sceneId! });
    }
  };

  const [showInfo, setShowInfo] = useState(false);

  return (
    <div>
      <div className="scene-header">
        <div className="file-upload-container">
          <input
            type="file"
            accept=".glb,.gltf"
            onChange={handleFileUpload}
            id="model-upload"
            className="hidden-file-input"
          />
          <label htmlFor="model-upload" className="custom-file-upload button">
            {fileData ? "Replace 3D Model" : "Upload 3D Model"}
          </label>
          {fileName && <span className="file-name">{fileName}</span>}
        </div>
        <input
          type="text"
          placeholder="Enter scene name"
          value={sceneName}
          onChange={(e) => setSceneName(e.target.value)}
        />
        <button onClick={handleSaveScene}>Save Scene</button>
        <button className="home-button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
      <div>
        <div className="sticky-notes-section">
          <button onClick={addStickyNote}>Add Sticky Note</button>
          <ul className="sticky-notes-list">
            {stickyNotes.map((note, index) => (
              <li key={note.id}>
                <span>Note {index + 1}</span>
                <button onClick={() => deleteNote(note.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
        <button className="scene-info" onClick={() => setShowInfo(true)}>
          Info
        </button>

        {showInfo && sceneId && (
          <SceneInfo sceneId={sceneId} onClose={() => setShowInfo(false)} />
        )}

        {selectedNoteId && (
          <StickyNoteControls
            selectedNoteId={selectedNoteId}
            onMoveNote={moveStickyNote}
            onRotateNote={rotateStickyNote}
          />
        )}

        {selectedNoteId && showNoteContent && (
          <NoteContent
            noteId={selectedNoteId}
            onClose={() => setShowNoteContent(false)}
            onSave={handleNoteContentSave}
            initialEntries={
              stickyNotes.find((note) => note.id === selectedNoteId)?.entries ||
              []
            }
          />
        )}

        <SceneRenderer
          fileData={fileData}
          stickyNotes={stickyNotes}
          selectedNoteId={selectedNoteId}
          onSelectNote={(noteId) => {
            if (noteId === selectedNoteId) {
              // setSelectedNoteId(null);
              setShowNoteContent(true);
            } else {
              setSelectedNoteId(noteId);
              setShowNoteContent(false);
            }
          }}
          onMoveNote={moveStickyNote}
        />
      </div>
    </div>
  );
};

export default ScenePage;
