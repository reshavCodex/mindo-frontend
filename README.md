# MINDO

> **Using a phone?** MINDO is not optimised for mobile screens yet, and visuals may look broken. Please open it with your browser's **Desktop site** option for the intended layout.

**An AI-assisted counselling and wellness platform for students and young adults.**

MINDO combines a live voice conversation with AI, in-browser facial emotion recognition, retrieval-augmented session analysis, and a personal wellness dashboard. It is designed as an accessible first layer of support and self-reflection, not as a replacement for professional mental-health care.

**Live demo:** https://mindo-frontend.vercel.app

---

## Before You Try MINDO

MINDO's backend services run on Render's free tier. Free-tier services can go to sleep after a period of inactivity, so the first request to each one can be slow or fail. To avoid that, wake them up first:

1. Open each of these three URLs once in your browser:
   - Conversation: https://mindo-conversation.onrender.com
   - RAG: https://mindo-rag.onrender.com
   - Chatbot: https://mindo-chat-backend.onrender.com
2. Wait until each page responds (a short JSON status is enough).
3. Then open https://mindo-frontend.vercel.app

Visiting each URL once should normally be enough. This is only a consequence of the current free-tier hosting.

---

## Screenshots

| Landing | Dashboard |
|---|---|
| ![Landing page](docs/landing.png) | ![Dashboard](docs/dashboard.png) |

| AI Video Counselling | Session Summary |
|---|---|
| ![Screening page](docs/screening.png) | ![Session summary](docs/summary.png) |

---

## What is MINDO?

MINDO lets a signed-in user hold an open-ended, spoken check-in with an AI counsellor. While the conversation runs, an emotion model analyses the user's facial expressions in the browser. When the check-in ends, the conversation and emotion signals are analysed against a mental-health knowledge base and turned into a PDF report, which appears in the user's dashboard history. A separate text chatbot is also available.

## Motivation

Students deal with academic pressure, stress, anxiety, social challenges and career uncertainty, and professional support is not always easy to reach. MINDO explores how modern AI can offer a more accessible and interactive first layer of support.

## Target Audience

- School, college and university students
- Young adults
- Anyone interested in AI-assisted wellness and self-reflection

## Main Features

- Landing page with signup and login (Firebase Authentication)
- **AI video check-in** (`/screening`): live voice conversation powered by Gemini Live, with a 3D brain visual
- **Facial emotion recognition** running in the browser (MediaPipe + ONNX Runtime Web)
- Session summary state when a check-in ends, while the report is processed
- **AI-generated PDF report** per session (retrieval-augmented analysis)
- **Dashboard** with the user's past check-ins loaded from the backend
- **Chatbot** (`/chat`) for text conversations
- Resources, profile and settings pages

## How MINDO Works

1. The user signs up or logs in with Firebase Authentication.
2. On `/screening`, the browser opens a WebSocket to the Conversation Backend and sends its Firebase ID token as the first message.
3. Microphone audio is streamed to the Conversation Backend, which relays it to Gemini Live and sends back transcriptions.
4. In parallel, the browser detects the face, runs the emotion model, and sends emotion labels and probabilities (not video) to the backend. These are never forwarded to Gemini.
5. When the user ends the check-in, the backend builds a session context and a semantic context, then sends the semantic context to the RAG Backend.
6. The RAG Backend retrieves relevant knowledge, runs a Gemini analysis, and returns a PDF report.
7. The Conversation Backend stores the session files and the PDF in Supabase and marks the session as completed.
8. The dashboard fetches the user's sessions from the Conversation Backend.

## Architecture

```text
Frontend → Firebase Authentication
Frontend → Conversation Backend → Gemini Live
Conversation Backend → RAG Backend → report (PDF as base64)
Conversation Backend → Supabase (database + private storage)
Frontend → Chat Backend → Gemini
```

