import "./nav.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

const optionsAndPathes = {
    left: [
        { option: 'Home', path: '/'},
        { option: 'Play', path: '/play'},
        { option: 'Create', path: '/create'},
        { option: 'About', path: '/about'},
    ],
    right: [
        { option: 'Profile', path: '/profile'}
    ]
};

export default function Nav() {
    const pathname = usePathname();

    const navLinks = Object.keys(optionsAndPathes).map(key => {
        return optionsAndPathes[key].map(obj => {
            let classes = "nav-link";
            classes += key === 'left' ? " left" : " right";

            if(pathname === obj.path) {
                classes += " active"
                return (
                    <div key={obj.option} className={classes}>{obj.option}</div>
                );
            } 
            return (
                <Link href={obj.path} key={obj.option}>
                    <div className={classes}>{obj.option}</div>
                </Link>
            );
        });
    }).flat();

    return (
        <nav className="top-nav">
            <label htmlFor="nav-open">
                ☰
                <input id="nav-open" type="checkbox"/>
            </label>
            
            {navLinks}
        </nav>
    );
}