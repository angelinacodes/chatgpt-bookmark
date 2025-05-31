// Content script for ChatGPT Bookmark extension
console.log("ChatGPT Bookmark extension loaded!!");

// Solid orange bookmark with white star (for toggle and add button)
const solidBookmarkIcon = `
  <svg width="16" height="22" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,0 h100 v120 l-50,-30 l-50,30 z" fill="#F4A300" />
    <polygon fill="white" points="50,22 58,42 78,42 62,56 68,76 50,64 32,76 38,56 22,42 42,42" />
  </svg>
`;

// Hollow yellow bookmark with white star (for floating list)
const hollowBookmarkIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" height="14" width="14" viewBox="0 0 24 24">
    <path fill="none" stroke="#FFA500" stroke-width="2" d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z"/>
    <path fill="#fff" d="M12 8.5l1.45 2.95 3.25.47-2.35 2.29.56 3.24L12 15.27l-2.91 1.53.56-3.24-2.35-2.29 3.25-.47z"/>
  </svg>
`;

const bookmarkIcon = solidBookmarkIcon;

// Chevron up icon for minimize
const closeIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 16 16">
    <polyline points="4 10 8 6 12 10" stroke-linecap="round" stroke-linejoin="round"/>
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
    height: "32px",
    width: "32px",
  });

  // Start with the list hidden, but if it's shown, use X icon and no border
  let isListVisible = false;
  toggleBtn.innerHTML = solidBookmarkIcon;
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
    toggleBtn.innerHTML = isListVisible ? closeIcon : solidBookmarkIcon;
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
          toggleBtn.innerHTML = solidBookmarkIcon;
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
            icon.innerHTML = hollowBookmarkIcon;
            item.appendChild(icon);

            const text = document.createElement("span");
            text.textContent =
              bookmark.name || `Bookmark ${bookmark.turnIndex}`;
            text.style.flex = "1";
            item.appendChild(text);

            // Button container for edit and delete
            const btnContainer = document.createElement("div");
            btnContainer.style.display = "flex";
            btnContainer.style.alignItems = "center";
            btnContainer.style.gap = "2px";
            btnContainer.style.marginLeft = "6px";

            // Add edit (pencil) button
            const editBtn = document.createElement("button");
            Object.assign(editBtn.style, {
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#888",
              fontSize: "14px",
              padding: "2px 4px",
              display: "none",
            });
            editBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" height="14" width="14" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 16 16">
                <path d="M3 13l2.5-2.5M13 3l-8.5 8.5M11.5 2.5a2.121 2.121 0 1 1 3 3L5 15H2v-3L11.5 2.5z"/>
              </svg>
            `;
            editBtn.title = "Edit bookmark name";
            btnContainer.appendChild(editBtn);

            editBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              // Replace text with input
              const input = document.createElement("input");
              input.type = "text";
              input.value = bookmark.name || `Bookmark ${bookmark.turnIndex}`;
              input.style.fontSize = "12px";
              input.style.flex = "1";
              input.style.marginLeft = "4px";
              input.style.padding = "2px 4px";
              input.style.border = "1px solid #ccc";
              input.style.borderRadius = "3px";
              item.replaceChild(input, text);
              input.focus();
              input.select();

              function saveEdit() {
                const newName =
                  input.value.trim() || `Bookmark ${bookmark.turnIndex}`;
                window.ChatGPTBookmarks.openBookmarksDB((db) => {
                  window.ChatGPTBookmarks.updateBookmarkName(
                    db,
                    bookmark.id,
                    newName
                  );
                  updateBookmarkList();
                });
              }

              input.addEventListener("blur", saveEdit);
              input.addEventListener("keydown", (ev) => {
                if (ev.key === "Enter") {
                  input.blur();
                } else if (ev.key === "Escape") {
                  updateBookmarkList();
                }
              });
            });

            // Add delete button
            const deleteBtn = document.createElement("button");
            Object.assign(deleteBtn.style, {
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "2px 4px",
              color: "#666",
              fontSize: "14px",
              display: "none",
            });
            deleteBtn.innerHTML = "×";
            deleteBtn.title = "Delete bookmark";
            deleteBtn.id = `delete-bookmark-btn-${bookmark.id}`;
            btnContainer.appendChild(deleteBtn);

            // Show/hide both icons on hover
            item.addEventListener("mouseenter", () => {
              editBtn.style.display = "block";
              deleteBtn.style.display = "block";
            });
            item.addEventListener("mouseleave", () => {
              editBtn.style.display = "none";
              deleteBtn.style.display = "none";
            });

            item.appendChild(btnContainer);

            item.addEventListener("click", (event) => {
              if (event.target.id === `delete-bookmark-btn-${bookmark.id}`) {
                window.ChatGPTBookmarks.openBookmarksDB((db) => {
                  window.ChatGPTBookmarks.deleteBookmark(db, bookmark.id);
                  updateBookmarkList();
                });

                return;
              }
              // Only scroll if the click did NOT originate from a button (edit or delete)
              // if (event.target.closest("button")) return;
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
    ${solidBookmarkIcon} Bookmark
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
