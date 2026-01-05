import { GoogleLogin } from "@react-oauth/google";
import { googleAPI } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function GoogleButton() {
    const navigate = useNavigate()
    const { setAuthLoading } = useAuth()

    const onSuccess = async (cred) => {
        if (!cred?.credential) {
            console.error("Missing Google credential");
            return;
        }
        try {
            const res = await googleAPI.googleTokenValidation(cred.credential)
            setAuthLoading(true)
            navigate("/google/callback?code=" + res.data.data + "&state=standard")
        }
        catch {
            console.log("Error Login with Google")
        }
    }

    return (
        <GoogleLogin
            onSuccess={onSuccess}
            onError={() => console.log("Login failed")}
            theme={localStorage.getItem('theme') == 'dark' ? "filled_black" : ''}
            shape="pill"
            logo_alignment="center"
        />
    )
}