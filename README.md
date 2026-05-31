# MUSICOS (Ai Assisted)

**A keyboard-driven, retro-terminal local music player built for the web.**

MUSICOS is a fully offline, browser-based audio player designed to replicate the aesthetic of a DOS machine connected to an amber CRT monitor. It bypasses the cloud entirely, playing your local music library (MP3, FLAC, M4A, OGG, WAV) straight from your hard drive with blazing-fast performance.

## 🚀 Features

*   **100% Local & Private**: Uses the modern Native File System API to mount and stream music directly from your local folders. No uploads, no servers, no cloud.
*   **Terminal Interface**: A fully keyboard-driven command-line interface (CLI). Type commands like `PLAY`, `MOUNT`, `ALBUM`, and `SEARCH <QUERY>` to control your media.
*   **CRT Amber Aesthetic**: A carefully crafted retro UI featuring authentic scanlines, amber phosphor text, and terminal-style ASCII UI components (powered by TailwindCSS and Shadcn UI).
*   **IndexedDB Metadata Caching**: Parses ID3 tags and caches your massive library metadata locally in your browser using Dexie.js for instant boots and searches on subsequent visits.
*   **3D Cover Flow**: Includes a fluid, CSS-3D powered "Cover Flow" album browser rendered entirely using retro geometric text structures.
*   **Fuzzy Searching**: Instantly filter through thousands of tracks using `fuse.js`-powered typo-tolerant search filtering.

## 🛠 Tech Stack

*   **Framework**: React.js (Vite)
*   **State Management**: Zustand
*   **Database**: Dexie.js (IndexedDB)
*   **Styling**: TailwindCSS & custom CRT CSS animations
*   **UI Components**: Shadcn UI
*   **Metadata**: `music-metadata-browser` for parsing ID3 tags
*   **Performance**: `react-virtuoso` for smooth 60fps rendering of massive track lists

## ⌨️ Command Reference

| Command | Description |
| :--- | :--- |
| `MOUNT` | Opens the local directory picker to scan and index a music folder. |
| `PLAY` | Resumes playback of the current track. |
| `PAUSE` | Pauses playback. |
| `NEXT` / `PREV` | Skips forward or backward in the queue. |
| `QUEUE <SONG>` | Fuzzy-searches for a song and appends it to the active queue. |
| `QUEUENEW` | Instantly wipes the active queue. |
| `ALBUM` | Switches the UI to the 3D Cover Flow album viewer. |
| `SONGLIST` | Switches the UI back to the main track list. |
| `SEARCH <QUERY>` | Filters the active library by the search query. |
| `CLEAR` | Wipes the active search and album filters. |
| `VOL <0-100>` | Sets the master volume level. |
| `SEEK <SECONDS>`| Jumps to a specific timestamp in the current track. |
| `RESETDB` | Wipes the IndexedDB database to resolve indexing issues. |

## 💻 Running Locally

1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`
4. Open your browser and type `MOUNT` to begin indexing your local files!
