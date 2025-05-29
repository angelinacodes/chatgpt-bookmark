// Content script for ChatGPT Bookmark extension
console.log("ChatGPT Bookmark extension loaded!!");

// Make icons available globally
const bookmarkIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 16 16">
    <path d="M2 2h12v12l-6-3-6 3V2z"/>
  </svg>
`;

const closeIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 16 16">
    <path d="M4 4l8 8m0-8l-8 8"/>
  </svg>
`;

// Create and add floating bookmark list
function createBookmarkList() {
  // Create toggle button
  const toggleBtn = document.createElement("button");
  Object.assign(toggleBtn.style, {
    position: "fixed",
    top: "56px",
    right: "20px",
    background: "white",
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "6px",
    cursor: "pointer",
    zIndex: "10000",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  // Start with the list hidden, but if it's shown, use X icon and no border
  let isListVisible = false;
  toggleBtn.innerHTML = bookmarkIcon;
  toggleBtn.title = "Show Bookmarks";

  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "fixed",
    top: "56px",
    right: "20px",
    background: "white",
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "8px",
    maxHeight: "70vh",
    overflowY: "auto",
    zIndex: "9999",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    minWidth: "180px",
    fontSize: "13px",
    display: "none",
  });

  const title = document.createElement("h3");
  title.textContent = "Bookmarks";
  Object.assign(title.style, {
    margin: "0 0 8px 0",
    fontSize: "14px",
    fontWeight: "500",
  });
  container.appendChild(title);

  const list = document.createElement("div");
  list.id = "bookmark-list";
  container.appendChild(list);

  // Add toggle functionality
  toggleBtn.addEventListener("click", () => {
    isListVisible = container.style.display !== "block";
    container.style.display = isListVisible ? "block" : "none";
    toggleBtn.title = isListVisible ? "Hide Bookmarks" : "Show Bookmarks";
    toggleBtn.innerHTML = isListVisible ? closeIcon : bookmarkIcon;
    toggleBtn.style.border = isListVisible ? "none" : "1px solid #ccc";
    // Remove background and shadow when open
    if (isListVisible) {
      toggleBtn.style.backgroundColor = "transparent";
      toggleBtn.style.boxShadow = "none";
    } else {
      toggleBtn.style.backgroundColor = "white";
      toggleBtn.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
    }
  });

  document.body.appendChild(toggleBtn);
  document.body.appendChild(container);
  return { container, toggleBtn };
}

// Update bookmark list with current bookmarks
function updateBookmarkList() {
  const conversationId = window.location.pathname.split("/").pop();
  const list = document.getElementById("bookmark-list");
  const container = list?.parentElement;
  const toggleBtn = document.querySelector(
    'button[title^="Show Bookmarks"],button[title^="Hide Bookmarks"]'
  );
  if (!list || !container || !toggleBtn) return;

  window.ChatGPTBookmarks.openBookmarksDB((db) => {
    window.ChatGPTBookmarks.getBookmarksForConversation(
      db,
      conversationId,
      (bookmarks) => {
        list.innerHTML = "";

        if (bookmarks.length === 0) {
          container.style.display = "none";
          // When hiding, show bookmark icon and border
          toggleBtn.innerHTML = bookmarkIcon;
          toggleBtn.title = "Show Bookmarks";
          toggleBtn.style.border = "1px solid #ccc";
          toggleBtn.style.backgroundColor = "white";
          return;
        }

        // Show container if we have bookmarks
        container.style.display = "block";
        // When showing, use X icon and no border
        toggleBtn.innerHTML = closeIcon;
        toggleBtn.title = "Hide Bookmarks";
        toggleBtn.style.border = "none";
        toggleBtn.style.backgroundColor = "transparent";
        toggleBtn.style.boxShadow = "none";

        bookmarks
          .slice()
          .sort((a, b) => a.turnIndex - b.turnIndex)
          .forEach((bookmark) => {
            const item = document.createElement("div");
            Object.assign(item.style, {
              padding: "6px",
              borderBottom: "1px solid #eee",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              position: "relative",
              fontSize: "12px",
            });

            const icon = document.createElement("div");
            icon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" height="14" width="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 16 16">
              <path d="M2 2h12v12l-6-3-6 3V2z"/>
            </svg>
          `;
            item.appendChild(icon);

            const text = document.createElement("span");
            text.textContent =
              bookmark.name || `Bookmark ${bookmark.turnIndex}`;
            item.appendChild(text);

            // Add delete button
            const deleteBtn = document.createElement("button");
            Object.assign(deleteBtn.style, {
              position: "absolute",
              right: "6px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px 4px",
              color: "#666",
              display: "none",
              fontSize: "14px",
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
                // Scroll to the top of the element
                targetElement.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
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
const { container: bookmarkList } = createBookmarkList();
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

  // Remove hover card logic
  // Add click handler to save bookmark
  button.addEventListener("click", () => {
    // Get conversation ID from URL
    const conversationId = window.location.pathname.split("/").pop();

    window.ChatGPTBookmarks.openBookmarksDB((db) => {
      window.ChatGPTBookmarks.saveBookmark(db, {
        conversationId,
        turnIndex: turnNumber,
        name: `Response ${turnNumber / 2}`,
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
