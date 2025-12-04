<div align="center">
  <br />
  <a href="https://atto4.pro" target="_blank">
    <img src="public/logo.png" alt="Atto4 Logo" width="150">
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
    <a href="#-contributing">Contributing</a> •
    <a href="#-roadmap">Roadmap</a>
  </p>
</div>

---

## 🚀 About

**Atto4** is a modern, open-source streaming platform built for speed, aesthetics, and community. We aim to create the ultimate movie and TV show discovery experience, combining a sleek, Apple TV-inspired UI with robust performance.

We believe streaming should be beautiful, fast, and **free for everyone to build upon**. Whether you're a React beginner or a Next.js veteran, Atto4 is your playground to experiment with the latest web technologies.

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
- **Deployment**: Vercel (Recommended)

## 🏁 Getting Started

Ready to dive in? Follow these steps to get Atto4 running locally.

### Prerequisites
- Node.js 18+ installed
- A [TMDB API Key](https://www.themoviedb.org/documentation/api) (Free!)

### Installation

1. **Clone the repo**
git clone https://github.com/yourusername/atto4.git
cd atto4

text

2. **Install dependencies**
npm install

or
yarn install

text

3. **Configure Environment**
Create a `.env.local` file in the root directory:
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000

text

4. **Run the development server**
npm run dev

text

Open [http://localhost:3000](http://localhost:3000) to see the magic! ✨

## 🤝 Contributing

We ❤️ contributors! Atto4 is built by the community, for the community. Here's how you can help:

1.  **Fork** the repository.
2.  **Create a branch** for your feature (`git checkout -b feature/AmazingFeature`).
3.  **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4.  **Push** to the branch (`git push origin feature/AmazingFeature`).
5.  **Open a Pull Request**.

### 💡 Looking for ideas?
Check out our [Issues](https://github.com/yourusername/atto4/issues) tab! We have tasks for everyone:
- 🟢 **Beginner**: UI tweaks, fixing typos, adding tooltips.
- 🟡 **Intermediate**: New API integrations, improving the search algorithm.
- 🔴 **Advanced**: Backend auth, database integration (Supabase/Firebase), performance optimization.

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

---

<div align="center">
<p>Built with 💻 and ☕ by the Atto4 Community.</p>
<p>
 <a href="https://github.com/yourusername/atto4/stargazers">
   <img src="https://img.shields.io/github/stars/yourusername/atto4?style=social" alt="GitHub stars">
 </a>
</p>
</div>