| Component | Role | Hosting |
|---|---|---|
| [mindo-frontend](https://github.com/reshavCodex/mindo-frontend) | Web app (this repo) | Vercel |
| [mindo-conversation](https://github.com/reshavCodex/mindo-conversation) | Realtime sessions, auth verification, storage | Render |
| [mindo-rag](https://github.com/reshavCodex/mindo-rag) | Retrieval, analysis, PDF reports | Render |
| [mindo-chat-backend](https://github.com/reshavCodex/mindo-chat-backend) | Text chatbot | Render |
| Firebase | Authentication | Google |
| Supabase | Session database and report storage | Supabase |
| Qdrant Cloud | Vector database for RAG | Qdrant |

### How the frontend connects to each service

| Service | How | Used for |
|---|---|---|
| Firebase | Firebase JS SDK | Login, signup, ID tokens |
| Conversation Backend (WebSocket) | `VITE_CONVERSATION_WS_URL` | Live check-in |
| Conversation Backend (REST) | `VITE_CONVERSATION_API_URL`, `GET /api/v1/sessions` with a Bearer token | Dashboard session history |
| Chat Backend | `VITE_CHAT_API_URL`, `POST /api/chat` | Chatbot |

The frontend does **not** call the RAG Backend or Supabase directly. RAG is reached only through the Conversation Backend.

## Key Concepts

**Firebase.** Handles user authentication. Sessions use browser-session persistence, so each tab keeps its own signed-in user. The backends verify the Firebase ID token with the Firebase Admin SDK.

**Supabase.** Used by the Conversation Backend for session records (`users`, `sessions`, `session_artifacts` tables) and a private storage bucket (`mindo-sessions`) holding `session_context.json`, `semantic_context.json` and `report.pdf`.

**RAG.** The RAG Backend searches a knowledge base of mental-health reference documents using dense retrieval (Qdrant) plus BM25, fuses the results, reranks them with Cohere, and passes the evidence to Gemini for analysis.

**FER (Facial Emotion Recognition).** Runs entirely in the browser: a MediaPipe face detector locates the face and an ONNX model (`public/models/emotion_model_best.onnx`) predicts expression probabilities. The MediaPipe and ONNX runtime assets are loaded from public CDNs, so an internet connection is required. FER output is a behavioural signal used in the analysis and dashboard charts. It is not a measurement of mental state.

## The Four MINDO Repositories

| Repository | Purpose |
|---|---|
| [mindo-frontend](https://github.com/reshavCodex/mindo-frontend) | Main project: web application |
| [mindo-conversation](https://github.com/reshavCodex/mindo-conversation) | Realtime AI conversation backend |
| [mindo-rag](https://github.com/reshavCodex/mindo-rag) | RAG and report generation backend |
| [mindo-chat-backend](https://github.com/reshavCodex/mindo-chat-backend) | Chatbot backend |

## Tech Stack

| Area | Technologies |
|---|---|
| UI | React 18, Vite 5, Tailwind CSS 3, React Router 7, Framer Motion, Lucide |
| 3D | Three.js, React Three Fiber, drei |
| Auth | Firebase JS SDK |
| In-browser ML | ONNX Runtime Web, MediaPipe Tasks Vision |

## Routes

| Route | Access |
|---|---|
| `/` | Public (landing) |
| `/login`, `/signup` | Public |
| `/resources` | Public |
| `/dashboard`, `/profile`, `/settings` | Signed-in users |
| `/screening` | Signed-in users (AI video check-in) |
| `/chat` | Signed-in users (chatbot) |

## Local Setup

Requires Node.js and npm.

```bash
git clone https://github.com/reshavCodex/mindo-frontend.git
cd mindo-frontend
npm install
```

Create a `.env` file in the project root (see below), then:

```bash
npm run dev
```

The app runs at `http://localhost:5173` by default. To use local backends, see the setup sections of the backend repositories; the backends allow `http://localhost:5173` as a CORS origin by default.

## Environment Variables

Create `.env` with these names. Never commit real values (`.env` is git-ignored).

| Variable | Purpose |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web app configuration |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase web app configuration |
| `VITE_FIREBASE_PROJECT_ID` | Firebase web app configuration |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase web app configuration |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase web app configuration |
| `VITE_FIREBASE_APP_ID` | Firebase web app configuration |
| `VITE_CONVERSATION_WS_URL` | WebSocket URL of the Conversation Backend (ends with `/ws/realtime`) |
| `VITE_CONVERSATION_API_URL` | Base HTTP URL of the Conversation Backend (no trailing slash) |
| `VITE_CHAT_API_URL` | Base HTTP URL of the Chat Backend (no trailing slash) |

Example for the backend URLs:

```bash
# Local backends
VITE_CONVERSATION_WS_URL=ws://127.0.0.1:8000/ws/realtime
VITE_CONVERSATION_API_URL=http://127.0.0.1:8000
VITE_CHAT_API_URL=http://127.0.0.1:8002

# Deployed backends
# VITE_CONVERSATION_WS_URL=wss://mindo-conversation.onrender.com/ws/realtime
# VITE_CONVERSATION_API_URL=https://mindo-conversation.onrender.com
# VITE_CHAT_API_URL=https://mindo-chat-backend.onrender.com
```

## Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Production Build and Deployment

```bash
npm run build
```

The frontend is deployed on **Vercel**. `vercel.json` rewrites all paths to `index.html` so client-side routes work on refresh. Set the environment variables above in the Vercel project settings. Vite embeds them at build time, so redeploy after changing any value.

## Security Notes

- Every `VITE_` variable is shipped to the browser. Firebase web configuration is intended to be public, but access control depends on Firebase and backend verification, not on hiding these values.
- Private credentials (Gemini, Cohere, Qdrant, Supabase, Firebase Admin) exist only in the backend services and are not part of this repository.
- User identity is established by Firebase ID tokens verified on the backend, never by values the browser supplies.
- Report and session files are stored in a private Supabase bucket and served only through authenticated backend endpoints.

## Disclaimer

MINDO is an AI-assisted wellness and academic project. It is **not** a replacement for professional mental-health care, diagnosis or treatment. If you are in crisis or in immediate danger, contact local emergency services or a qualified professional.

## Known Limitations

- Facial emotion recognition should not be interpreted as a definitive measurement of a person's mental state. The FER model has limitations and is not clinically validated.
- The live backends use Render's free tier, so cold starts can occur.
- The live demo depends on several independently hosted services.
- The interface is not optimised for mobile devices.

## Future Scope

- Improved facial emotion recognition accuracy
- Better multimodal understanding
- More personalised wellness insights
- Additional language support and improved accessibility
- Long-term emotional and session trend analysis
- Expanded knowledge base, with improved retrieval and reranking
- More scalable infrastructure
- Potential integration with professional mental-health workflows
- More robust student-focused wellness features

## Exploring the Complete Project

If you found this repository through my GitHub profile, start here: this is the main MINDO repository. Then explore the backends in this order: [mindo-conversation](https://github.com/reshavCodex/mindo-conversation) (realtime sessions), [mindo-rag](https://github.com/reshavCodex/mindo-rag) (retrieval and reports), and [mindo-chat-backend](https://github.com/reshavCodex/mindo-chat-backend) (chatbot).

## Built By

**Reshav Pradhan**
[LinkedIn](https://www.linkedin.com/in/reshavpradhan/) · [GitHub](https://github.com/reshavCodex)

## License

No explicit open-source license has been selected for this project. Until one is added, default copyright applies.
