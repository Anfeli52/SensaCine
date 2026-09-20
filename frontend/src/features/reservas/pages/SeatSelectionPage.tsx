import { useAuthStore } from "@/features/auth/authStore";
import { useNavigate } from "react-router-dom";

interface BookingPageProps {
    movieId: string;
}

export const BookingPage = ({ movieId } : BookingPageProps) => {
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    
    
    
    
    
    
    
    
    
    if(!isAuthenticated){
        navigate("/login");
    }
    
    return (
        <>

        </>
    )
}