'use client'

import AuthProtected from "./AuthProtected";
import Link from "next/link";

export default function Home() {
  return (
    <AuthProtected>
      <div>You are welcome!</div>
      <div>
        <Link href="/position-builder">Position Builder</Link>
      </div>
    </AuthProtected>
  );
}
