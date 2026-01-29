'use client'

import { useContext, useEffect, createContext, useState} from "react";
import api from "@/services/api"; 

const authContext = createContext(null);



export function AuthProvider({ children }) {
const [user, setUser] = useState(null);
const [token, setToken] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(()=>{
    const storedToken = localStorage.getItem("token");

    if(storedToken){
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
        fetchMe();
    } else {
        setLoading(false)
    }
}, [])

    async function fetchMe(){
        try{
            const res = await api.get('/users/me')
            setUser(res.data)
        } catch{
            logout()
        } finally{
            setLoading(false)
        }
    }

    async function login(email, password){
        const res = await api.post("auth/login", {email, password})
    
        const jwt = res.data.jwt;

        localStorage.setItem('token', jwt)
        api.defaults.headers.common['Authorization']=`Bearer ${jwt}`;
        setToken(jwt);

        await fetchMe();
    }

    function logout(){

        localStorage.removeItem(token);
        delete api.defaults.headers.common['Authorization'];
        setToken(null)
        setUser(null);

    }

return(
    <authContext.Provider
    value ={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
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
