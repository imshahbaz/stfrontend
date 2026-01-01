import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        const scrollToTop = () => {
            const scrollOptions = { top: 0, left: 0, behavior: 'instant' };
            window.scrollTo(scrollOptions);
            if (document.documentElement) document.documentElement.scrollTo(scrollOptions);
            if (document.body) document.body.scrollTo(scrollOptions);
        };

        // Attempt multiple times to catch the render cycle
        scrollToTop();
        requestAnimationFrame(scrollToTop);
        const timeout = setTimeout(scrollToTop, 100);

        return () => clearTimeout(timeout);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
