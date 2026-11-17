# Job Ready — Frontend Client

[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Components-black.svg?style=flat)](https://ui.shadcn.com)
[![License](https://img.shields.io/badge/License-Proprietary-blue.svg?style=flat)](#license)

The single-page web client for **Job Ready**, an AI-powered career preparation platform. It provides an intuitive, responsive interface for ATS resume auditing, interactive LaTeX-based resume tailoring, and adaptive mock interviews across recorded audio, video, and live conversational WebSocket streams.

---

## Backend Architecture & Repository

> **System Architecture & Deep Dive**: The core AI interview orchestration, state persistence, multimodal streaming, database schemas, and engineering decisions are managed by the FastAPI backend.
>
> 🔗 **Backend Repository**: [https://github.com/sawanrepo/JOB_READY_BACKEND](https://github.com/sawanrepo/JOB_READY_BACKEND)  
> 📖 **Architecture & System Design**: For in-depth documentation covering the Gemini Live sequence diagrams, database ER diagrams, atomic credit reservation mechanics, and security hardening, please refer to the [Backend README](https://github.com/sawanrepo/JOB_READY_BACKEND#readme).

---

## Key Features

- **ATS Resume Auditor**: Upload resume PDFs against job descriptions to receive categorized ATS match scores, missing keyword breakdowns, and formatting audits.
- **Interactive 3-Step Resume Tailoring**:
  1. *Analysis*: Parses uploaded resume and extracts target competencies from the job description.
  2. *Draft Customization*: Interactive editor allowing candidates to review and adjust tailored experience bullet points, project descriptions, and skill tags.
  3. *Compilation & Download*: Triggers server-side `pdflatex` compilation into an AltaCV PDF layout stored securely in AWS S3.
- **Live Conversational Interview Experience**:
  - Connects to the backend via full-duplex WebSockets.
  - Captures microphone input and downsamples on-the-fly to 16kHz PCM audio via the browser's Web Audio API (`AudioContext`).
  - Periodically streams canvas-rendered camera frames alongside audio chunks to interface with Google's Gemini 3.1 Flash Live Preview model.
- **Recorded Audio & Video Mock Interviews**:
  - Structured 10-question evaluation workflows using `MediaRecorder`.
  - Client-side countdown timers, audio retakes, and asynchronous STT transcription progress polling.
- **Anti-Cheating & Integrity Guard**:
  - Detects window blur, tab switching, and fullscreen exits during interview sessions.
  - Automatically posts warning increments to the backend; triggers a session abort upon exceeding 5 warnings.
- **Credit Balance Management & Razorpay Checkout**:
  - Displays remaining free daily/weekly quota badges with automated reset countdowns.
  - Integrated Razorpay checkout modal for one-time credit top-up packs and bundles.

---

## Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 18** | Core declarative UI library |
| **TypeScript 5.5** | Type safety across API contracts and UI states |
| **Vite 5** | High-speed frontend build tool and dev server |
| **Tailwind CSS 3.4** | Utility-first styling and responsive layouts |
| **shadcn/ui & Radix UI** | Accessible, unstyled UI primitives (dialogs, tabs, progress, dropdowns) |
| **TanStack React Query** | Asynchronous server-state management and query caching |
| **Web Audio API** | Real-time audio downsampling to single-channel 16-bit 16kHz PCM |
| **Lucide React** | Clean, consistent vector icon set |

---

## Getting Started

### Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher (or `pnpm` / `bun`)
- Running instance of the [Job Ready Backend](https://github.com/sawanrepo/JOB_READY_BACKEND)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sawanrepo/job_ready_frontend.git
   cd job_ready_frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
   *(Point `VITE_API_URL` to your running FastAPI backend server).*

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

### Production Build

To compile and optimize assets for deployment:
```bash
npm run build
```
The output will be generated in the `dist/` directory, ready to be served via Nginx, Vercel, or any static hosting provider.

To preview the production build locally:
```bash
npm run preview
```

---

## License

This project is proprietary and confidential. All rights reserved. Unauthorized copying, distribution, or modification of this codebase, via any medium, is strictly prohibited.
