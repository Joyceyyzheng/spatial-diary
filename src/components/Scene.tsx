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
import useStore from "../store";
import HomeIcon from "../assets/home-icon.svg";
import SaveIcon from "../assets/scene-save.svg";
import AddIcon from "../assets/stickynote-add.svg";
import AddDisabledIcon from "../assets/stickynote-add-disabled.svg";
import ViewIcon from "../assets/stickynote-view.svg";
import UploadIcon from "../assets/upload-icon.svg";
//index.css is the css file

interface NoteContentProps {
  noteId: string;
  onClose: () => void;
  onSave: (entries: NoteEntry[]) => void;
  initialEntries?: NoteEntry[];
  allNotes: StickyNoteData[];
  onNavigate: (noteId: string) => void;
  onDelete: (noteId: string) => void;
}

const ScenePage: React.FC = () => {
  const { sceneId } = useParams<{ sceneId: string }>(); // Use specific type for useParams
  const navigate = useNavigate();

  const [scene, setScene] = useState<{ id: string; name: string } | null>(null);
  const [sceneName, setSceneName] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    async function loadScene() {
      if (sceneId) {
        const storedScene = await getSceneById(sceneId);
        if (storedScene) {
          setScene(storedScene);
          setSceneName(storedScene.name);
          setIsSaved(true);
        }
      }
    }
    loadScene();
  }, [sceneId]);

  // 监听场景名称变化
  useEffect(() => {
    if (scene && scene.name !== sceneName) {
      setIsSaved(false);
    }
  }, [sceneName, scene]);

  const handleSaveScene = async () => {
    if (!sceneId) return;
    const newScene = { id: sceneId, name: sceneName || `Scene ${sceneId}` };
    await saveScene(newScene);
    setScene(newScene);
    setIsSaved(true);
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
  const { setNoteContentOpened, noteContentOpened } = useStore();

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
    if (!fileData) {
      alert("Add a 3D model first!");
      return;
    }
    const newNote: StickyNoteData = {
      id: uuidv4(),
      sceneId,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      entries: [],
    };

    const updatedNotes = [...stickyNotes, newNote];
    setStickyNotes(updatedNotes);

    await saveStickyNote(newNote);
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
    if (
      selectedNoteId === noteId &&
      window.confirm("Are you sure you want to delete it？")
    ) {
      await deleteStickyNote(noteId);
      const updated = stickyNotes.filter((note) => note.id !== noteId);
      setStickyNotes(updated);
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

  const handleNoteNavigation = (noteId: string) => {
    setSelectedNoteId(noteId);
    // 更新当前笔记的内容
    const note = stickyNotes.find((note) => note.id === noteId);
    if (note) {
      setNoteContentOpened(true);
    }
  };

  return (
    <div>
      {/* <div className="flex flex-row items-center min-h-20"> */}
      <div className="scene-header">
        <button
          className="scene-button home-button"
          onClick={() => navigate("/")}
        >
          <img src={HomeIcon} alt="home icon" />
          <span>Home</span>
        </button>
        <div className="file-upload-container">
          <input
            type="file"
            accept=".glb,.gltf,.ply"
            onChange={handleFileUpload}
            id="model-upload"
            className="hidden-file-input"
          />
          <label
            htmlFor="model-upload"
            className="custom-file-upload scene-button"
          >
            <img src={UploadIcon} alt="upload icon" />
            <span>{fileData ? "Replace 3D Model" : "Upload 3D Model"}</span>
          </label>
          {fileName && <span className="file-name">{fileName}</span>}
        </div>
        <input
          type="text"
          placeholder="Enter scene name"
          value={sceneName}
          onChange={(e) => setSceneName(e.target.value)}
          className={`scene-name-input ${sceneName ? "filled" : ""}`}
        />
        <button onClick={handleSaveScene} className="scene-button">
          <img src={SaveIcon} alt="save icon" />
          <span>{isSaved ? "Saved" : "Save Scene"}</span>
        </button>
      </div>
      <div className="sticky-note-buttons flex flex-row gap-4">
        <button
          className="sticky-note-add scene-button"
          onClick={addStickyNote}
        >
          <img src={fileData ? AddIcon : AddDisabledIcon} alt="add icon" />
        </button>
        <button
          className="sticky-note-view scene-button"
          onClick={() => {
            if (stickyNotes.length > 0) {
              setSelectedNoteId(stickyNotes[0].id);
              setNoteContentOpened(true);
            }
          }}
        >
          <img src={ViewIcon} alt="view icon" />
        </button>
      </div>
      {/* </div> */}
      <div>
        {/* <div className="sticky-notes-section">
          <ul className="sticky-notes-list">
            {stickyNotes.map((note, index) => (
              <li key={note.id}>
                <span>Note {index + 1}</span>
                <button
                  onClick={() => {
                    setSelectedNoteId(note.id);
                    setNoteContentOpened(true);
                  }}
                >
                  Open
                </button>
                <button onClick={() => deleteNote(note.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div> */}
        {/* <button className="scene-info" onClick={() => setShowInfo(true)}>
          Info
        </button> */}

        {showInfo && sceneId && (
          <SceneInfo sceneId={sceneId} onClose={() => setShowInfo(false)} />
        )}

        {selectedNoteId && (
          <StickyNoteControls
            selectedNoteId={selectedNoteId}
            onMoveNote={moveStickyNote}
            //onRotateNote={rotateStickyNote}
          />
        )}

        {selectedNoteId && noteContentOpened && (
          <NoteContent
            noteId={selectedNoteId}
            onClose={() => setNoteContentOpened(false)}
            onSave={handleNoteContentSave}
            initialEntries={
              stickyNotes.find((note) => note.id === selectedNoteId)?.entries ||
              []
            }
            allNotes={stickyNotes}
            onNavigate={handleNoteNavigation}
            onDelete={deleteNote}
          />
        )}

        <SceneRenderer
          fileData={fileData}
          stickyNotes={stickyNotes}
          selectedNoteId={selectedNoteId}
          onSelectNote={(noteId) => {
            if (noteId === selectedNoteId) {
              // setSelectedNoteId(null);
              setNoteContentOpened(true);
            } else {
              setSelectedNoteId(noteId);
              setNoteContentOpened(false);
            }
          }}
          onMoveNote={moveStickyNote}
        />
      </div>
    </div>
  );
};

export default ScenePage;
