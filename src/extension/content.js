// Content script for ChatGPT Bookmark extension
console.log("ChatGPT Bookmark extension loaded!!");

// Create and add floating bookmark list
function createBookmarkList() {
  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    background: "white",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px",
    maxHeight: "80vh",
    overflowY: "auto",
    zIndex: "9999",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    minWidth: "200px",
  });

  const title = document.createElement("h3");
  title.textContent = "Bookmarks";
  title.style.margin = "0 0 10px 0";
  container.appendChild(title);

  const list = document.createElement("div");
  list.id = "bookmark-list";
  container.appendChild(list);

  document.body.appendChild(container);
  return container;
}

// Update bookmark list with current bookmarks
function updateBookmarkList() {
  const conversationId = window.location.pathname.split("/").pop();
  const list = document.getElementById("bookmark-list");
  if (!list) return;

  window.ChatGPTBookmarks.openBookmarksDB((db) => {
    window.ChatGPTBookmarks.getBookmarksForConversation(
      db,
      conversationId,
      (bookmarks) => {
        list.innerHTML = "";

        if (bookmarks.length === 0) {
          const emptyMessage = document.createElement("div");
          emptyMessage.textContent = "No bookmarks yet";
          emptyMessage.style.color = "#666";
          list.appendChild(emptyMessage);
          return;
        }

        bookmarks.forEach((bookmark) => {
          const item = document.createElement("div");
          Object.assign(item.style, {
            padding: "8px",
            borderBottom: "1px solid #eee",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            position: "relative",
          });

          const icon = document.createElement("div");
          icon.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 16 16">
            <path d="M2 2h12v12l-6-3-6 3V2z"/>
          </svg>
        `;
          item.appendChild(icon);

          const text = document.createElement("span");
          text.textContent = bookmark.name || `Bookmark ${bookmark.turnIndex}`;
          item.appendChild(text);

          // Add delete button
          const deleteBtn = document.createElement("button");
          Object.assign(deleteBtn.style, {
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            color: "#666",
            display: "none",
          });
          deleteBtn.innerHTML = "×";
          deleteBtn.title = "Delete bookmark";

          deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent triggering the bookmark click
            window.ChatGPTBookmarks.openBookmarksDB((db) => {
              window.ChatGPTBookmarks.deleteBookmark(db, bookmark.id);
              updateBookmarkList(); // Refresh the list after deletion
            });
          });

          item.appendChild(deleteBtn);

          // Show delete button on hover
          item.addEventListener("mouseenter", () => {
            deleteBtn.style.display = "block";
          });
          item.addEventListener("mouseleave", () => {
            deleteBtn.style.display = "none";
          });

          item.addEventListener("click", () => {
            const targetElement = document.querySelector(
              `[data-testid="conversation-turn-${bookmark.turnIndex}"]`
            );
            if (targetElement) {
              targetElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              targetElement.style.backgroundColor = "#fff3cd";
              setTimeout(() => {
                targetElement.style.backgroundColor = "";
              }, 2000);
            }
          });

          list.appendChild(item);
        });
      }
    );
  });
}

// Create bookmark list on page load
const bookmarkList = createBookmarkList();
updateBookmarkList();

// Watch for URL changes
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    updateBookmarkList();
  }
}).observe(document, { subtree: true, childList: true });

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

      // Update bookmark list after saving
      updateBookmarkList();
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
