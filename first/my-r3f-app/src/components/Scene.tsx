import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  saveScene,
  getSceneById,
  saveModel,
  getModel,
  saveStickyNotes,
  getStickyNotes,
} from "../DB";
import { Canvas, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import StickyNote from "../components/StickyNote";
import { v4 as uuidv4 } from "uuid";

interface StickyNoteData {
  //⚠️what's this interface thing
  id: string;
  position: [number, number, number];
}

function ModelRenderer({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function ModelViewer({ fileData }: { fileData: ArrayBuffer | null }) {
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!fileData) return;

    console.log("Model data found, creating Blob...");

    try {
      const blob = new Blob([fileData], { type: "model/gltf-binary" });
      const url = URL.createObjectURL(blob);
      setModelUrl(url);
    } catch (error) {
      console.error("Error creating model URL:", error);
    }
  }, [fileData]);

  if (!modelUrl) return <p>Loading model...</p>;

  return (
    <>
      {" "}
      <ambientLight intensity={0.5} />
      <OrbitControls />
      <ModelRenderer url={modelUrl} />
    </>
  );
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

  //3d model
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);

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
      await saveModel(sceneId!, file);
      setFileData(await file.arrayBuffer());
    }
  };

  //sticky notes
  const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  //no re-render
  const stickyNotesRef = useRef<StickyNoteData[]>([]);

  // load sticky notes from IndexedDB once
  useEffect(() => {
    async function loadStickyNotes() {
      const storedNotes = await getStickyNotes(sceneId!);
      stickyNotesRef.current = storedNotes;
      setStickyNotes([...storedNotes]);
    }
    loadStickyNotes();
  }, [sceneId]);

  // Add new sticky note
  const addStickyNote = async () => {
    const newNote: StickyNoteData = {
      id: uuidv4(),
      position: [
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
      ] as [number, number, number],
    };

    stickyNotesRef.current = [...stickyNotesRef.current, newNote];

    setStickyNotes([...stickyNotesRef.current]);
    await saveStickyNotes(sceneId!, stickyNotesRef.current);
    // Force a re-render of the buttons, NOT the 3D scene
    setSelectedNoteId(newNote.id);
  };

  // Move sticky note in 3D space
  const moveStickyNote = async (
    id: string,
    axis: "x" | "y" | "z",
    direction: "positive" | "negative"
  ) => {
    stickyNotesRef.current = stickyNotesRef.current.map((note) =>
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
    setStickyNotes([...stickyNotesRef.current]);
    await saveStickyNotes(sceneId!, stickyNotesRef.current);
  };

  return (
    <div>
      {/* newly added  */}
      <div>
        <h1>Scene {sceneId}</h1>
        <button onClick={addStickyNote}>Add Sticky Note</button>
        <input type="file" accept=".glb,.gltf" onChange={handleFileUpload} />
        {/* Movement Buttons (UI Outside Canvas) */}
        {selectedNoteId && (
          <div style={{ marginTop: "10px" }}>
            <p>Move Selected Note</p>
            <button
              onClick={() => moveStickyNote(selectedNoteId, "x", "negative")}
            >
              Left (-X)
            </button>
            <button
              onClick={() => moveStickyNote(selectedNoteId, "x", "positive")}
            >
              Right (+X)
            </button>
            <button
              onClick={() => moveStickyNote(selectedNoteId, "y", "positive")}
            >
              Up (+Y)
            </button>
            <button
              onClick={() => moveStickyNote(selectedNoteId, "y", "negative")}
            >
              Down (-Y)
            </button>
            <button
              onClick={() => moveStickyNote(selectedNoteId, "z", "negative")}
            >
              Backward (-Z)
            </button>
            <button
              onClick={() => moveStickyNote(selectedNoteId, "z", "positive")}
            >
              Forward (+Z)
            </button>
          </div>
        )}
        <Canvas style={{ width: "90vw", height: "60vh" }}>
          <ambientLight intensity={0.5} />
          <OrbitControls />
          {/* Only render ModelRenderer if modelUrl exists */}
          {fileData && (
            <ModelRenderer
              url={URL.createObjectURL(
                new Blob([fileData], { type: "model/gltf-binary" })
              )}
            />
          )}
          {/* Render all sticky notes */}
          {stickyNotesRef.current.map((note) => (
            <StickyNote
              key={note.id}
              id={note.id}
              url="/models/notes.glb"
              position={note.position}
              isSelected={selectedNoteId === note.id}
              onSelect={() => setSelectedNoteId(note.id)}
              onMove={moveStickyNote}
            />
          ))}
        </Canvas>
      </div>
      {/* newly added  */}

      {/* <h1>{scene ? `Edit Scene: ${scene.name}` : "Create New Scene"}</h1> */}
      <input
        type="text"
        placeholder="Enter scene name"
        value={sceneName}
        onChange={(e) => setSceneName(e.target.value)}
      />
      <button onClick={handleSaveScene}>Save Scene</button>
      <button onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
}

export default ScenePage;
