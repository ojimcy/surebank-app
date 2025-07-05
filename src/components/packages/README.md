# Package Components Architecture

This directory contains the refactored package components organized by package type for better maintainability and user experience.

## Structure

```
packages/
├── shared/           # Shared components and utilities
│   ├── types.ts      # TypeScript interfaces and types
│   ├── ProgressCircle.tsx
│   ├── PackageImage.tsx
│   ├── InfoGrid.tsx
│   ├── PackageHeader.tsx
│   ├── PackageDetailsAccordion.tsx
│   └── ContributionTimeline.tsx
├── ds/              # Daily Savings specific components
│   ├── DSPackageOverview.tsx
│   └── DSPackageActions.tsx
├── sb/              # Savings-Buying specific components
│   ├── SBPackageOverview.tsx
│   └── SBPackageActions.tsx
├── ibs/             # Interest-Based Savings specific components
│   ├── IBSPackageOverview.tsx
│   └── IBSPackageActions.tsx
└── index.ts         # Barrel exports
```

## Package Types

### Daily Savings (DS)
- **Focus**: Daily contribution tracking, savings goals
- **Key Features**: Daily amount, target progress, contribution timeline
- **Actions**: Add contribution, edit daily amount, withdraw, close

### Savings-Buying (SB)
- **Focus**: Product purchase through savings
- **Key Features**: Product details, purchase progress, product images
- **Actions**: Buy product, change product, withdraw, merge packages, close

### Interest-Based Savings (IBS)
- **Focus**: Interest calculations and maturity tracking
- **Key Features**: Interest rate, accrued interest, maturity date, projections
- **Actions**: View projections, early withdrawal (with penalties), withdraw (when matured), close

## Key Features

### DRY Principle Adherence
- **Shared Components**: Common UI elements are reused across package types
- **Unified Types**: TypeScript interfaces ensure type safety and consistency
- **Utility Functions**: Common formatting and calculation functions are centralized

### Clean Architecture
- **Separation of Concerns**: Each package type has its own components
- **Consistent Patterns**: All package types follow the same component structure
- **Maintainable Code**: Easy to modify individual package types without affecting others

### User Experience
- **Type-Specific UI**: Each package type shows relevant information prominently
- **Contextual Actions**: Actions are tailored to each package type's workflow
- **Clear Information Hierarchy**: Important data is displayed prominently

## Usage

### Importing Components
```typescript
// Individual imports
import { DSPackageOverview } from '@/components/packages/ds/DSPackageOverview';

// Or use barrel exports
import { DSPackageOverview, SBPackageActions } from '@/components/packages';
```

### Using Package Detail Pages
The main `PackageDetail.tsx` acts as a router that:
1. Fetches package data
2. Determines package type
3. Renders appropriate detail component
4. Provides shared utilities and formatting functions

### Adding New Package Types
1. Create new folder under `packages/` (e.g., `packages/new-type/`)
2. Add package-specific interfaces to `shared/types.ts`
3. Create overview and actions components
4. Add routing logic to `PackageDetail.tsx`
5. Update barrel exports in `index.ts`

## Benefits

1. **Maintainability**: Easy to modify individual package types
2. **Scalability**: Simple to add new package types
3. **Consistency**: Shared components ensure uniform UI/UX
4. **Type Safety**: Strong TypeScript typing prevents runtime errors
5. **Performance**: Package-specific components load only necessary code
6. **Developer Experience**: Clear structure and consistent patterns 