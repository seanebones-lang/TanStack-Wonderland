# TanStack Wonderland

TanStack Wonderland is a dynamic web dashboard showcasing the entire TanStack ecosystem: Router for navigation, Query for data syncing, Table for data grids, Virtual for performant lists, and Form for validation. Users explore PokeAPI data with infinite scrolling tables, submit Pokemon teams via forms, and navigate seamlessly.

## 🚀 Features

- **TanStack Router**: File-based routing with type-safe navigation and prefetching
- **TanStack Query**: Data fetching with caching, infinite queries, and optimistic updates
- **TanStack Table**: Virtualized table with sorting and filtering
- **TanStack Virtual**: High-performance virtualization for large lists
- **TanStack Form**: Form management with Zod validation
- **Eleven Chatbot**: AI-powered assistant (powered by NextEleven) with comprehensive TanStack knowledge
- **Tailwind CSS**: Modern, responsive styling with dark mode support
- **TypeScript**: Full type safety throughout the application

## 📦 Tech Stack

- **React 19** - Latest React with modern features
- **Vite 6.4.0** - Fast build tool and dev server
- **TypeScript** - Type-safe development
- **TanStack Router 1.49.0** - File-based routing
- **TanStack Query 5.60.5** - Server state management
- **TanStack Table 8.20.5** - Powerful table component
- **TanStack Virtual 3.1.2** - Virtual scrolling
- **TanStack Form 0.35.0** - Form state management
- **Zod 3.23.8** - Schema validation
- **Tailwind CSS 3.4.14** - Utility-first CSS

## 🛠️ Getting Started

### Prerequisites

- Node.js 22.12.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/seanebones-lang/TanStack-Wonderland.git
cd TanStack-Wonderland
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. (Optional) Set up Grok AI API for the chatbot:
   - Create a `.env.local` file in the root directory
   - Add your Grok API key: `VITE_GROK_API_KEY=your_api_key_here`
   - Get your API key from: https://x.ai/api
   - Note: The chatbot will work with mock responses if no API key is provided

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/       # Reusable React components
│   ├── Chatbot.tsx  # Eleven AI chatbot component
│   ├── ErrorBoundary.tsx
│   ├── LanguageSelector.tsx
│   └── Toast.tsx
├── routes/           # TanStack Router file-based routes
│   ├── __root.tsx    # Root layout with navigation
│   ├── index.tsx     # Home page with Pokemon grid
│   ├── pokemon-table.tsx  # Virtualized table page
│   └── form.tsx      # Pokemon team builder form
├── mocks/            # MSW handlers for testing
├── queryClient.ts    # TanStack Query configuration
├── router.tsx        # Router setup
└── main.tsx          # Application entry point
```

## 🎯 Pages

### Home (`/`)
- Displays a grid of Pokemon fetched from PokeAPI
- Uses TanStack Query for data fetching
- Includes loading states and error handling

### Pokemon Table (`/pokemon-table`)
- Virtualized table with infinite scrolling
- Sorting and filtering capabilities
- Uses TanStack Table + Virtual for performance
- Fetches data in pages using infinite queries

### Team Builder (`/form`)
- Form to build a team of 6 Pokemon
- Zod validation with TanStack Form
- Optimistic updates with mutations
- Real-time form validation

### Eleven Chatbot
- AI-powered assistant named "Eleven" (powered by NextEleven)
- Comprehensive knowledge of TanStack ecosystem
- Expert guidance on implementing TanStack libraries in enterprise software
- Accessible via floating chat button on all pages
- Responsive design for mobile and desktop

## 🧪 Testing

MSW (Mock Service Worker) is set up for testing. To use mocks:

1. Import the worker in your test setup:
```typescript
import { worker } from './mocks/browser'
worker.start()
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

The app is configured to work with Vercel out of the box.

## 🎨 Features in Detail

### Router Features
- File-based routing with automatic route generation
- Type-safe navigation
- Route prefetching on hover
- Error boundaries

### Query Features
- Automatic caching and background refetching
- Infinite queries for pagination
- Optimistic updates
- Devtools integration
- Cross-tab synchronization

### Table Features
- Virtual scrolling for performance
- Column sorting
- Global filtering
- Infinite data loading

### Form Features
- Field-level validation
- Schema validation with Zod
- Form state management
- Optimistic updates

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC

## 🔗 Links

- [TanStack Router Docs](https://tanstack.com/router)
- [TanStack Query Docs](https://tanstack.com/query)
- [TanStack Table Docs](https://tanstack.com/table)
- [TanStack Virtual Docs](https://tanstack.com/virtual)
- [TanStack Form Docs](https://tanstack.com/form)
- [PokeAPI](https://pokeapi.co/)
