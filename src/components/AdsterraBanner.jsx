import { useEffect, useRef } from 'react';

const AdsterraBanner = ({ isMobile }) => {
    const bannerRef = useRef(null);

    useEffect(() => {
        if (bannerRef.current) {
            bannerRef.current.innerHTML = '';
        }

        if (bannerRef.current) {
            const conf = document.createElement('script');
            const script = document.createElement('script');

            const adKey = isMobile ? '874e84739bdbbd55fcda9bf6c9737fea' : 'd09b1c22debc4e3a283b5024b399a444';
            const width = isMobile ? 320 : 728;
            const height = isMobile ? 50 : 90;

            conf.innerHTML = `
                atOptions = {
                    'key' : '${adKey}',
                    'format' : 'iframe',
                    'height' : ${height},
                    'width' : ${width},
                    'params' : {}
                };
            `;

            script.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;
            script.async = true;

            bannerRef.current.appendChild(conf);
            bannerRef.current.appendChild(script);
        }
    }, [isMobile]);

    return (
        <div
            ref={bannerRef}
            className="flex items-center justify-center overflow-hidden bg-muted/20 rounded-2xl border border-border/50"
            style={{
                width: isMobile ? '320px' : '728px',
                height: isMobile ? '50px' : '90px'
            }}
        />
    );
};

export default AdsterraBanner;