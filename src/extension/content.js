// Content script for ChatGPT Bookmark extension
console.log("ChatGPT Bookmark extension loaded!!");

// Function to add bookmark button to a conversation turn
function addBookmarkButton(el) {
  console.log("Adding bookmark button to element:", el);
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

  try {
    el.appendChild(button);
    console.log("Successfully appended button to element");
  } catch (error) {
    console.error("Failed to append button:", error);
  }
}

// Function to process all matching elements
function processElements() {
  const elements = document.querySelectorAll("div.group\\/conversation-turn");
  console.log("Found", elements.length, "conversation turns");

  elements.forEach((el, index) => {
    console.log(`Processing element ${index}:`, el);
    // Only add button if it doesn't already have our specific button
    if (!el.querySelector(".chatgpt-bookmark-button")) {
      console.log(
        `Element ${index} doesn't have a bookmark button, adding one`
      );
      addBookmarkButton(el);
    } else {
      console.log(`Element ${index} already has a bookmark button`);
    }
  });
}

// Initial processing
console.log("Starting initial processing");
processElements();

// Set up MutationObserver to watch for new conversation turns
const observer = new MutationObserver((mutations) => {
  console.log("Mutation detected:", mutations);
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      console.log("New nodes added, reprocessing elements");
      processElements();
      break;
    }
  }
});

// Start observing the document body for changes
console.log("Setting up MutationObserver");
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Add your content script logic here
