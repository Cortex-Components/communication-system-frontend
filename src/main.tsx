import { createRoot, Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "./contexts/LanguageContext";
import ChatWidget from "./features/chat/ChatWidget";
import stylesheet from "../styles/index.css?inline";
import APP_CONFIG from "./config/app-config";

const queryClient = new QueryClient();

// Process stylesheet for Shadow DOM:
// 1. Replace ':root' with ':host' to scope CSS variables to the shadow host.
// 2. Replace 'body' with ':host' to apply global styles to the shadow host.
const processedStylesheet = stylesheet
    .replace(/:root/g, ":host")
    .replace(/body/g, ":host");

class CortexChatWidget extends HTMLElement {
    private reactRoot: Root | null = null;
    private mountPoint: HTMLDivElement | null = null;

    static get observedAttributes() {
        return ["role", "current-page", "config"];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    attributeChangedCallback() {
        // Re-render when attributes change
        if (this.reactRoot) {
            this.render();
        }
    }

    connectedCallback() {
        if (!this.shadowRoot) return;

        const primary = APP_CONFIG.chat.colors.primary;
        const secondary = APP_CONFIG.chat.colors.secondary;

        const hostCss = `
            :host {
                display: block;
                position: fixed;
                bottom: 0;
                right: 0;
                z-index: 9999;
                isolation: isolate;
                
                /* Dynamic Hex Colors from .env */
                --primary: ${primary};
                --secondary: ${secondary};
                --accent: ${secondary};

                /* Cortex Specific Variables */
                --cortex-primary: ${primary};
                --cortex-secondary: ${secondary};
                --cortex-header-gradient: linear-gradient(360deg, ${secondary} -68.13%, #858B89 15.94%, ${primary} 100%);
                --cortex-button-gradient: linear-gradient(270deg, ${secondary} 0%, #858B89 50%, ${primary} 100%);
                --cortex-icon-gradient: linear-gradient(90deg, ${secondary} 0%, #949791 15.87%, ${primary} 68.27%);
            }
        `;

        // Use Adopted StyleSheets if supported (modern browsers)
        if ("adoptedStyleSheets" in this.shadowRoot && typeof CSSStyleSheet !== "undefined") {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(processedStylesheet);
            
            const hostSheet = new CSSStyleSheet();
            hostSheet.replaceSync(hostCss);
            
            this.shadowRoot.adoptedStyleSheets = [sheet, hostSheet];
        } else {
            // Fallback for browsers that don't support adoptedStyleSheets
            const styleTag = document.createElement("style");
            styleTag.textContent = processedStylesheet + hostCss;
            this.shadowRoot.appendChild(styleTag);
        }

        // Create mount point for React
        this.mountPoint = document.createElement("div");
        this.mountPoint.id = "cortex-chat-root";
        
        // Apply base classes and handle dark mode from the host page
        this.mountPoint.className = "bg-background text-foreground font-sans antialiased";
        if (document.documentElement.classList.contains("dark") || document.body.classList.contains("dark")) {
            this.mountPoint.classList.add("dark");
        }

        this.shadowRoot.appendChild(this.mountPoint);

        this.reactRoot = createRoot(this.mountPoint);
        this.render();
    }

    private render() {
        if (!this.reactRoot) return;

        const role = this.getAttribute("role") || import.meta.env.VITE_DEFAULT_ROLE || "dev";
        const currentPage = this.getAttribute("current-page") || import.meta.env.VITE_DEFAULT_PAGE || "home";
        let config = {};

        // Parse config attribute if it's valid JSON
        const configAttr = this.getAttribute("config");
        if (configAttr) {
            try {
                config = JSON.parse(configAttr);
            } catch (e) {
                console.error("Failed to parse cortex-chat-widget configuration:", e);
            }
        }

        this.reactRoot.render(
            <QueryClientProvider client={queryClient}>
                <LanguageProvider>
                    <ChatWidget role={role} currentPage={currentPage} config={config} />
                </LanguageProvider>
            </QueryClientProvider>
        );
    }

    disconnectedCallback() {
        if (this.reactRoot) {
            this.reactRoot.unmount();
        }
    }
}

// Define the custom element
const tagName = import.meta.env.VITE_WIDGET_TAG_NAME || "cortex-chat-widget";
if (!customElements.get(tagName)) {
    customElements.define(tagName, CortexChatWidget);
}
