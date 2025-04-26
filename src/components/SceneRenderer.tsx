import React, { useState, Suspense, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import StickyNote from "./StickyNote";
// import ModelRenderer from "./ModelRenderer";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { modelPosition } from "three/tsl";
import {
  XR,
  createXRStore,
  noEvents,
  PointerEvents,
  IfInSessionMode,
} from "@react-three/xr";
import GlowingSphere from "./GlowingSphere";
import { Note } from "../types";
const store = createXRStore();

const ModelRenderer = React.memo(({ url }: { url: string }) => {
  console.log("ModelRenderer loading URL:", url);
  const { scene } = useGLTF(url);
  console.log("Model loaded successfully", scene);

  return <primitive object={scene} />;
});

interface StickyNoteData {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  content: string;
  imageUrl?: string;
}

interface StickyNoteData {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  content: string;
  imageUrl?: string;
}

interface StickyNoteProps {
  id: string;
  url: string;
  position: [number, number, number];
  content?: string;
  imageUrl?: string;
  isSelected: boolean;
  onSelect: () => void;
}

interface Note {
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  content?: string;
  imageUrl?: string;
}

const StickyNotesContainer = React.memo(
  ({
    notes,
    selectedNoteId,
    onSelectNote,
  }: {
    notes: Note[];
    selectedNoteId: string | null;
    onSelectNote: (id: string) => void;
  }) => {
    return (
      <>
        {notes.map((note, index) => (
          <group
            key={note.id}
            position={note.position}
            rotation={note.rotation}
          >
            <GlowingSphere
              id={note.id}
              position={note.position}
              position={note.position}
              content={note.content}
              imageUrl={note.imageUrl}
              isSelected={selectedNoteId === note.id}
              onSelect={() => onSelectNote(note.id)}
              onMove={onMoveNote}
              nextNotePosition={
                index < notes.length - 1 ? notes[index + 1].position : undefined
              }
              breathRate={1 + Math.sin(index * 13.37) * 0.7}
            />
          </group>
        ))}
      </>
    );
  }
);

interface SceneRendererProps {
  fileData: ArrayBuffer | null;
  stickyNotes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onAddNote: (note: Note) => void;
}

const SceneRenderer = React.memo(
  ({
    fileData,
    stickyNotes,
    selectedNoteId,
    onSelectNote,
    onAddNote,
  }: SceneRendererProps) => {
    //convert fileData to url
    const modelUrl = React.useMemo(() => {
      if (!fileData) {
        console.log("No fileData available");
        return null;
      }
      console.log("Creating URL from fileData, size:", fileData.byteLength);
      const blob = new Blob([fileData], { type: "model/gltf-binary" });
      const url = URL.createObjectURL(blob);
      console.log("Created model URL:", url);
      return url;
    }, [fileData]);

    //load model status mgmt
    const [modelsLoaded, setModelsLoaded] = useState(false);

    const handleModelsLoaded = useCallback(() => {
      setModelsLoaded(true);
    }, []);

    useEffect(() => {
      console.log(
        "SceneRenderer mounted, fileData:",
        fileData ? "exists" : "null"
      );
      console.log("modelUrl:", modelUrl);
    }, [fileData, modelUrl]);

    return (
      <>
        {" "}
        <div className="xr-buttons">
          <button onClick={() => store.enterVR()}>Enter VR</button>
        </div>
        {/* {!modelsLoaded && <div className="loading-overlay">加载中...</div>} */}
        <Canvas
          style={{
            width: "90vw",
            height: "80vh",
            borderRadius: "10px",
            position: "absolute",
            top: "10%",
          }}
          events={noEvents}
        >
          <XR store={store}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.1} />

              <OrbitControls
                maxDistance={6}
                minDistance={0.1}
                // target={[0, 0, 0]}
                // position={[-2, -2, -2]}
                // enableDamping={true}
                // dampingFactor={0.05}
              />
              {/* </IfInSessionMode> */}

              {/* <mesh>
          <XR store={store}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.1} />
              {/* <IfInSessionMode deny={["immersive-ar", "immersive-vr"]}> */}
              <OrbitControls
                maxDistance={6}
                minDistance={0.1}
                // target={[0, 0, 0]}
                // position={[-2, -2, -2]}
                // enableDamping={true}
                // dampingFactor={0.05}
              />
              {/* </IfInSessionMode> */}
              <PointerEvents />
              {modelUrl && (
                <>
                  <group position={[0, 1.3, 0]}>
                    {/* vr test y=1.3 */}
                    {/*regular y=-1 */}
                    <ModelRenderer url={modelUrl} />
                  </group>
                  {/* <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial color="red" />
                  </mesh> */}
                </>
              )}
              <StickyNotesContainer
                notes={stickyNotes}
                selectedNoteId={selectedNoteId}
                onSelectNote={onSelectNote}
              />
            </Suspense>
          </XR>
        </Canvas>
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.fileData === nextProps.fileData &&
      prevProps.selectedNoteId === nextProps.selectedNoteId &&
      prevProps.stickyNotes === nextProps.stickyNotes
    );
  }
);

export default SceneRenderer;
