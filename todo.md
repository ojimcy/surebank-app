# TODO

This file tracks our progress building the SureBank Mobile App UI.

## 0. App Shell & Layout

- [✅] **Root Layout**
  - [✅] Responsive `<App>` wrapper with global context providers (Theme, Auth, QueryClient)
  - [✅] Safe‑area handling on iOS/Android
- [✅] **Header**
  - [✅] App logo/title on left
  - [✅] Contextual action icons (notifications, profile) on right
  - [✅] Sticky behavior on scroll
  - [✅] Back button when in nested screens
- [✅] **Footer / Bottom Navigation**
  - [✅] 5 primary tabs: Dashboard, Packages, Deposit, Shop, Settings
  - [✅] Active tab indicator
  - [✅] Accessible labels for each icon
  - [✅] Responsive spacing for different screen sizes
- [✅] **Global Modals & Overlays**
  - [✅] Confirmation dialog component
  - [✅] Full‑screen loader overlay
  - [✅] Toast / Snackbar container

## 1. Authentication Screens

- [ ] Login Screen
  - [ ] Full‑width inputs with floating labels
  - [ ] Primary CTA button (blue)
  - [ ] Biometric option (fingerprint/face icon)
  - [ ] "Forgot Password" link
  - [ ] Registration prompt link
- [ ] Registration Screen
  - [ ] Step indicator at top
  - [ ] Inline validation on form fields
  - [ ] Fixed "Continue" button at bottom
  - [ ] Header "Back" button
- [ ] KYC Verification Screen
  - [ ] Document type selector with icons
  - [ ] Camera interface + guide overlay
  - [ ] Upload progress indicator
  - [ ] Verification status card

## 2. Dashboard

- [ ] Account Overview
  - [ ] Balance card (currency + large amount)
  - [ ] "Available to spend" subtitle
  - [ ] Quick‑action circular icons (3–4)
  - [ ] Recent transactions list + merchant icons
  - [ ] Package cards with progress bars
- [ ] Notification Center
  - [ ] Tabbed interface (types)
  - [ ] Relative timestamps ("2h ago")
  - [ ] Swipe actions (archive/delete)
  - [ ] Unread indicator dots

## 3. Package Management

- [ ] Package List
  - [ ] Card layout with type icon
  - [ ] Progress bar + percentage
  - [ ] Balance vs. target amount
  - [ ] Color‑coded status dot
  - [ ] "+" FAB for new package
- [ ] Package Detail Screen
  - [ ] Header with name/type
  - [ ] Circular progress indicator
  - [ ] Contribution timeline
  - [ ] Footer action buttons
  - [ ] Expandable terms section
- [ ] Package Creation Flow
  - [ ] Type Selection Screen
    - [ ] Cards for Daily, SB, Interest packages
    - [ ] Icons + brief descriptions
    - [ ] Continue button
  - [ ] Configuration Screen
    - [ ] Amount input (currency)
    - [ ] Duration selector
    - [ ] Frequency picker (daily/weekly/monthly)
    - [ ] Target‑date calculator
  - [ ] Product Selection (SB only)
    - [ ] Browse interface + search
    - [ ] Category filters
    - [ ] Product cards (image, name, price)
  - [ ] Review & Confirm
    - [ ] Summary card (all selections)
    - [ ] Monthly contribution calc
    - [ ] T&C checkbox
    - [ ] "Create Package" button
  - [ ] Success Screen
    - [ ] Animated checkmark
    - [ ] Summary details
    - [ ] "Make First Contribution" button
    - [ ] "View Package" link

## 4. Payment System

- [ ] **Paystack Setup**
- [ ] Deposit Screen
  - [ ] Numeric keypad for amount
  - [ ] Package selector dropdown
  - [ ] Saved‑method cards
  - [ ] Receipt toggle
  - [ ] Confirm button with summary
  - [ ] Integrate PaystackCheckout component and handle `onSuccess`/`onClose` callbacks
- [ ] Withdrawal Screen
  - [ ] Available balance display
  - [ ] Amount input + validation
  - [ ] Destination account selector
  - [ ] Fee disclosure + info icon
  - [ ] Confirmation details screen
- [ ] Transaction History
  - [ ] Calendar date picker
  - [ ] Transaction cards (icon, name, amount)
  - [ ] Color‑coded amounts (green/red)
  - [ ] Header search function
  - [ ] Filter tabs (All, Deposits, Withdrawals, Purchases)

## 5. Product Shopping

- [ ] Product Catalog
  - [ ] Grid layout with images
  - [ ] Category tabs
  - [ ] Search bar + filter icon
  - [ ] Quick‑add buttons on cards
- [ ] Product Detail
  - [ ] Image carousel + dot indicators
  - [ ] Name + price (with discount strikethrough)
  - [ ] Tabs: Details / Specs / Reviews
  - [ ] Floating bottom CTA bar
- [ ] Shopping Cart
  - [ ] Product cards + quantity adjusters
  - [ ] Subtotal, shipping, tax breakdown
  - [ ] Promo code input
  - [ ] "Checkout" button with total
- [ ] Checkout Flow
  - [ ] Address card + edit
  - [ ] Payment method selector
  - [ ] Collapsible order summary
  - [ ] "Confirm & Order" button

## 6. Settings Screen

- [ ] Settings Organization
  - [ ] Hierarchical categories + sub‑settings
  - [ ] Search bar at top
  - [ ] Recently accessed section
- [ ] Account Settings
  - [ ] Personal info (name, email, phone)
  - [ ] Profile picture upload
  - [ ] Emergency contact update
- [ ] Security Settings
  - [ ] Change password
  - [ ] Biometric toggle
  - [ ] 2FA setup
  - [ ] Active sessions management
  - [ ] Login history
  - [ ] Device management
- [ ] KYC & Verification
  - [ ] ID status
  - [ ] Document uploads
  - [ ] Address verification
  - [ ] BVN verification
- [ ] App Preferences
  - [ ] Theme (light/dark/system)
  - [ ] Text size (if needed)
  - [ ] Language selector
- [ ] Notifications
  - [ ] Transaction alerts
  - [ ] Package reminders
  - [ ] Marketing toggles
  - [ ] Push/email/SMS prefs
- [ ] Privacy
  - [ ] Data sharing prefs
  - [ ] Analytics opt‑in/out
  - [ ] Cookie settings
  - [ ] Marketing prefs
- [ ] Payment Settings
  - [ ] Manage saved cards
  - [ ] Default payment method
  - [ ] Withdrawal defaults & limits
- [ ] Package Preferences
  - [ ] Auto‑contribution settings
  - [ ] Default package type
  - [ ] Maturity & reinvest alerts
- [ ] Support & Help
  - [ ] FAQs & guides
  - [ ] Contact support form
  - [ ] Branch locator
  - [ ] Feedback/rating
- [ ] Legal & Information
  - [ ] Terms of Service
  - [ ] Privacy Policy
  - [ ] User Agreement
  - [ ] Interest Rate Policy
- [ ] Account Actions
  - [ ] Logout (single/all devices)
  - [ ] Deactivate/Close account
  - [ ] Export account data

## 7. Technical Considerations

- [ ] Offline mode support (read‑only)
- [ ] Data synchronization strategy
- [ ] Image loading & caching optimizations
- [ ] Minimize bundle size & resource usage
- [ ] Secure local storage for sensitive data
- [ ] Platform‑specific UI guideline compliance
