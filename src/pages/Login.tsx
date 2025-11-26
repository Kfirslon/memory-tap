import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function Login() {
    const navigate = useNavigate();
    const { toast } = useToast();

    // If already authenticated, redirect to home
    useEffect(() => {
        const check = async () => {
            try {
                const data = await api.checkAuth();
                if (data.authenticated) {
                    navigate("/");
                }
            } catch (e) {
                // ignore, stay on login page
            }
        };
        check();
    }, []);

    const handleLogin = () => {
        // Redirect to backend OAuth endpoint
        window.location.href = "http://localhost:3000/auth/google";
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="max-w-md w-full space-y-6 rounded-lg bg-card p-8 shadow-lg">
                <h1 className="text-2xl font-bold text-center">Sign in</h1>
                <Button
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center gap-2"
                >
                    <svg
                        className="h-5 w-5"
                        viewBox="0 0 533.5 544.3"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M533.5 278.4c0-17.7-1.6-35-4.6-51.7H272v97.9h146.9c-6.4 34.5-25.6 63.8-54.5 83.4v69.2h88.1c51.5-47.4 81.1-117.4 81.1-198.8z"
                            fill="#4285F4"
                        />
                        <path
                            d="M272 544.3c73.5 0 135.2-24.4 180.3-66.2l-88.1-69.2c-24.5 16.4-55.9 26-92.2 26-70.9 0-131-47.9-152.5-112.3H30.9v70.9c45.2 89.5 138.5 150.8 241.1 150.8z"
                            fill="#34A853"
                        />
                        <path
                            d="M119.5 322.6c-10.5-31.2-10.5-64.8 0-96l-70.9-70.9c-31.5 61.4-31.5 134.4 0 195.8l70.9-28.9z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M272 107.7c39.6-.6 77.8 14.8 106.5 42.9l79.7-79.7C417.2 22.5 345.9-1.2 272 0 169.4 0 76.1 61.3 30.9 150.8l70.9 70.9C141 155.6 201.1 107.7 272 107.7z"
                            fill="#EA4335"
                        />
                    </svg>
                    Sign in with Google
                </Button>
            </div>
        </div>
    );
}
