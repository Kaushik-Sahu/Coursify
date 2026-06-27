import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Magicon } from "../icons/magicon";

/**
 * A functional search input component that updates search query params
 * and navigates to the Courses page to display filtered results.
 */
export function Search() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentSearch = searchParams.get('search') || '';
    const [query, setQuery] = useState(currentSearch);

    // Sync input with search params if the URL changes directly (e.g. going back or navigating away)
    useEffect(() => {
        setQuery(currentSearch);
    }, [currentSearch]);

    function handleSearch(e) {
        e.preventDefault();
        const trimmedQuery = query.trim();
        if (trimmedQuery) {
            navigate(`/courses?search=${encodeURIComponent(trimmedQuery)}`);
        } else {
            navigate('/courses');
        }
    }

    return (
        <form onSubmit={handleSearch} className="flex m-2">
            <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for courses..." 
                className="bg-[#f6f7f9] dark:bg-slate-900 w-full sm:w-72 md:w-96 h-11 pl-4 text-left rounded-l-full border border-r-0 border-[#64748b] dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-950 transition-all text-slate-800 dark:text-slate-100"
            />
            <button 
                type="submit"
                className="bg-[#f6f7f9] dark:bg-slate-900 text-slate-600 dark:text-slate-400 w-12 h-11 p-2 rounded-r-full border border-l-0 border-[#64748b] dark:border-slate-700 hover:scale-105 transition-transform duration-200 cursor-pointer flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800"
            >
                <Magicon />
            </button>
        </form>
    );
}
