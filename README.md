# 🏛️ Kara Office Suite

**Kara Office** is a sovereign, AI-native productivity suite designed to replace traditional office software with a privacy-first, intelligent ecosystem. Built for enterprise data sovereignty and consumer privacy, Kara Office ensures that your data never leaves your control.

Unlike traditional suites that rely on cloud telemetry, Kara Office features **Kara Seek**—a homegrown, on-premises agentic AI search infrastructure that operates entirely within your local environment.

## 🌟 Core Applications

### 📝 Kara Word
A next-generation document processor featuring:
- **Deterministic Grammar Engine:** Instant, offline red-line corrections for spelling, punctuation, and syntax.
- **AI Write Assist:** Ghost-text auto-completion that suggests natural sentence endings.
- **Context-Aware Fixes:** Click-to-apply mechanical fixes or fallback to Kara AI for contextual rewrites.
- **Global Typography:** Support for 30+ font families including RTL (Arabic/Hebrew) and complex scripts.
- **Classic UI:** Full File/Edit/View ribbon, Word-style font pickers, and `.doc` / `.html` / `.txt` export.

### 📊 Kara Sheets
A mathematical spreadsheet engine featuring:
- **Formula Bar & Grid:** 15x30 interactive grid with cell navigation (Enter/Tab).
- **MathJS Engine:** Native support for cell references (`=A1+B1`) and range functions (`=SUM(A1:A5)`, `=AVERAGE()`).
- **Live Status Bar:** Real-time Sum, Average, and Count calculations.
- **CSV Export:** One-click data export for enterprise data pipelines.

### 📓 Kara Notes
A rapid-thought capture workspace with auto-saving local storage and a distraction-free UI.

---

## 🧠 The Kara AI Architecture (3-Tier System)

Kara Office does not force users into a single AI paradigm. It offers a 3-tier toggle for every task:

1. 🟣 **Kara Seek (Pro / Enterprise):** Our flagship autonomous agent. Powered by a local LLM (Qwen 2.5) and our homegrown **Kara Search** meta-engine (SearXNG). It executes complex, multi-step research goals using live web data without sending your queries to third-party APIs.
2. 🔵 **Kara Cloud (Standard):** A fast, general-purpose AI for students and casual users requiring broad knowledge and quick synthesis.
3. 🟢 **Kara Local (Offline):** A strictly offline text-processing mode for formatting, summarizing, and translating user-provided text. Zero internet connection required.

---

## 🛡️ The "Kara Seek" Agentic Engine
At the heart of the suite is the **Kara Seek Engine** (`kara-seek-engine`), a Node.js backend that implements a ReAct (Reasoning + Acting) loop. 
- **Homegrown Search:** Integrates with a local Dockerized SearXNG instance to aggregate live search results from Google, Bing, and DuckDuckGo.
- **Anti-Hallucination Protocol:** Strict system prompts and JSON validation ensure the agent relies *only* on live verified data for facts, dates, and business intelligence.
- **Self-Awareness:** The agent understands its own identity and can differentiate between conversational context and factual research requests.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, TypeScript, TailwindCSS
- **Document Engine:** TipTap (ProseMirror)
- **Math Engine:** MathJS
- **Backend Agent:** Node.js, Express
- **Local AI:** Ollama (Qwen 2.5 3B)
- **Search Infrastructure:** SearXNG (Docker)
- **Icons:** Lucide React

---

## 🚀 Getting Started (Local Deployment)

### Prerequisites
- Node.js & npm
- Docker Desktop
- Ollama (with `qwen2.5:3b` pulled)

### 1. Start the Kara Search Node (Docker)
```bash
cd kara-search-engine
docker compose up -d
