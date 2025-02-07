'use client'

import { createContext, useContext, useEffect, useState } from "react"
import clientAccessApi from "./client-access-api";
import { signin } from "./actions/signin";
import { refreshAccessToken } from "./server-access-api";
import { clearAllCookies } from "./server-access-api";
import { usePathname  } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({children}) {
    const [accessToken, setAccessToken] = useState(undefined);
    const pathname = usePathname();

    // clientAccessApi.onAccessTokenUpdate((accessToken) => {
    //     setAccessToken(accessToken);
    // });

    const logout = async () => {
        setAccessToken(null);
        clearAllCookies();
    };
    
    const login = async (creds) => {
        await clearAllCookies();
        const response = await signin(creds);
        console.log('login response: ', response);
        if(response.success) {
            setAccessToken(response.accessToken);
        } else {
            setAccessToken(null);
        }
    };

    useEffect(() => {
        if(accessToken === null) return;
        (async() => {
            const response = await clientAccessApi.accessByToken(accessToken);
            if(!response.hasAccess) {
                const refreshResponse = await refreshAccessToken();
                if(!refreshResponse.success) {
                   logout();
                } else {
                    setAccessToken(refreshResponse.accessToken);
                }
            } else if (response.newAccessToken) {
                setAccessToken(response.newAccessToken);
            }
        })()
    }, [pathname]);

    return (
        <AuthContext.Provider value={{ accessToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() { 
    return useContext(AuthContext);
};