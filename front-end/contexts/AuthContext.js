'use client'

import { useContext, useEffect, createContext, useState} from "react";
import api from "@/services/api"; 
import { useRouter } from "next/navigation";
const authContext = createContext(null);



export function AuthProvider({ children }) {
    const router = useRouter();
const [user, setUser] = useState(null);
const [token, setToken] = useState(null);
const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const loadUser = async () => {
                    const storedToken = localStorage.getItem("token");

                    if(storedToken){
                        setToken(storedToken);
                        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
                    await fetchMe(storedToken);
                    } else {
                        setLoading(false)

                    }
            }

            loadUser();
    }, [])

    async function fetchMe(tokenParam){
        try{
        const tokenToUse = tokenParam || localStorage.getItem('token');

        const res = await api.get('/users/me', {
            headers: {
                Authorization: `Bearer ${tokenToUse}`,
            },
        });

        setUser(res.data);

    } catch {
        logout();
    } finally {
        setLoading(false);
    }
    }

    async function login(email, password){
        const res = await api.post("auth/login", {email, password})
        const jwt = res.data.token; 

         localStorage.setItem('token', jwt)
        api.defaults.headers.common['Authorization']=`Bearer ${jwt}`;
      

        setToken(jwt);
 
        await fetchMe(jwt);
    }

    function isAdmin(){
        return user?.role === "ADMIN";
    }
    function logout(){
        localStorage.removeItem('token');

        delete api.defaults.headers.common['Authorization'];

        setToken(null)
        setUser(null);

        router.push('/')

    }

async function register(firstName, lastName, email, password, street, city, cep, numberAddress) {
        const res = await api.post("auth/register", {
    firstName, lastName, email, password,
    street, city, cep, numberAddress
  });

        const jwt = res.data.token;
        localStorage.setItem('token', jwt)
        api.defaults.headers.common['Authorization']=`Bearer ${jwt}`;
        setToken(jwt);

        await fetchMe(jwt);

    }

return(
    <authContext.Provider
    value ={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin,
        login,
        register,
        logout,
        loading,
        fetchMe
    }}>
        {children}
    </authContext.Provider>
)

}

export function useAuth(){
    const ctx = useContext(authContext);

    if(!ctx){
        throw new Error("User must be in a context")
    }

    return ctx;
}
