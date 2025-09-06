
/**
 * Defines a set of predefined styles for different button variants.
 * This allows for consistent button styling across the application.
 */
const style = {
    "primary": "w-25 h-10 my-1 mx-1", // Standard primary button
    "secondary": "w-full m-1",      // Full-width secondary button
    "danger": "w-25 h-10 my-1 mx-1 bg-red-700 hover:bg-red-500", // Danger/delete button
    "S-1": "w-full h-10",           // Style variant 1 (used in Cards)
    "S-2": "w-full h-11 my-3",      // Style variant 2
    "S-3": "w-full h-11 my-1"       // Style variant 3
}


//A reusable button component with different style variants.

export function Button({ disabled, children, onClick, variant, Start }) {
  return (
    <button
      className={`bg-blue-700 text-white px-7 rounded-full flex items-center justify-center gap-x-2
                  hover:bg-blue-500
                  hover:scale-105
                  transition-transform duration-300 ease-in-out
                  disabled:bg-gray-400 disabled:cursor-not-allowed
                  ${style[variant]}`}
      disabled={disabled}
      onClick={onClick}
    >
      {Start && <Start />}
      {children}
    </button>
  );
}