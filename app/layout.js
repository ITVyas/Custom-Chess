'use client'

import { AuthProvider } from "@/app/AuthProvider";
import './global.css';
import Nav from "@/app/components/nav/Nav";
import AuthProtected from "@/app/AuthProtected";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Custom Chess</title>
        <link rel="icon" type="image/x-icon" href="/favicon.png" />
      </head>
      <body>
        <AuthProvider>
          <AuthProtected>
            <Nav></Nav>
          </AuthProtected>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
