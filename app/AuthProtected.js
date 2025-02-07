'use client'

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { redirect } from "next/navigation";

export default function AuthProtected({children}) {
    const { accessToken, logout } = useAuth();
    const [ load, setLoad ] = useState(accessToken !== undefined);;

    useEffect(() => {
        if(accessToken === null) {
            redirect('/signin');
        }
        if(accessToken !== undefined && !load) setLoad(true);
    }, [accessToken]);

    if(load) {
        if(accessToken) {
            return (
                <> {children} </>
            ); 
        } else {
            return (<>Access Denied!</>);
        }
    } else {
        return null;
    }
}