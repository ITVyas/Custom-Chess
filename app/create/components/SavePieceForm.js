import FileDrop from "@/app/components/file-drop/FileDrop";
import { useRef, useState } from "react";
import Note from "@/app/components/note/Note";

async function validatePieceImageFile(file) {
    if(!file || file.type !== 'image/png') return {valid: false};
    const minWidth = 64, minHeight = 64;
    const maxWidth = 150, maxHeight = 150;
    return new Promise((resolve, _) => {
        const img = new Image();
        const objectURL = URL.createObjectURL(file);

        img.onload = function () {
            URL.revokeObjectURL(objectURL);
            if (img.width >= minWidth && img.width <= maxWidth && img.height >= minHeight && img.height <= maxHeight) {
                resolve({valid: true});
            } else {
                resolve({valid: false});
            }
        };

        img.onerror = function () {
            resolve({valid: false});
        };

        img.src = objectURL;
    });
}

export default function SavePieceForm({ref, submitAction, pieceName, onClose}) {

    const whiteFileReport = useRef(null);
    const blackFileReport = useRef(null);
    const [warningMsg, setWarningMsg] = useState(null);

    function showWarningMessage(msg) {
        if(warningMsg) clearTimeout(warningMsg.timeoutId);

        const timeoutId = setTimeout(() => {
            setWarningMsg(null);
        }, 2500);

        setWarningMsg({
            text: msg,
            timeoutId: timeoutId
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if(whiteFileReport.current.file && whiteFileReport.current.status === 'correct' &&
            blackFileReport.current.file && blackFileReport.current.status === 'correct'
        ) {
            submitAction({
                whiteImageFile: whiteFileReport.current.file,
                blackImageFile: blackFileReport.current.file
            });
            ref.current.reset();
            onClose();
        } else {
            showWarningMessage('Choose valid images for piece');
        }
        
        return false;
    };

    return (
        <div className="save-piece-form-container">
            <form ref={ref} className="save-piece-form">
                <span onClick={() => {
                    ref.current.reset();
                    onClose();
                }} className="save-piece-close">✖</span>
                {Boolean(warningMsg) && (
                    <div className="save-form-warning">
                        {warningMsg.text}
                    </div>
                )}
                <input value={pieceName} id="save-form-piece-name" type="text" placeholder="Piece name..." readOnly/>
                <Note>Image has to be <b>.png</b> from 64x64 to 150x150.</Note>
                <div style={{margin: '0 0 3px'}}>White piece image:</div>
                <FileDrop fileValidationAsync={validatePieceImageFile} reportRef={whiteFileReport} accept={"image/png"}/>
                <div style={{margin: '10px 0 3px'}}>Black piece image:</div>
                <FileDrop fileValidationAsync={validatePieceImageFile} reportRef={blackFileReport} accept={"image/png"} />
                <button className="btn" type="submit" onClick={handleSubmit}>Save</button>
            </form>
        </div>
    );
}