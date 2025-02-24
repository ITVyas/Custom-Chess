'use server';

import '@/app/signin/signin.css';
import { login, getSession } from '@/app/utils/actions/auth';
import { redirect } from 'next/navigation';

export default async function Signin() {

    const session = await getSession();
    if(session.sessionId) {
        redirect('/');
    }

    return (
        <>
            <h1 className="text-center">Custom Chess</h1>
            <form className="login-form" action={login}>
                <label htmlFor="login">Login</label>
                <input autoComplete={'username'} minLength={5} id="login" type="text" name="login" required/>

                <label htmlFor="password">Password</label>
                <input autoComplete={'current-password'} minLength={5} id="password" type="password" name="password" required/>

                <button className="btn center" type="submit">Log in</button>
            </form>
        </>
    );
}