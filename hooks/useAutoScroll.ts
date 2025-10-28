// This hook automatically scrolls a container to the bottom when its content changes.
import { useRef, useEffect } from 'react';

export const useAutoScroll = (dependencies: any[] = []) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [dependencies]);

    return scrollRef;
};