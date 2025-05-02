/**
 * Button style constants for consistent styling across the application
 */

// Primary button styles - blue theme (for main actions)
export const primaryButtonStyles =
  'w-full font-medium py-2.5 px-4 bg-[#0066A1] hover:bg-[#005085] text-white rounded-md transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm';

// Secondary button styles - green theme (for confirmation actions)
export const secondaryButtonStyles =
  'w-full font-medium py-2.5 px-4 bg-[#28A745] hover:bg-[#218838] text-white rounded-md transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm';

// Outline button styles - for less prominent actions
export const outlineButtonStyles =
  'w-full font-medium py-2.5 px-4 bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-md transition-colors duration-200 flex items-center justify-center gap-2';

// Destructive button styles - for dangerous actions
export const destructiveButtonStyles =
  'w-full font-medium py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm';

// Disabled button styles
export const disabledButtonStyles =
  'w-full font-medium py-2.5 px-4 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed flex items-center justify-center gap-2';
