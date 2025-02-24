'use client'

import './global.css';
import Nav from "@/app/components/nav/Nav";
import PathFilter from "./PathFilter";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Custom Chess</title>
        <link rel="icon" type="image/x-icon" href="/favicon.png" />
      </head>
      <body>
          <PathFilter blacklist={["/signin"]}>
            <Nav></Nav>
          </PathFilter>
          {children}
      </body>
    </html>
  );
}
