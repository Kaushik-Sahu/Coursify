import { Button } from './button';


// A reusable card component for displaying content, typically for courses.

export function Card({ title, imageLink, price, buttons, badge, creatorName }) {
    return (
        <div className='group rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 w-full flex flex-col bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 overflow-hidden'>
            <div className="relative overflow-hidden h-36 sm:h-52">
                <img
                    src={imageLink || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"}
                    alt={title}
                    className='object-cover w-full h-full group-hover:scale-105 transition-transform duration-500'
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {badge && (
                    <div className="absolute top-4 left-4 bg-slate-900/85 dark:bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-extrabold text-white shadow-sm border border-white/10 dark:border-slate-800">
                        {badge}
                    </div>
                )}
                {price !== undefined && (
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-slate-800 dark:text-slate-100 shadow-sm border border-white/50 dark:border-slate-800">
                        ₹{price}
                    </div>
                )}
            </div>

            <div className="p-3 sm:p-4 flex flex-col flex-grow relative bg-white dark:bg-slate-950">
                <h3 className='text-sm sm:text-xl font-bold mb-1 text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight flex-grow'>{title}</h3>
                
                {creatorName && (
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-600 dark:text-slate-300">
                            {creatorName.charAt(0).toUpperCase()}
                        </span>
                        {creatorName}
                    </p>
                )}
                {!creatorName && <div className="mb-4"></div>}

                <div className={`grid gap-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 ${buttons?.length === 3 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {buttons && buttons.map((button, index) => (
                        <button
                            key={index}
                            onClick={button.onClick}
                            className={`w-full py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 active:scale-[0.98] ${
                                buttons.length === 3 && index === 0 ? 'col-span-2' : ''
                            } ${
                                button.variant === 'danger'
                                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50'
                                    : index === buttons.length - 1
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20'
                                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                            }`}
                        >
                            {button.text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}