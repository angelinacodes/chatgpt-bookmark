// chatgptBookmarks.js

// Open (or create) the IndexedDB database
function openBookmarksDB(callback) {
  const request = indexedDB.open("chatgpt-bookmarks", 1);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    // Create object store with keyPath = id (e.g., "abc123:5")
    const store = db.createObjectStore("bookmarks", { keyPath: "id" });

    // Create an index to query all bookmarks by conversationId
    store.createIndex("by_conversation", "conversationId");
  };

  request.onsuccess = (event) => {
    const db = event.target.result;
    callback(db);
  };

  request.onerror = (event) => {
    console.error("Failed to open DB", event.target.error);
  };
}

// Generate default bookmark name like "Bookmark 1", "Bookmark 2", etc.
function getNextBookmarkName(db, conversationId, callback) {
  const tx = db.transaction("bookmarks", "readonly");
  const store = tx.objectStore("bookmarks");
  const index = store.index("by_conversation");

  const request = index.getAll(IDBKeyRange.only(conversationId));

  request.onsuccess = () => {
    const count = request.result.length;
    callback(`Bookmark ${count + 1}`);
  };

  request.onerror = () => {
    callback("Bookmark 1"); // fallback
  };
}

// Save a bookmark (auto-generates name if not provided)
function saveBookmark(db, { conversationId, turnIndex, name }) {
  const id = `${conversationId}:${turnIndex}`;

  if (name) {
    const tx = db.transaction("bookmarks", "readwrite");
    const store = tx.objectStore("bookmarks");

    store.put({
      id,
      conversationId,
      turnIndex,
      name,
      createdAt: Date.now(),
    });

    tx.oncomplete = () =>
      console.log("Bookmark saved:", name, conversationId, turnIndex);
  } else {
    getNextBookmarkName(db, conversationId, (autoName) => {
      const tx = db.transaction("bookmarks", "readwrite");
      const store = tx.objectStore("bookmarks");

      store.put({
        id,
        conversationId,
        turnIndex,
        name: autoName,
        createdAt: Date.now(),
      });

      tx.oncomplete = () =>
        console.log("Bookmark saved:", autoName, conversationId, turnIndex);
    });
  }
}

// Fetch all bookmarks for a conversation
function getBookmarksForConversation(db, conversationId, callback) {
  const tx = db.transaction("bookmarks", "readonly");
  const store = tx.objectStore("bookmarks");
  const index = store.index("by_conversation");

  const request = index.getAll(IDBKeyRange.only(conversationId));
  request.onsuccess = () => {
    callback(request.result);
  };
  request.onerror = () => {
    callback([]);
  };
}

// Update the name of an existing bookmark
function updateBookmarkName(db, id, newName) {
  const tx = db.transaction("bookmarks", "readwrite");
  const store = tx.objectStore("bookmarks");

  const request = store.get(id);
  request.onsuccess = () => {
    const data = request.result;
    if (data) {
      data.name = newName;
      store.put(data);
      console.log("Bookmark name updated to:", newName);
    }
  };
}

// Log all bookmarks in the database
function logAllBookmarks() {
  openBookmarksDB((db) => {
    const tx = db.transaction("bookmarks", "readonly");
    const store = tx.objectStore("bookmarks");
    const request = store.getAll();

    request.onsuccess = () => {
      const bookmarks = request.result;
      console.log("All saved bookmarks:", bookmarks);

      // Group bookmarks by conversation
      const byConversation = bookmarks.reduce((acc, bookmark) => {
        if (!acc[bookmark.conversationId]) {
          acc[bookmark.conversationId] = [];
        }
        acc[bookmark.conversationId].push(bookmark);
        return acc;
      }, {});

      console.log("Bookmarks grouped by conversation:", byConversation);
    };
  });
}

// Delete a bookmark by its ID
function deleteBookmark(db, id) {
  const tx = db.transaction("bookmarks", "readwrite");
  const store = tx.objectStore("bookmarks");

  store.delete(id);

  tx.oncomplete = () => {
    console.log("Bookmark deleted:", id);
  };

  tx.onerror = (event) => {
    console.error("Error deleting bookmark:", event.target.error);
  };
}

// Example usage
// openBookmarksDB((db) => {
//   saveBookmark(db, {
//     conversationId: "abc123",
//     turnIndex: 5,
//     // name: "My custom bookmark"  // optional
//   });

//   getBookmarksForConversation(db, "abc123", (bookmarks) => {
//     console.log("Bookmarks for conversation abc123:", bookmarks);
//   });

//   updateBookmarkName(db, "abc123:5", "Updated Name");
// });

// Expose functions globally
window.ChatGPTBookmarks = {
  openBookmarksDB,
  saveBookmark,
  getBookmarksForConversation,
  updateBookmarkName,
  logAllBookmarks,
  deleteBookmark,
};
