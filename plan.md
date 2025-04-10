# SureBank Mobile App UI - Product Requirements Document

## 1. Overview

The SureBank Mobile App will enable users to manage savings packages, make deposits/withdrawals, purchase products, and monitor their interest-based savings from their mobile devices. This document outlines the user interface requirements for the mobile application.

## 2. Target Users

- Existing SureBank customers
- Potential new customers seeking savings and purchasing solutions
- Users from various demographics with varying levels of tech-savviness

## 3. Design System

### 3.1 Color Palette

- **Primary Blue**: #0066A1 (For main CTAs, header backgrounds)
- **Secondary Blue**: #007DB8 (For secondary buttons, highlights)
- **Accent Blue**: #0099D8 (For minor highlights, icons)
- **White**: #FFFFFF (For backgrounds, content areas)
- **Light Gray**: #F6F8FA (For secondary backgrounds, card backgrounds)
- **Medium Gray**: #E5E8ED (For dividers, borders)
- **Dark Gray**: #6C757D (For secondary text)
- **Black**: #212529 (For primary text)
- **Success Green**: #28A745 (For positive status indicators)
- **Error Red**: #DC3545 (For alerts, errors)

### 3.2 Typography

- **Primary Font**: SF Pro Display (iOS) / Roboto (Android)
- **Headings**: Bold, sizes 24px, 20px, 18px
- **Body Text**: Regular, size 14px
- **Small Text**: Regular, size 12px
- **Button Text**: Medium, size 16px
- **Line Heights**: 1.5x font size for optimal readability

### 3.3 Component Design

- **Cards**: White background, 12px border radius, subtle shadow (0px 2px 8px rgba(0,0,0,0.08))
- **Buttons**: 48px height, 12px border radius, bold center-aligned text
- **Input Fields**: 48px height, 8px border radius, 16px padding, light border
- **Icons**: Outlined style, consistent 24x24px size
- **Status Indicators**: Circular dots with color coding
- **Navigation Bar**: Bottom-aligned, 5 primary sections with icons and labels

## 4. Core UI Components

### 4.1 Authentication Screens

- **Login Screen**

  - Full-width input fields with floating labels
  - Prominent blue primary CTA button
  - Biometric authentication option with fingerprint/face icon
  - "Forgot Password" text link below login button
  - Registration prompt with text link at bottom

- **Registration Screen**

  - Step indicator at top showing progress
  - Form fields with inline validation
  - Continue button fixed at bottom
  - Back button in header

- **KYC Verification Screen**
  - Document type selector with icons
  - Camera interface with guide overlay
  - Upload progress indicator
  - Verification status card

### 4.2 Dashboard

- **Account Overview**

  - Balance card with currency symbol and amount in large type
  - "Available to spend" subtitle text
  - Quick action buttons in row (3-4 circular icons)
  - Recent transactions list with merchant icons
  - Package cards with progress indicators

- **Notification Center**
  - Tabbed interface for different notification types
  - Timestamp with relative formatting ("2h ago")
  - Swipe actions for notification management
  - Unread indicator dots

### 4.3 Package Management

- **Package List**

  - Card-based layout with package type icon
  - Progress bar showing completion percentage
  - Current balance and target amount
  - Color-coded status indicator
  - "+" floating action button for new package

- **Package Detail Screen**

  - Header with package name and type
  - Circular progress indicator with percentage
  - Timeline of contributions
  - Action buttons in footer
  - Expandable terms section

- **Package Creation Flow**

  1. **Type Selection Screen**

     - Card options for each package type (Daily Savings, SB, Interest-Based)
     - Visual icons representing each type
     - Brief description of benefits
     - Continue button at bottom

  2. **Configuration Screen**

     - Amount input with currency symbol
     - Duration selector (for interest packages)
     - Frequency picker (daily, weekly, monthly)
     - Target date calculator

  3. **Product Selection** (for SB packages)

     - Product browse interface
     - Search functionality
     - Category filters
     - Product cards with image, name, price

  4. **Review & Confirm**

     - Summary card with all selections
     - Monthly contribution calculation
     - Terms & conditions checkbox
     - "Create Package" prominent button

  5. **Success Screen**
     - Animated checkmark
     - Package details summary
     - "Make First Contribution" button
     - "View Package" alternative option

