import { usePathname } from "next/navigation";

export default function PathFilter({children, blacklist}) {
    const pathname = usePathname();

    if(blacklist.includes(pathname)) {
        return null;
    }
    return <>{children}</>;
} 