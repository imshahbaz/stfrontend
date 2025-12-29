import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const AdsterraBanner = ({ isMobile }) => {
    const bannerRef = useRef(null);

    useEffect(() => {
        if (bannerRef.current && !bannerRef.current.firstChild) {
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
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            mt: 2,
            mb: 1
        }}>

            {/* This is the inner Box that holds the Adsterra script */}
            <Box
                ref={bannerRef}
                sx={{
                    minWidth: isMobile ? '320px' : '728px',
                    minHeight: isMobile ? '50px' : '90px',
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            />
        </Box>
    );
};

export default AdsterraBanner;