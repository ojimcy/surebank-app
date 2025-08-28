# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **SureBank Mobile Application** - a React Native app built with Capacitor for cross-platform deployment. Part of the SureBank financial services platform monorepo.

## Development Commands

### Essential Commands
```bash
npm run dev        # Start Vite development server (port 8080)
npm run build      # Build for production with TypeScript check
npm run lint       # Run ESLint for code quality
npm run preview    # Preview production build locally
```

### Mobile Platform Commands
```bash
npm run android           # Build and open Android app in debug mode
npm run android:prod      # Build production version and open Android
npm run android:build     # Build Android APK (debug)
npm run android:build:release # Build Android APK (release)
npm run ios              # Build and open iOS app in Xcode
npm run ios:prod         # Build production version and open iOS
```

### Build & Analysis Commands
```bash
npm run build:prod       # Production build with Capacitor sync
npm run build:analyze    # Build with bundle analyzer (creates dist/stats.html)
npm run cap:sync         # Sync web assets to native platforms
npm run cap:copy         # Copy web assets to native platforms
```

## Architecture & Tech Stack

### Core Technologies
- **Framework**: React 19 with TypeScript 5.7
- **Build Tool**: Vite 6.2 with optimized configuration
- **Mobile Runtime**: Capacitor 7.2 for iOS/Android deployment
- **Styling**: Tailwind CSS 4.1 with custom components
- **State Management**: TanStack Query (React Query) 5.72
- **Routing**: React Router DOM 7.5

### UI Components
- **Component Library**: Custom components built on Radix UI primitives
- **Icons**: Lucide React icons
- **Animations**: Framer Motion for smooth interactions
- **Toast Notifications**: React Hot Toast

### Mobile-Specific Features
- **Push Notifications**: Firebase Cloud Messaging integration
- **Analytics**: Firebase Analytics & Crashlytics
- **Deep Linking**: Custom URL scheme handling
- **Biometric Auth**: PIN verification with biometric support
- **File Upload**: AWS S3 integration for document uploads

### Development Tools
- **Linting**: ESLint 9.21 with TypeScript and React plugins
- **Bundle Analysis**: Rollup visualizer for performance optimization
- **Hot Reload**: Vite HMR with 120s timeout for mobile development

## Project Structure

### Key Directories
- `src/pages/` - Page components organized by feature
- `src/components/` - Reusable UI components and layout components
- `src/hooks/` - Custom React hooks, especially for API queries
- `src/lib/` - Core services, providers, and utilities
- `src/lib/api/` - API client modules for different domains
- `src/lib/services/` - Platform services (analytics, notifications, etc.)

### Important Files
- `capacitor.config.ts` - Capacitor configuration for mobile features
- `vite.config.ts` - Highly optimized Vite build configuration
- `src/App.tsx` - Main app component with routing and providers
- `tailwind.config.js` - Tailwind CSS configuration

## Code Patterns & Conventions

### Component Organization
- **Pages**: Located in `src/pages/[feature]/` directories
- **Components**: Shared components in `src/components/ui/`
- **Layouts**: App layout components in `src/components/layout/`
- **Guards**: Authentication guards in `src/components/auth/`

### State Management Pattern
- **TanStack Query**: Used for server state management
- **Custom Hooks**: Domain-specific query hooks in `src/hooks/queries/`
- **Context Providers**: App-level state in `src/lib/*-provider.tsx`

### API Integration
- **Axios Client**: Centralized HTTP client with interceptors
- **Query Hooks**: Abstracted API calls with caching and error handling
- **Authentication**: JWT token management with automatic refresh

### Mobile Development
- **Capacitor Plugins**: Native functionality access
- **Safe Area**: Platform-specific safe area handling
- **Platform Detection**: Conditional logic for iOS/Android differences

## Build Optimization

### Bundle Splitting Strategy
- **Vendor**: Core React libraries
- **UI**: Radix UI components
- **Firebase**: Firebase and Capacitor plugins
- **AWS**: AWS SDK modules
- **Utils**: Utility libraries (date-fns, axios, etc.)

### Performance Features
- **Lazy Loading**: Route-based code splitting with custom lazy component wrapper
- **Tree Shaking**: Optimized for Firebase and Capacitor modules
- **Asset Optimization**: Separate chunks for images, styles, and scripts
- **Production Optimizations**: Console removal, minification, and compression

## Testing & Quality

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: React and TypeScript specific rules
- **Import Organization**: Path aliases with `@/` for src directory

### Mobile Testing
- **Development**: Chrome DevTools for web debugging
- **iOS**: Safari Web Inspector for iOS debugging
- **Android**: Chrome remote debugging for Android testing

## Deployment Process

### Development Workflow
1. **Web Development**: `npm run dev` for rapid iteration
2. **Mobile Testing**: `npm run android` or `npm run ios` for native testing
3. **Production Build**: `npm run build:prod` includes Capacitor sync

### Release Process
1. **Build**: `npm run build:prod` - Creates optimized production build
2. **Sync**: Capacitor automatically syncs during production build
3. **Android**: Use `npm run android:build:release` for release APK
4. **iOS**: Open in Xcode via `npm run ios:prod` and archive

## Platform-Specific Considerations

### iOS Configuration
- **Scheme**: `surebank://` URL scheme for deep linking
- **Status Bar**: Dark style with blue background
- **Content Inset**: Automatic handling for notched devices

### Android Configuration
- **Package**: `surebankstores.ng` app identifier
- **Background**: Blue background color (#0066A1)
- **Scheme**: HTTPS scheme for security

### Firebase Integration
- **iOS**: `GoogleService-Info.plist` in ios/App/App/
- **Android**: `google-services.json` in android/app/
- **Services**: Analytics, Crashlytics, and Messaging enabled

## Common Development Tasks

### Adding a New Page
1. Create page component in `src/pages/[feature]/`
2. Add route in `src/App.tsx` router configuration
3. Create API hooks in `src/hooks/queries/` if needed
4. Add navigation links in layout components

### Integrating New API Endpoint
1. Add API function in `src/lib/api/[domain].ts`
2. Create query/mutation hooks in `src/hooks/queries/`
3. Use hooks in page components with proper error handling

### Adding Mobile Features
1. Install Capacitor plugin: `npm install @capacitor/[plugin]`
2. Add configuration in `capacitor.config.ts`
3. Sync changes: `npm run cap:sync`
4. Import and use in TypeScript with proper platform detection

## Environment & Configuration

### Development Server
- **Port**: 8080 (configured in vite.config.ts)
- **HMR**: 120-second timeout for mobile development
- **Polling**: Enabled for file watching reliability

### Build Configuration
- **Output**: `dist/` directory
- **Assets**: Organized in `assets/` subdirectories by type
- **Sourcemaps**: Disabled in production for performance
- **Target**: ESNext for modern JavaScript features