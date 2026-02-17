import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MorrisCounter from "./MorrisCounter.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MorrisCounter />
  </StrictMode>
);
