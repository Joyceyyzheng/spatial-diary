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

interface StickyNoteData {
  id: string;
  position: [number, number, number];
  entries?: NoteEntry[];
}

function ScenePage() {
  const { sceneId } = useParams(); // Get dynamic route ID
  const navigate = useNavigate();
  const [scene, setScene] = useState<{ id: string; name: string } | null>(null);
  const [sceneName, setSceneName] = useState("");

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

  //   //3d model
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    async function loadModel() {
      const storedModel = await getModel(sceneId!);
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

  //sticky notes
  const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  //no re-render
  //  const stickyNotesRef = useRef<StickyNoteData[]>([]);
  const [showNoteContent, setShowNoteContent] = useState<boolean>(false);

  // load sticky notes from IndexedDB once
  useEffect(() => {
    async function loadStickyNotes() {
      const storedNotes = await getStickyNotesBySceneId(sceneId!);
      //   stickyNotesRef.current = storedNotes;
      //   setStickyNotes([...storedNotes]);
      setStickyNotes(storedNotes);
      console.log("Notes loaded from DB:", storedNotes);
    }
    loadStickyNotes();
  }, [sceneId, selectedNoteId]);

  // Add new sticky note
  const addStickyNote = async () => {
    //⚠️ give center position instead of random
    const newNote: StickyNoteData = {
      id: uuidv4(),
      sceneId: sceneId!,
      position: [
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
      ] as [number, number, number],
    };

    // stickyNotesRef.current = [...stickyNotesRef.current, newNote];
    // setStickyNotes([...stickyNotesRef.current]);

    const updatedNotes = [...stickyNotes, newNote];
    setStickyNotes(updatedNotes);

    await saveStickyNote({ ...newNote, sceneId: sceneId! });
    // await saveStickyNote(sceneId!, stickyNotesRef.current);
    // Force a re-render of the buttons, NOT the 3D scene
    setSelectedNoteId(newNote.id);
  };

  // Move sticky note in 3D space
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

  //delete sticky notes
  const deleteNote = async (noteId: string) => {
    await deleteStickyNote(noteId);
    // setStickyNotes(stickyNotes.filter((note) => note.id !== noteId));
    // setStickyNotes((prev) => prev.filter((note) => note.id !== noteId));

    const updated = stickyNotes.filter((note) => note.id !== noteId);
    setStickyNotes(updated);
    // stickyNotesRef.current = updated;

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
        </div>{" "}
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
        {/* <h1>Scene {sceneId}</h1> */}
        <div className="sticky-notes-section">
          <button onClick={addStickyNote}>Add Sticky Note</button>
          <ul className="sticky-notes-list">
            {stickyNotes.map((note, index) => (
              <li key={note.id}>
                {/* <span>Note {note.id}</span> */}
                <span>Note {index + 1}</span>
                <button onClick={() => deleteNote(note.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>

        {/* <input type="file" accept=".glb,.gltf" onChange={handleFileUpload} /> */}

        {selectedNoteId && (
          <StickyNoteControls
            selectedNoteId={selectedNoteId}
            onMoveNote={moveStickyNote}
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
              setSelectedNoteId(null);
              setShowNoteContent(true);
            } else {
              setSelectedNoteId(noteId);
            }
          }}
          onMoveNote={moveStickyNote}
        />
      </div>
    </div>
  );
}

export default ScenePage;
