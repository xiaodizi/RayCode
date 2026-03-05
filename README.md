# RayCode - Open Agentic Coding Platform

## Features

### 🚀 Paper2Code

Automated implementation of complex algorithms from research papers. Converts academic papers into production-ready code.

### 🎨 Text2Web

Automated frontend web development. Translates plain text descriptions into fully functional, visually appealing web applications.

### ⚙️ Text2Backend

Automated backend development. Generates efficient, scalable backend code from simple text inputs.

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) 1.0+
- LLM API Key (OpenAI, Anthropic, or LiteLLM)

### Installation

```bash
# Clone the repository
git clone https://github.com/xiaodiz/RayCode.git
cd RayCode

# Install dependencies
bun install

# Copy environment configuration
cp .env.example .env
```

### Configuration

Edit `.env` file with your settings:

```bash
# LLM Configuration
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o
LLM_API_KEY=your-api-key-here

# Optional: Search
SEARCH_PROVIDER=brave
SEARCH_API_KEY=your-brave-key

# Optional: GitHub
GITHUB_TOKEN=your-github-token
```

## Usage

### CLI

```bash
# Start CLI
bun run start
```

### Web Interface

```bash
# Start web server
bun run web
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        RayCode Engine                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │  Orchestra- │  │   Intent    │  │  Document   │           │
│  │    tor      │  │  Analyzer   │  │   Parser    │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Code      │  │   Code      │  │   Code      │           │
│  │   Planner   │  │  Reference  │  │  Generator  │           │
│  │             │  │   Miner     │  │             │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
├─────────────────────────────────────────────────────────────────┤
│                         MCP Tools                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ filesystem│ │  search  │ │ execute  │ │   GitHub  │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## License

MIT License - see [LICENSE](./LICENSE) for details.
