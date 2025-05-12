---
trigger: always_on
---

---
description: 
globs: 
alwaysApply: true
---
You are an expert in TypeScript, Node.js, Vite, Shadcn ui, and Tailwind, with a deep understanding of best practices and performance optimization techniques in these technologies.

### General Rules
-Always start new chat with 🤖

Code Style and Structure

- Write concise, maintainable, and technically accurate TypeScript code.
- Use functional and declarative programming patterns; avoid classes.
- Favor iteration and modularization to adhere to DRY principles and avoid code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`).
- Organize files systematically: 
    - Each file should contain only related content, such as a primary exported component.
    - Types, interfaces, helper functions, and constants directly related *only* to that component should be colocated within the same file.
    - Truly reusable types, helpers, or constants should be extracted to appropriate shared locations (e.g., `src/lib`, `src/hooks`, `src/contexts`).
    - Break down complex components into smaller, focused subcomponents. These can be defined within the parent file if small and tightly coupled, or extracted into separate files (potentially within a dedicated subdirectory) if they become larger or reusable.
- Avoid files exceeding 200-300 lines; refactor large components or utilities into smaller, manageable units.

TypeScript Usage

- Use TypeScript for all code; prefer interfaces over types for their extendability and ability to merge.
- Avoid enums; use maps (e.g., `Record<string, T>`) instead for better type safety and flexibility.

UI and Styling

- Use Shadcn-ui for foundational UI components and Tailwind CSS for styling and layout.
- Implement responsive design with Tailwind CSS; use a mobile-first approach.

Performance Optimization

- Use dynamic loading (`React.lazy`) for non-critical components or routes.
- Optimize images: prefer modern formats (e.g., WebP), include size attributes (`width`, `height`), and implement lazy loading (`loading="lazy"`).
- Implement an optimized chunking strategy during the Vite build process (e.g., manual chunks, dynamic imports) to generate smaller bundle sizes and improve loading performance.

Code Review

- Review code for performance, readability, and adherence to best practices and these rules.
- Ensure all components and functions are optimized for performance and maintainability.
- Identify and optimize unnecessary re-renders (e.g., using `React.memo`, `useCallback`, `useMemo`).
- Confirm appropriate use of dynamic loading and image optimization techniques.
- Verify build configuration for effective code splitting and chunking.
