import { Magicon } from "../icons/magicon"

/**
 * A search input component with a search button.
 * Note: The search functionality is not yet implemented.
 */
export function Search() {
    function search() {
        
    }

    return (
        <div className="flex m-2">
            <input 
                type="text" 
                placeholder="Search for courses..." 
                className="bg-[#f6f7f9] w-full sm:w-72 md:w-96 h-11 pl-3 text-left rounded-l-full border border-r-0 border-[#64748b] focus:outline-none focus:border-blue-500"
            />
            <button 
                onClick={search} 
                className="bg-[#f6f7f9] w-12 h-11 p-2 rounded-r-full border border-l-0 border-[#64748b] hover:scale-105 transition-transform duration-200"
            >
                <Magicon />
            </button>
        </div>
    );
}
