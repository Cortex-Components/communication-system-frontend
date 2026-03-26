import { createRoot } from "react-dom/client";
import App from "./app/App";
import stylesheet from "../styles/index.css?inline";
import { LanguageProvider } from "./contexts/LanguageContext";

class CortexChatWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        if (!this.shadowRoot) return;

        // Shadow root wrapper for React to mount
        const mountPoint = document.createElement("div");
        mountPoint.id = "root";
        mountPoint.style.width = "100%";
        mountPoint.style.height = "100%";

        // Inject Stylesheet into Shadow DOM
        const styleTag = document.createElement("style");
        styleTag.textContent = stylesheet;
        this.shadowRoot.appendChild(styleTag);
        this.shadowRoot.appendChild(mountPoint);

        createRoot(mountPoint).render(
            <LanguageProvider>
                <App />
            </LanguageProvider>
        );
    }
}

// Define the custom element
if (!customElements.get("cortex-chat-widget")) {
    customElements.define("cortex-chat-widget", CortexChatWidget);
}
