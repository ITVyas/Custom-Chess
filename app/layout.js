'use client'

import Signup from "./components/Signup";
import './global.css';
import { useState } from "react";

export default function RootLayout({ children }) {
  const [auth, setAuth] = useState(false);
  let bodyContent;
  if(auth) {
    bodyContent = (
      <>
        <p>Root layout</p>
        {children}
      </>
    );
  } else {
    bodyContent = (
      <Signup />
    );
  }

  return (
    <html lang="en">
      <body>
        {bodyContent}
      </body>
    </html>
  );
}
