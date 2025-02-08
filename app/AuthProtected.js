'use client'

import { useEffect, useState } from "react";
import { useAuth } from "@/app/AuthProvider";
import { redirect, usePathname } from "next/navigation";

export default function AuthProtected({children}) {
    const { accessToken, logout } = useAuth();
    const [ load, setLoad ] = useState(accessToken !== undefined);
    const pathname = usePathname();

    useEffect(() => {
        if(accessToken === null && pathname !== '/signin') {
            redirect('/signin');
        }
        if(accessToken !== undefined && !load) setLoad(true);
    }, [accessToken, pathname]);

    if(load) {
        if(accessToken) {
            return (
                <> {children} </>
            ); 
        } else {
            return null;
        }
    } else {
        return null;
    }
}