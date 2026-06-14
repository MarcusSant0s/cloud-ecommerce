import { useAuth } from "@/contexts/AuthContext";


export default function useIsAdmin(){
    const { user } = useAuth();
    
    return user?.role === "ADMIN";
}