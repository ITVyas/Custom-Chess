import "./nav.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

const optionsAndPathes = {
    left: [
        { option: 'Home', path: '/'},
        { option: 'Play', path: '/play'},
        { option: 'Create', suboptions: [
            { name: 'Position', path: '/create/position' },
            { name: 'Piece', path: '/create/piece'}
        ]},
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

            const suboptions = obj.suboptions ? obj.suboptions.map(suboption => {
                let liClassName = "";
                if(suboption.path === pathname) {
                    liClassName += "active";
                    return (<li key={obj.option + '.' + suboption.name} className={liClassName}>{suboption.name}</li>);
                }
                return (<Link key={obj.option + '.' + suboption.name} href={suboption.path}><li className={liClassName}>{suboption.name}</li></Link>);
            }) : null;

            const ul = suboptions ? (
                <ul>{suboptions}</ul>
            ) : null;

            if(pathname === obj.path || (ul && obj.suboptions.findIndex(x => x.path === pathname) !== -1)) {
                classes += " active"
            }

            if(obj.path)
                return (
                    <Link href={obj.path} key={obj.option}>
                        <div className={classes}>{obj.option}{ul}</div>
                    </Link>
                );
            else 
                return (
                    <div key={obj.option} className={classes}>{obj.option}{ul}</div>
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