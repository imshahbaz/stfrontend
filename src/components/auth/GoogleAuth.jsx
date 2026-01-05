import { GoogleLogin } from "@react-oauth/google";
import { googleAPI } from "../../api/axios";
import { useNavigate } from "react-router-dom";

export function GoogleButton() {
    const navigate = useNavigate()

    const onSuccess = async (cred) => {
        if (!cred?.credential) {
            console.error("Missing Google credential");
            return;
        }
        try {
            const res = await googleAPI.googleTokenValidation(cred.credential)
            navigate("/google/callback?code=" + res.data.data + "&state=standard")
        }
        catch {
            console.log("Error")
        }
    }

    return (
        <>
            <GoogleLogin
                onSuccess={onSuccess}
                onError={() => console.log("Login failed")}
            />
        </>
    )
}