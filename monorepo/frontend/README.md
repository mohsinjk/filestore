# Product Management Application

React TypeScript application for managing products with a feature-based architecture. Organizes code by business domain rather than technical layers for better scalability and maintainability.

## Project Structure

```
src/
├── app/              # Application configuration
├── features/         # Feature modules (products, etc.)
│   └── products/     # Everything product-related
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       └── utils/
├── shared/           # Shared utilities & components
├── layouts/          # Page layouts
├── pages/            # Route pages
└── components/ui/    # shadcn/ui components
```

## Getting Started

Requires Node.js 18+ and backend API at `http://localhost:5000`

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **React Router v7** - Routing
- **TanStack Query** - Server state management
- **React Hook Form** + **Zod** - Forms & validation
- **Tailwind CSS** + **shadcn/ui** (Radix UI) - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

Path aliases configured (`@/` → `src/`)

## API Configuration

Set backend URL in [src/shared/api/config.ts](src/shared/api/config.ts)

## Features

Full CRUD operations for products with form validation, loading/error states, and responsive UI.

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Lint code
npm run preview  # Preview build
```

## License

MIT