### 4.4 Payment System

- **Deposit Screen**

  - Large numeric keypad for amount input
  - Package selector dropdown
  - Payment method cards (saved methods)
  - Receipt toggle option
  - Confirm button with amount summary

- **Withdrawal Screen**

  - Available balance display
  - Amount input with validation
  - Destination account selector
  - Fee disclosure with info icon
  - Confirmation screen with details

- **Transaction History**
  - Calendar date picker for filtering
  - Transaction cards with icon, name, amount
  - Color-coded amounts (green for deposits, red for withdrawals)
  - Search function in header
  - Filter tabs (All, Deposits, Withdrawals, Purchases)

### 4.5 Product Shopping

- **Product Catalog**

  - Grid layout with product images
  - Category navigation tabs
  - Search bar with filter icon
  - Quick-add buttons on product cards

- **Product Detail**

  - Image carousel with dot indicators
  - Product name in large font
  - Price with optional strikethrough for discounts
  - Tab navigation for Details/Specs/Reviews
  - Floating bottom bar with CTA buttons

- **Shopping Cart**

  - Product cards with quantity adjusters
  - Subtotal, shipping, tax breakdown
  - Promo code input field
  - "Checkout" button with total amount

- **Checkout Flow**
  - Address card with edit option
  - Payment method selector with card visuals
  - Order summary collapsible section
  - "Confirm & Order" button in SureBank blue

## 5. Settings Screen

### 5.1 Settings Organization

- **Hierarchical structure** with main categories and sub-settings
- **Searchable settings** with a search bar at the top
- **Recently accessed settings** section for quick access

### 5.2 Account Settings

- **Personal Information**

  - Edit name, email, phone number
  - Update address and contact details
  - Change profile picture
  - Update emergency contact

- **Security Settings**

  - Change password
  - Enable/disable biometric authentication
  - Two-factor authentication setup
  - Active sessions management
  - Login history review
  - Device management

- **KYC & Verification**
  - ID verification status
  - Document uploads
  - Address verification
  - BVN verification

### 5.3 App Preferences

- **Appearance**

  - Theme selection (light/dark/system)
  - Text size adjustment (not a priority)
  - Language selection

- **Notifications**

  - Transaction alerts toggles
  - Package contribution reminders
  - Marketing communications
  - Push notification settings
  - Email notification preferences
  - SMS alert preferences

- **Privacy**
  - Data sharing preferences
  - Analytics participation
  - Cookie preferences
  - Marketing preferences

### 5.4 Payment Settings

- **Payment Methods**

  - Manage saved cards
  - Set default payment method

- **Withdrawal Settings**
  - Preferred withdrawal methods
  - Default withdrawal account
  - Quick withdrawal setup
  - Withdrawal limits

### 5.5 Package Preferences

- **Default Package Settings**

  - Automatic contribution settings
  - Default package type
  - Package alerts and reminders

- **Interest Settings**
  - Maturity alerts timing
  - Reinvestment preferences

### 5.6 Support & Help

- **Help Center**

  - FAQs access
  - User guides

- **Support**

  - Contact support form
  - Branch locator

- **Feedback**
  - App rating option

### 5.7 Legal & Information

- **Legal Documents**

  - Terms of service
  - Privacy policy
  - User agreement
  - Interest rate policy

- **About**
  - App version
  - Update history
  - Legal information

### 5.8 Account Actions

- **Session Management**

  - Logout option
  - Log out from all devices

- **Account Status**
  - Deactivate account
  - Close account
  - Export account data

## 6. Technical Considerations

- Support offline mode for basic information viewing
- Implement efficient data synchronization
- Optimize image loading and caching
- Minimize app size and resource usage
- Ensure secure local storage of sensitive information
- Follow platform-specific design guidelines while maintaining brand consistency
