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

  // useEffect(() => {

  //   });
  // }, []);

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
