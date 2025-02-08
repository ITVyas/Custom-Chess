'use client'

import AuthProtected from "@/app/AuthProtected"
import Link from "next/link";

export default function PositionBuilderPage() {
    return (
        <AuthProtected>
            Position Builder
            <div>
                <Link href="/">Home</Link>
            </div>
        </AuthProtected>
    );
}