import { act, useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [searchText, setSearchText] = useState("");

  // const handleClick = async () => {
  //   let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  //   if (!tab.id) {
  //     return;
  //   }
  //   chrome.scripting.executeScript<string[], void>({
  //     target: { tabId: tab.id },
  //     args: [color],
  //     func: (color) => {
  //       document.body.style.backgroundColor = color;
  //     },
  //   });
  // };

  // const handleSaveToAll = async () => {
  //   // localStorage.setItem("bcc_background_color", color);
  //   chrome.storage.local.set({ bcc_background_color: color }, () => {
  //     console.log("Value saved");
  //   });
  // };

  useEffect(() => {
    document.querySelectorAll("div.group\\/conversation-turn").forEach((el) => {
      const button = document.createElement("button");
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

      el.appendChild(button);
    });
  }, []);

  return (
    <>
      <div>
        <h3>ChatGPT Bookmark</h3>
      </div>
      <div className="card">
        <input
          type="text"
          className=""
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
        />
      </div>
      <div className="card">
        {/* <button onClick={handleSaveToAll}>Apply to all pages</button> */}
        {/* <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p> */}
      </div>
      {/* <p className="read-the-docs">Loren ipsum</p> */}
    </>
  );
}

export default App;
