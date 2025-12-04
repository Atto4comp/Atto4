<div align="center">
  <br />
  <a href="https://atto4.pro" target="_blank">
    <img src="./public/logo.png" alt="Atto4 Logo" width="120">
  </a>
  <br />

  # Atto4
  
  **The Next-Gen Open Source Streaming Platform**

  [![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

  <p align="center">
    <a href="#-about">About</a> •
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-project-structure">Structure</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>

---

## 🚀 About

**Atto4** is a modern, open-source streaming platform built for speed, aesthetics, and community. We aim to create the ultimate movie and TV show discovery experience, combining a sleek, Apple TV-inspired UI with robust performance.

We believe streaming should be beautiful, fast, and **free for everyone to build upon**. Whether you're a React beginner or a Next.js veteran, Atto4 is your playground to experiment with the latest web technologies.

## 📸 Screenshots

<div align="center">
  <img src="./public/Screenshot1.png" alt="Home Page" width="800" />
</div>

## ✨ Features

- 🎥 **Vast Library**: Integration with TMDB for comprehensive movie and TV show metadata.
- ⚡ **Blazing Fast**: Built on Next.js 15 with Server Components and ISR (Incremental Static Regeneration).
- 🎨 **Sleek UI/UX**: Minimalist, glassmorphism-inspired design using Tailwind CSS.
- 📱 **Responsive**: Perfect experience across mobile, tablet, and desktop.
- 🔍 **Smart Search**: Instant search results with optimized debounce logic.
- ⏯️ **Advanced Player**: Custom video player with auto-server switching and anti-redirect protection.
- ❤️ **Personalization**: LocalStorage-based Watchlist and "Liked" collections (No login required!).

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **Data Source**: [TMDB API](https://www.themoviedb.org/)
- **State Management**: React Hooks + Context API
- **Package Manager**: [pnpm](https://pnpm.io/) (Recommended)

## 📂 Project Structure

A quick look at the top-level files and directories you'll see in the project:

```text
.
├── app/                  # Next.js App Router pages and layouts
├── components/           # Reusable UI components (Buttons, Cards, Player)
├── lib/                  # Utility functions and API configurations
├── public/               # Static assets (images, fonts)
├── .env.local            # Environment variables (API Keys)
└── next.config.ts        # Next.js configuration
````

## 🏁 Getting Started

Ready to dive in? Follow these steps to get Atto4 running locally.

### Prerequisites

  - Node.js 18+ installed
  - A [TMDB API Key](https://www.themoviedb.org/documentation/api) (It's Free\!)

### Installation

1.  **Clone the repo**

    ```bash
    git clone [https://github.com/yourusername/atto4.git](https://github.com/yourusername/atto4.git)
    cd atto4
    ```

2.  **Install dependencies**
    We recommend using `pnpm` for speed, but npm works too.

    ```bash
    pnpm install
    # or
    npm install
    ```

3.  **Configure Environment**
    Create a `.env.local` file in the root directory and add your keys:

    ```env
    NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ```

4.  **Run the development server**

    ```bash
    pnpm dev
    ```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to see the magic\! ✨

## 🤝 Contributing

We ❤️ contributors\! Atto4 is built by the community, for the community.

**Don't know where to start?**
Check out our [Issues](https://github.com/yourusername/atto4/issues) tab\! We have labeled tasks for everyone:

| Label | Description |
| :--- | :--- |
| 🟢 **Good First Issue** | Perfect for beginners. UI tweaks, typos, simple components. |
| 🟡 **Enhancement** | New features, API integrations, and search improvements. |
| 🔴 **Advanced** | Backend auth, database integration, performance optimization. |

### How to submit a Pull Request

1.  **Fork** the repository.
2.  **Create a branch** for your feature (`git checkout -b feature/AmazingFeature`).
3.  **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4.  **Push** to the branch (`git push origin feature/AmazingFeature`).
5.  **Open a Pull Request**.

## 🗺 Roadmap

  - [x] Core Streaming UI (Home, Details, Player)
  - [x] Search Functionality
  - [x] Watchlist & Likes (Local Storage)
  - [ ] **User Authentication** (Save watchlist across devices)
  - [ ] **Multi-Language Support** (i18n)
  - [ ] **PWA Support** (Installable app)
  - [ ] **Social Features** (Share lists with friends)

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

-----

<div align="center"\>
<p\>Built with 💻 and ☕ by the Atto4 Community.</p\>
<p\>
<br>
<br>
<a href="https://github.com/yourusername/atto4/stargazers"\>
<img src="https://img.shields.io/github/stars/yourusername/atto4?style=social" alt="GitHub stars"\>
</a\>
</p\>
</div\>

