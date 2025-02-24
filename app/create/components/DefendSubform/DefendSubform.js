import Note from "@/app/components/note/Note";
import './defend.css';

export default function DefendSubform() {
    return (
        <form className="defend-fields">
            <div style={{textIndent: '10px'}}><b>Defend</b> – a logic originally designed for the King in standard chess. A Defend piece has the following properties</div>
            <ul>
                <li>cannot be captured;</li>
                <li>must not be given away;</li>
                <li>any position where an opponent can legally capture it is <b>illegal</b></li>
            </ul>
            <p>
            This logic allows you to create chess variants where the "King" can be a different piece, multiple pieces, or even none.
            </p>
            <Note>
                If you have more than one Defend piece, the checkmate of any will result in a win <b>(by default)</b>.
            </Note>

            <Note>
            If your chess variant has no Defend pieces, a player wins by capturing all opponent’s pieces. Additionally, the 50-move rule for a draw applies.
            </Note>
        </form>
    );
}