import { openDB } from "idb";

const DB_NAME = "3DScenesDB";
const SCENES_STORE = "scenes";
const MODELS_STORE = "models";
const STICKY_NOTES_STORE = "stickyNotes";
// Initialize IndexedDB
async function initDB() {
  return await openDB(DB_NAME, 3, {
    upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          
          if (!db.objectStoreNames.contains(SCENES_STORE)) {
            db.createObjectStore(SCENES_STORE, { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains(MODELS_STORE)) {
            db.createObjectStore(MODELS_STORE, { keyPath: "sceneId" });
          }
        }
        if (oldVersion < 3) {
         
          if (!db.objectStoreNames.contains(STICKY_NOTES_STORE)) {
            const store = db.createObjectStore(STICKY_NOTES_STORE, { keyPath: "id" });
            store.createIndex("sceneId_idx", "sceneId");

          }
        }
      },
    });
  }

// Save a new scene
export async function saveScene(scene: { id: string; name: string }) {
  const db = await initDB();
  await db.put(SCENES_STORE, scene);
}

// Get all scenes
export async function getScenes() {
  const db = await initDB();
  return await db.getAll(SCENES_STORE);
}

// Get a scene by ID
export async function getSceneById(id: string) {
  const db = await initDB();
  return await db.get(SCENES_STORE, id);
}

export async function deleteScene(sceneId: string) {
    const db = await initDB();
    await db.delete("scenes", sceneId);
    await db.delete("models", sceneId); // Also delete associated models
  }


// Save a model file to IndexedDB
export async function saveModel(sceneId: string, file: File) {
    const db = await initDB();
  
    if (!db.objectStoreNames.contains(MODELS_STORE)) {
      console.error("Error: 'models' store does not exist.");
      return;
    }
  
    const arrayBuffer = await file.arrayBuffer(); // Convert file to binary
    await db.put(MODELS_STORE, { sceneId, model: arrayBuffer, name: file.name });
  }
  
  // Get a model by Scene ID
  export async function getModel(sceneId: string) {
    const db = await initDB();
    const modelData = await db.get(MODELS_STORE, sceneId);
    console.log("Retrieved model data:", modelData); 
    return modelData;
  }

//sticky notes

//   export async function saveStickyNotes(sceneId: string, notes: StickyNoteData[]) {
//     const db = await initDB();
//     await db.put("scenes", { id: sceneId, stickyNotes: notes });
//   }
  
//   export async function getStickyNotes(sceneId: string) {
//     const db = await initDB();
//     const sceneData = await db.get("scenes", sceneId);
//     return sceneData?.stickyNotes || [];
//   }



export interface StickyNoteData {
  id: string;
  sceneId: string; 
  position: [number, number, number]; 
  content?: string; 
  imageUrl?: string;
  entries?: NoteEntry[];
}

export async function saveStickyNote(note: StickyNoteData) {
    const db = await initDB();
    await db.put(STICKY_NOTES_STORE, note);
    console.log("Note saved to DB:", note);
  }

  export async function getStickyNotesBySceneId(sceneId: string): Promise<StickyNoteData[]> {
    const db = await initDB();
    const allNotes = await db.getAll(STICKY_NOTES_STORE);
    return allNotes.filter((note) => note.sceneId === sceneId);
    // return await db.getAllFromIndex("stickyNotes", "sceneId", sceneId);
  }

  export async function deleteStickyNote(noteId: string) {
    const db = await initDB();
    await db.delete("stickyNotes", noteId);
  }
  