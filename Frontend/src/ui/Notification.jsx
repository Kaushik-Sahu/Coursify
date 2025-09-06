import React, { useEffect, useState } from 'react';

/**
 * A notification component (toast) that appears at the bottom of the screen.
 * It automatically fades out after a few seconds.
 */
export function Notification({ message, type }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
            }, 3000); // Notification stays visible for 3 seconds

            return () => clearTimeout(timer); // Cleanup the timer
        }
    }, [message, type]); // Effect triggers when message or type changes

    if (!visible) {
        return null;
    }

    const baseClasses = 'fixed inset-x-0 bottom-0 mx-auto w-fit h-auto m-3 px-6 py-2 text-white rounded-full text-center transition-opacity duration-500';
    const typeClasses = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const visibilityClass = visible ? 'opacity-100' : 'opacity-0';

    return (
        <div className={`${baseClasses} ${typeClasses} ${visibilityClass}`}>
            {message}
        </div>
    );
}
