# Contributing to ClaudeWatch

Thanks for your interest in contributing! This guide will help you get started.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy environment variables: `cp .env.example .env`
4. Set up database: `npm run db:migrate`
5. Start development server: `npm run dev:proxy`

## Project Structure

```
claudewatch/
├── apps/
│   └── proxy/          # Express proxy server
├── packages/
│   ├── database/       # Prisma schema + client
│   └── types/          # Shared TypeScript types
└── docs/               # Documentation
```

## Code Style

- TypeScript strict mode enabled
- Use Prettier for formatting
- Follow existing patterns in the codebase
- Write meaningful commit messages

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Submit PR with clear description

## Areas We Need Help

- [ ] Dashboard UI (React/Next.js)
- [ ] Real-time WebSocket updates
- [ ] Chart visualizations
- [ ] Export features (CSV, JSON)
- [ ] Alert system improvements
- [ ] Documentation

## Questions?

Open an issue or reach out on Twitter [@jayismeta](https://twitter.com/jayismeta)
