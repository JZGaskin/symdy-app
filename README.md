# Symdy — AI Companion That Actually Remembers You

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Release](https://img.shields.io/github/v/release/JZGaskin/symdy-app)](https://github.com/JZGaskin/symdy-app/releases)
[![Platform](https://img.shields.io/badge/platform-linux%20|%20macOS%20|%20windows-lightgrey)](https://jzgaskin.github.io/symdy-app/)

**[🌐 Visit the Landing Page](https://jzgaskin.github.io/symdy-app/)**
• **[📖 Symdy: An AI Companion That Actually Remembers You](https://telegra.ph/Symdy-An-AI-Companion-That-Actually-Remembers-You-05-13)**
• **[📖 Meet Symdy — An Open Source Desktop AI Companion](https://telegra.ph/Meet-Symdy--An-Open-Source-Desktop-AI-Companion-That-Remembers-You-05-13)**

---

## What is Symdy?

Symdy is a **desktop AI companion with persistent memory**. Unlike cloud-based AI assistants that forget everything between conversations, Symdy lives on your computer and remembers who you are, what you're working on, and how you like to work.

Built on the [pi agent framework](https://pi.everywhere.social/), Symdy runs as an Electron desktop app and connects to any LLM provider of your choice.

## Key Features

- **🧠 Persistent Memory** — Tell Symdy something once, it remembers forever. No more reintroducing yourself every session.
- **💻 Runs Locally** — Your conversations stay on your machine. No cloud dependency, no privacy concerns.
- **🔌 Provider-Agnostic** — Works with OpenAI, Anthropic, Ollama, or any OpenAI-compatible API endpoint.
- **🔄 Cross-Session Context** — Symdy maintains context across conversations, building a rich understanding of you over time.
- **🎨 Clean Desktop UI** — Native-feeling Electron app with a minimal, focused interface.

## Download

| Platform | Download |
|----------|----------|
| 🐧 Linux (AppImage) | [Download v0.1.8](https://github.com/JZGaskin/symdy-app/releases/download/v0.1.8/symdy-0.1.8.AppImage) |
| 🍎 macOS | [View all releases](https://github.com/JZGaskin/symdy-app/releases) |
| 🪟 Windows | [View all releases](https://github.com/JZGaskin/symdy-app/releases) |

## Quick Start

1. **Download** the AppImage for Linux from the [releases page](https://github.com/JZGaskin/symdy-app/releases).
2. **Make it executable**: `chmod +x symdy-*.AppImage`
3. **Run it**: `./symdy-*.AppImage`
4. **Configure** your preferred LLM provider in the settings panel.

### Running from Source

```bash
git clone https://github.com/JZGaskin/symdy-app.git
cd symdy-app
npm install
npm start
```

## Architecture

Symdy wraps the [pi agent framework](https://pi.everywhere.social/) in an Electron desktop shell. The pi agent runs in RPC mode, handling memory, tool execution, and conversation management. The Electron frontend provides a native desktop experience.

```
┌─────────────────────────────────┐
│         Electron Shell          │
│  ┌───────────────────────────┐  │
│  │    pi Agent (RPC Mode)    │  │
│  │  • Memory Management     │  │
│  │  • Tool Execution        │  │
│  │  • LLM Integration      │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

## Configuration

Symdy reads configuration from environment variables or a `.env` file in the application directory:

| Variable | Description | Required |
|----------|-------------|----------|
| `LLM_PROVIDER` | Provider to use (openai, anthropic, ollama) | Yes |
| `API_KEY` | API key for your chosen provider | Yes |
| `MODEL` | Model name (e.g., gpt-4, claude-3, llama3) | No |

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Build for production
npm run build
```

## License

MIT — see [LICENSE](LICENSE) for details.

---

*Symdy is an open-source project. Contributions, issues, and stars are welcome.*
