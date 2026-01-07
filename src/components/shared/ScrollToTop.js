import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        const isReturning = sessionStorage.getItem('returning_from_chart') === 'true';
        if (pathname === '/strategies' && isReturning) return;

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: window.matchMedia('(pointer: fine)').matches
                ? 'smooth'
                : 'auto'
        });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
