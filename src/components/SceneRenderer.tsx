import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import StickyNote from "./StickyNote";
// import ModelRenderer from "./ModelRenderer";
import { useGLTF } from "@react-three/drei";

const ModelRenderer = React.memo(({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
});

const StickyNotesContainer = React.memo(
  ({
    notes,
    selectedNoteId,
    onSelectNote,
    onMoveNote,
  }: {
    notes: { id: string; position: [number, number, number] }[];
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
              url="/models/notes.glb"
              content={note.content}
              imageUrl={note.imageUrl}
              isSelected={selectedNoteId === note.id}
              onSelect={() => onSelectNote(note.id)}
              onMove={onMoveNote}
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
      <Canvas style={{ width: "90vw", height: "80vh" }}>
        <ambientLight intensity={0.5} />
        <OrbitControls maxDistance={6} minDistance={0.1} />
        {modelUrl && <ModelRenderer url={modelUrl} />}
        <StickyNotesContainer
          notes={stickyNotes}
          selectedNoteId={selectedNoteId}
          onSelectNote={onSelectNote}
          onMoveNote={onMoveNote}
        />
      </Canvas>
    );
  },
  (prevProps, nextProps) => {
    // 只有当这些属性真正改变时才重新渲染
    return (
      prevProps.fileData === nextProps.fileData &&
      prevProps.selectedNoteId === nextProps.selectedNoteId &&
      prevProps.stickyNotes === nextProps.stickyNotes
    );
  }
);

export default SceneRenderer;
