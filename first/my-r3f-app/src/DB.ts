import { openDB } from "idb";

const DB_NAME = "3DScenesDB";
const SCENES_STORE = "scenes";

// Initialize IndexedDB
async function initDB() {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(SCENES_STORE)) {
        db.createObjectStore(SCENES_STORE, { keyPath: "id" });
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


