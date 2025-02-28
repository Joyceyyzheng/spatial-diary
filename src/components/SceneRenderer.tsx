import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import StickyNote from "./StickyNote";
// import ModelRenderer from "./ModelRenderer";
import { useGLTF } from "@react-three/drei";
import { XR, createXRStore } from "@react-three/xr";

const store = createXRStore();

const ModelRenderer = React.memo(({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
});

interface Note extends StickyNoteData {
  url?: string;
}

const StickyNotesContainer = React.memo(
  ({
    notes,
    selectedNoteId,
    onSelectNote,
    onMoveNote,
  }: {
    notes: Note[];
    selectedNoteId: string | null;
    onSelectNote: (id: string) => void;
    onMoveNote: (
      id: string,
      axis: "x" | "y" | "z",
      direction: "positive" | "negative"
    ) => void;
  }) => {
    return (
      <>
        {notes.map((note) => (
          <group key={note.id} position={note.position}>
            {" "}
            <StickyNote
              id={note.id}
              position={note.position}
              url={note.url || defaultUrl}
              isSelected={selectedNoteId === note.id}
              onSelect={() => onSelectNote(note.id)}
              onMove={onMoveNote}
              // entries={note.entries}
            />
            <axesHelper args={[1]} />
          </group>
        ))}
      </>
    );
  }
);

interface SceneRendererProps {
  fileData: ArrayBuffer | null;
  stickyNotes: { id: string; position: [number, number, number] }[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onMoveNote: (
    id: string,
    axis: "x" | "y" | "z",
    direction: "positive" | "negative"
  ) => void;
}

const SceneRenderer = React.memo(
  ({
    fileData,
    stickyNotes,
    selectedNoteId,
    onSelectNote,
    onMoveNote,
  }: SceneRendererProps) => {
    //convert fileData to url
    const modelUrl = React.useMemo(() => {
      if (!fileData) return null;
      return URL.createObjectURL(
        new Blob([fileData], { type: "model/gltf-binary" })
      );
    }, [fileData]);

    return (
      <>
        {" "}
        <button onClick={() => store.enterAR()}>Enter AR</button>
        <Canvas style={{ width: "90vw", height: "80vh" }}>
          <XR store={store}>
            <ambientLight intensity={0.5} />
            <OrbitControls maxDistance={6} minDistance={0.1} />
            {modelUrl && <ModelRenderer url={modelUrl} />}
            <StickyNotesContainer
              notes={stickyNotes}
              selectedNoteId={selectedNoteId}
              onSelectNote={onSelectNote}
              onMoveNote={onMoveNote}
            />
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
