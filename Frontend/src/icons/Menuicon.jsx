// src/icons/Menuicon.jsx

export function Menuicon(props) {
  return (
    // We'll use a button to make the icon clickable
    <button onClick={props.onClick} className="mr-3">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        // Pass className prop to the SVG for easy styling
        className={props.className || "size-7 text-black"} 
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    </button>
  );
}