"use client";

import './signin.css';
import { useAuth } from '../AuthProvider';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Signin() {
    const { accessToken, login } = useAuth();
    
    useEffect(() => {
        if (accessToken) {
            redirect('/');
        }
    }, [accessToken]);

    const handleSubmit = (event) => { 
        const form = event.target.parentElement;
        if(form.checkValidity()) {
            login(new FormData(form));
            event.preventDefault();
        }
    };

    if(accessToken !== undefined) {
        return (
            <>
                <h1 className="text-center">Custom Chess</h1>
                <form className="login-form">
                    <label htmlFor="login">Login</label>
                    <input autoComplete={'username'} minLength={5} id="login" type="text" name="login" required/>
    
                    <label htmlFor="password">Password</label>
                    <input autoComplete={'current-password'} minLength={5} id="password" type="password" name="password" required/>
    
                    <button className="btn center" type="submit" onClick={handleSubmit}>Log in</button>
                </form>
            </>
        );
    } else {
        return null;
    }
}