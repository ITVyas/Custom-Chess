"use client";

import './signup.css';
import { signup } from '../actions/signup';

export default function Signup() {
    return (
        <>
            <h1 className="text-center">Custom Chess</h1>
            <form className="login-form" action={signup} >
                <label htmlFor="login">Login</label>
                <input id="login" type="text" name="login" />

                <label htmlFor="password">Password</label>
                <input id="password" type="password" name="password" />

                <button className="btn center" type="submit">Log in</button>
            </form>
        </>
    );
}