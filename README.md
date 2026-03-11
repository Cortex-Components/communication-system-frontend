# Communication System Frontend

Welcome to the **Communication System Frontend**! This project is the React-based frontend application for the Communication System, built using modern web development practices and tools.

## Features

- **Interactive UI**: A fully responsive and interactive user interface built with React and Tailwind CSS.
- **Role-based Views**: Seamlessly switch between **Developer View** and **User View** to experience tailored features and navigation workflows.
- **Embedded Chat Widget**: An intelligent chat widget designed to improve communication and support (found in `src/features/chat`).
- **Change Request Management**: Create, list, and view details about change requests directly within the user interface.
- **Modern Tech Stack**: Uses Vite for rapid development and optimized builds, along with TypeScript for robust type safety.

## Technology Stack

- **Framework**: React 18, React Router DOM v6
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + PostCSS + Autoprefixer
- **State/Data Fetching**: React Query (TanStack Query v5)
- **Icons**: Lucide React
- **Linting & Formatting**: ESLint

## Project Structure

- `src/app/`: Core app configurations.
- `src/assets/`: Static assets such as images and fonts.
- `src/components/`: Reusable, generic UI components.
- `src/features/`: Feature-scoped modules (e.g., `chat` which contains `ChatWidget.tsx`, `ChangeRequestList.tsx`, `ChatConversation.tsx`, etc.).
- `src/pages/`: Route-level components mapping to application pages.
- `src/services/`: API configuration and external endpoints interaction.

## Getting Started

### Prerequisites

You need [Node.js](https://nodejs.org/) (v18+ recommended) and `npm` installed on your machine.

### Installation

Clone the repository and install the dependencies:

```bash
npm install
```

### Running the Development Server

Start the local Vite development server:

```bash
npm run dev
```

The application will be accessible at http://localhost:5173.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

This will output the optimized build in the `dist/` directory.

### Linting

Check the codebase for any issues using ESLint:

```bash
npm run lint
```

## Design References

**Figma URL**: [Website Design](https://www.figma.com/design/uFz8iP2Zui9fXqaJnB2DJz/Cortex-Website?node-id=0-1&p=f&t=KoyWJBDlnts7hgqE-0)

---

