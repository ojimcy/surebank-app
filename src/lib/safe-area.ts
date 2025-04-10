// Function to add CSS variables for safe area insets
export function setupSafeArea() {
  // Enable safe area support by adding these CSS variables to :root
  // We update them on resize to catch device orientation changes

  function updateSafeAreaVariables() {
    // Get the document root element
    const root = document.documentElement;

    // Add safe area variables with fallback values
    root.style.setProperty('--sat', 'env(safe-area-inset-top, 0px)');
    root.style.setProperty('--sar', 'env(safe-area-inset-right, 0px)');
    root.style.setProperty('--sab', 'env(safe-area-inset-bottom, 0px)');
    root.style.setProperty('--sal', 'env(safe-area-inset-left, 0px)');
  }

  // Add variables immediately
  updateSafeAreaVariables();

  // Update variables on resize/orientation change
  window.addEventListener('resize', updateSafeAreaVariables);

  // Cleanup function for React components
  return () => {
    window.removeEventListener('resize', updateSafeAreaVariables);
  };
}

// CSS class utilities for applying safe area padding
// Use these with className in components
export const safeAreaClasses = {
  paddingTop: 'pt-[var(--sat)]',
  paddingRight: 'pr-[var(--sar)]',
  paddingBottom: 'pb-[var(--sab)]',
  paddingLeft: 'pl-[var(--sal)]',

  // Combined padding utilities
  paddingX: 'px-[var(--sal)] px-[var(--sar)]',
  paddingY: 'py-[var(--sat)] py-[var(--sab)]',

  // All sides
  padding: 'p-[var(--sat)] p-[var(--sar)] p-[var(--sab)] p-[var(--sal)]',
};
