import { GoogleLogin } from "@react-oauth/google";
import { googleAPI } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export function GoogleButton({ setError }) {
    const navigate = useNavigate();
    const { setAuthLoading } = useAuth();
    const [isReady, setIsReady] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Check if iframe already exists (might catch it if it loads super fast)
        if (containerRef.current.querySelector('iframe')) {
            setIsReady(true);
            return;
        }

        // Specifically watch for the iframe being injected by the Google SDK
        const observer = new MutationObserver((mutations) => {
            const hasIframe = containerRef.current?.querySelector('iframe');
            if (hasIframe) {
                setIsReady(true);
                observer.disconnect();
            }
        });

        observer.observe(containerRef.current, {
            childList: true,
            subtree: true
        });

        // Backup polling just in case MutationObserver misses something in specific browsers
        const interval = setInterval(() => {
            if (containerRef.current?.querySelector('iframe')) {
                setIsReady(true);
                clearInterval(interval);
                observer.disconnect();
            }
        }, 500);

        return () => {
            observer.disconnect();
            clearInterval(interval);
        };
    }, []);

    const onSuccess = async (cred) => {
        setError('');
        setAuthLoading(true);
        if (!cred?.credential) {
            console.error("Missing Google credential");
            setError('Google Login failed. Missing credentials.');
            setAuthLoading(false);
            return;
        }
        try {
            const res = await googleAPI.googleTokenValidation(cred.credential)
            navigate("/google/callback?code=" + res.data.data + "&state=standard")
        }
        catch (err) {
            console.log("Error Login with Google", err)
            setError('Google sign-in failed. Please try again.')
            setAuthLoading(false);
        }
    }

    const onError = () => {
        console.log("Login failed")
        setError('Could not initialize Google Login. Please check your connection.')
    }

    return (
        <div className="relative w-full h-14 group">
            {/* Custom Premium Button UI */}
            <div className={cn(
                "absolute inset-0 flex items-center justify-center gap-3 bg-background border border-border rounded-2xl font-bold transition-all pointer-events-none",
                isReady ? "hover:bg-muted/50 active:scale-95" : "opacity-50 grayscale-[0.5]"
            )}>
                {!isReady ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                            fill="#EA4335"
                            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
                        />
                        <path
                            fill="#34A853"
                            d="M16.04 18.013c-1.09.582-2.35.909-3.705.909a7.078 7.078 0 0 1-6.734-4.856l-4.032 3.11C3.527 21.31 7.455 24 12 24c3.055 0 5.864-1.028 8.018-2.773l-3.978-3.214Z"
                        />
                        <path
                            fill="#4285F4"
                            d="M23.49 12.275c0-.84-.076-1.647-.22-2.427H12v4.582h6.484a5.545 5.545 0 0 1-2.407 3.623l3.977 3.214c2.33-2.145 3.436-5.304 3.436-8.992Z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.266 14.235 1.24 17.345C.447 15.732 0 13.92 0 12c0-1.92.447-3.732 1.24-5.345l4.026 3.115a7.047 7.047 0 0 0 0 4.465Z"
                        />
                    </svg>
                )}
                <span>{isReady ? 'Continue with Google' : 'Initializing...'}</span>
            </div>

            {/* Hidden REAL Google Button Overlay */}
            <div
                ref={containerRef}
                className={cn(
                    "absolute inset-0 opacity-[0.01] overflow-hidden cursor-pointer",
                    !isReady && "pointer-events-none"
                )}
            >
                <GoogleLogin
                    onSuccess={onSuccess}
                    onError={onError}
                    useOneTap={false}
                    type="standard"
                    width="400"
                />
            </div>
        </div>
    )
}
