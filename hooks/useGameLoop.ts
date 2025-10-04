import { useEffect, useRef } from 'react';

export const useGameLoop = (callback: () => void) => {
    // FIX: The error "Expected 1 arguments, but got 0" on line 5 is likely a misreport
    // for the useRef call on this line, which had no initial value. Initializing with null.
    const requestRef = useRef<number | null>(null);
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const animate = () => {
            callbackRef.current();
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current !== null) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);
};
