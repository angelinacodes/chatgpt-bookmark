// Content script for ChatGPT Bookmark extension
console.log("ChatGPT Bookmark extension loaded!!");

// Log all bookmarks in IndexedDB
window.ChatGPTBookmarks.openBookmarksDB((db) => {
  const tx = db.transaction("bookmarks", "readonly");
  const store = tx.objectStore("bookmarks");
  const request = store.getAll();

  request.onsuccess = () => {
    const bookmarks = request.result;
    console.log("Current bookmarks in IndexedDB:", bookmarks);
  };
});

// Function to add bookmark button to a conversation turn
function addBookmarkButton(el, turnNumber) {
  const button = document.createElement("button");
  button.className = "chatgpt-bookmark-button";
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-right: 6px;" viewBox="0 0 16 16">
      <path d="M2 2h12v12l-6-3-6 3V2z"/>
    </svg>
    Bookmark
  `;
  Object.assign(button.style, {
    display: "inline-flex",
    alignItems: "center",
    border: "1px solid #ccc",
    padding: "4px 8px",
    marginTop: "10px",
    cursor: "pointer",
    background: "#fff",
    borderRadius: "4px",
    fontSize: "14px",
    width: "100px",
    position: "relative",
  });

  const hoverCard = document.createElement("div");
  Object.assign(hoverCard.style, {
    position: "absolute",
    top: "100%",
    left: "0",
    zIndex: "9999",
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    padding: "10px",
    marginTop: "5px",
    maxWidth: "400px",
    display: "none",
    overflow: "auto",
    maxHeight: "300px",
  });
  hoverCard.innerHTML = el.innerHTML;

  button.appendChild(hoverCard);

  button.addEventListener("mouseenter", () => {
    hoverCard.style.display = "block";
  });
  button.addEventListener("mouseleave", () => {
    hoverCard.style.display = "none";
  });

  // Add click handler to save bookmark
  button.addEventListener("click", () => {
    // Get conversation ID from URL
    const conversationId = window.location.pathname.split("/").pop();

    window.ChatGPTBookmarks.openBookmarksDB((db) => {
      window.ChatGPTBookmarks.saveBookmark(db, {
        conversationId,
        turnIndex: turnNumber,
        // name: `ChatGPT Response ${turnNumber}`,
      });

      // Log updated bookmarks after saving
      const tx = db.transaction("bookmarks", "readonly");
      const store = tx.objectStore("bookmarks");
      const request = store.getAll();

      request.onsuccess = () => {
        const bookmarks = request.result;
        console.log("Updated bookmarks in IndexedDB:", bookmarks);
      };
    });
  });

  try {
    el.appendChild(button);
  } catch (error) {
    console.error("Failed to append button:", error);
  }
}

// Function to process all matching elements
function processElements() {
  const elements = document.querySelectorAll("div.group\\/conversation-turn");

  elements.forEach((el, index) => {
    // Find the parent article to get the turn number
    const article = el.closest('article[data-testid^="conversation-turn-"]');
    if (article) {
      const turnNumber = parseInt(
        article.getAttribute("data-testid").split("-").pop()
      );

      // Only process even-numbered turns (ChatGPT responses)
      if (turnNumber % 2 === 0) {
        // Only add button if it doesn't already have our specific button
        if (!el.querySelector(".chatgpt-bookmark-button")) {
          addBookmarkButton(el, turnNumber);
        }
      }
    }
  });
}

// Initial processing
processElements();

// Set up MutationObserver to watch for new conversation turns
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      processElements();
      break;
    }
  }
});

// Start observing the document body for changes
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Add your content script logic here
