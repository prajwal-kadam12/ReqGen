// client/src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Get the root HTML element
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Make sure your index.html has <div id='root'></div>");
}

// Render the React app
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
