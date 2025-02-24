import './note.css';

export default function Note({children}) {
    return (
        <div className="note-block">
            <div className="note-top-header"><span className='note-info-icon'>🛈</span> Note</div>
            <div className="note-content">{children}</div>
        </div>
    );
}