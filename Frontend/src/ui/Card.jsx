import { Button } from './button';


 // A reusable card component for displaying content, typically for courses.

export function Card({ title, imageLink, price, buttons }) {
    return (
        <div className='m-4 pb-2 rounded-lg shadow-lg w-80 flex flex-col bg-white'>
            <img src={imageLink} alt={title} className='rounded-t-lg object-cover w-full h-48' />
            <div className="p-4 flex flex-col flex-grow">
                <h3 className='text-xl font-bold mb-2 flex-grow'>{title}</h3>
                {price !== undefined && (
                    <div className='text-lg font-semibold text-green-600 mb-2'>
                        Price: ₹{price}
                    </div>
                )}
                <div className="flex flex-col gap-2 mt-auto">
                    {buttons && buttons.map((button, index) => (
                        <Button key={index} onClick={button.onClick} variant="S-1">{button.text}</Button>
                    ))}
                </div>
            </div>
        </div>
    );
}