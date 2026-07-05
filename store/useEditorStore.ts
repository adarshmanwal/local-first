import { create } from 'zustand';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import debounce from 'lodash.debounce';

interface SyncQueueItem {
  docId: string;
  content: string;
  timestamp: number;
}

interface EditorState {
  docId: string | null;
  content: string;
  isSyncing: boolean;
  initDocument: (id: string) => Promise<void>;
  fetchServerState: (id: string) => Promise<void>;
  updateContent: (newContent: string) => void;
  triggerSync: () => Promise<void>;
  restoreVersion: (versionId: string) => Promise<void>;
}

export const useEditorStore = create<EditorState>((set, get) => {
  const debouncedSync = debounce(() => {
    get().triggerSync();
  }, 500);

  return {
    docId: null,
    content: '',
    isSyncing: false,

    // 1. Instantly load from IndexedDB without network blocking
    initDocument: async (id) => {
      const localDoc = await idbGet(`doc_${id}`);
      set({
        docId: id,
        content: localDoc || '' // Instantly set local or empty
      });
    },

    // 2. Safely fetch remote changes in background
    fetchServerState: async (id) => {
      try {
        const response = await fetch(`/api/documents/${id}`);
        if (!response.ok) return;
        
        const serverData = await response.json();
        const remoteContent = serverData.document?.content || '';

        // Safely check if the user has pending offline edits for THIS document
        const queue: SyncQueueItem[] = (await idbGet('sync_queue')) || [];
        const hasPendingEdits = queue.some(op => op.docId === id);

        // ONLY overwrite local state if the user hasn't made offline changes
        // otherwise, we respect the user's offline work!
        if (!hasPendingEdits) {
          const currentLocal = await idbGet(`doc_${id}`);
          if (currentLocal !== remoteContent) {
            await idbSet(`doc_${id}`, remoteContent);
            // If the user is actively viewing this document, update UI
            if (get().docId === id) {
              set({ content: remoteContent });
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch server state in background:", error);
      }
    },

    updateContent: async (newContent) => {
      const { docId } = get();
      if (!docId) return;

      set({ content: newContent });
      await idbSet(`doc_${docId}`, newContent);

      const queue: SyncQueueItem[] = (await idbGet('sync_queue')) || [];
      queue.push({
        docId,
        content: newContent,
        timestamp: Date.now(),
      });
      await idbSet('sync_queue', queue);

      debouncedSync();
    },

    restoreVersion: async (versionId) => {
      set({ isSyncing: true });
      try {
        const response = await fetch('/api/versions/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ versionId })
        });

        if (!response.ok) throw new Error('Failed to restore');

        const data = await response.json();
        set({ content: data.content });

        const { docId } = get();
        if (docId) {
          await idbSet(`doc_${docId}`, data.content);
        }
      } catch (error) {
        console.error("Error restoring version:", error);
      } finally {
        set({ isSyncing: false });
      }
    },

    triggerSync: async () => {
      const { docId } = get();
      if (!docId) return;

      set({ isSyncing: true });
      try {
        const queue: SyncQueueItem[] = (await idbGet('sync_queue')) || [];
        
        // Fix: ONLY grab operations for the currently active document
        const docOperations = queue.filter(op => op.docId === docId);
        
        if (docOperations.length === 0) {
          set({ isSyncing: false });
          return;
        }

        // Grab the most recent edit for this document (Last Write Wins)
        const latestOp = docOperations[docOperations.length - 1];

        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(latestOp)
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        // Fix: Keep operations for OTHER documents, only remove the synced document's ops
        const remainingQueue = queue.filter(op => op.docId !== docId);
        await idbSet('sync_queue', remainingQueue);

      } catch (error) {
        console.error("Sync failed, keeping data in IndexedDB queue for next try:", error);
      } finally {
        set({ isSyncing: false });
      }
    }
  };
});