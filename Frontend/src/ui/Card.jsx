import { Button } from './button';


// A reusable card component for displaying content, typically for courses.

export function Card({ title, imageLink, price, buttons }) {
    return (
        <div className='group rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 w-full flex flex-col bg-white border border-slate-100 overflow-hidden'>
            <div className="relative overflow-hidden h-52">
                <img
                    src={imageLink || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"}
                    alt={title}
                    className='object-cover w-full h-full group-hover:scale-105 transition-transform duration-500'
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {price !== undefined && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-slate-800 shadow-sm border border-white/50">
                        ₹{price}
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-grow relative bg-white">
                <h3 className='text-xl font-bold mb-4 text-slate-800 line-clamp-2 leading-tight flex-grow'>{title}</h3>

                <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-slate-100">
                    {buttons && buttons.map((button, index) => (
                        <button
                            key={index}
                            onClick={button.onClick}
                            className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-300 active:scale-[0.98] ${index === buttons.length - 1
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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