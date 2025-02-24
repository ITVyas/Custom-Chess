import SinglePieceChessBoard from '@/app/components/single-piece-chess-board/SinglePieceChessBoard';
import '../create.css';
import { useContext, useState, useRef } from "react";
import MoveLogicForm from "./MoveLogicForm";
import { PiecesContext } from '@/app/context/PieceContext';
import SavePieceForm from './SavePieceForm';
import saveUserPiece from '@/app/utils/actions/saveUserPiece';
import { getPieceKey } from './create-util';
import { deepCopy } from '@/app/utils/util';

const mapLogicTypeAndClass = {
    'move' : 'piece-logic move-logic',
    'conditional' : 'piece-logic conditional-logic',
    'trigger' : 'piece-logic trigger-logic',
    'defend' : 'piece-logic defend-logic'
};

const mapLogicTypeAndName = {
    'move' : 'Move',
    'conditional' : 'Conditional Move',
    'trigger' : 'Trigger',
    'defend' : 'Defend'
};

function getZeroPiece() {
    return { 
        name: 'zero-piece',
        logic: [],
        whiteImagePath: '/img/pieces/standard/zero-piece-white.png'
    };
}

export default function CreatePiece() {
    const pieces = useContext(PiecesContext);
    const [currentPiece, setCurrentPiece] = useState(getZeroPiece());
    const [currentPiecePosition, setCurrentPiecePosition] = useState({row: 4, column: 4});

    const [isAddLogicFormShown, setIsAddLogicFormShown] = useState(false);
    const [isSavePieceFormShown, setIsSavePieceFormShown] = useState(false);
    
    const [savePieceWarnMsg, setSavePieceWarnMsg] = useState(null);

    const pieceNameInput = useRef(null);
    const savePieceFormRef = useRef(null);

    const boardSize = {rows: 8, columns: 8};

    

    function handlePanelPieceClick(pieceKey) {
        const pieceIndex = pieces.findIndex(p => getPieceKey(p) === pieceKey);
        if(pieceIndex === -1) return;
        const piece = pieces[pieceIndex];
        const pieceCopy = deepCopy(piece);
        pieceCopy.logic.forEach(l => l.visible = true);

        setCurrentPiece(pieceCopy);
    }

    const panelPieceElements = Boolean(pieces) && [getZeroPiece(), ...pieces].map(piece => {
        let classes = "bot-panel-piece";
        const pieceKey = getPieceKey(piece);
        if(pieceKey === getPieceKey(currentPiece)) classes += " active";
        return (
            <div key={pieceKey} onClick={() => handlePanelPieceClick(pieceKey)} className={classes} style={{
                backgroundImage: `url("${piece.whiteImagePath}")`
            }}></div>
        );
    });

    const pieceLogics = currentPiece.logic.map((logic, i, logicArr) => {
        let classes = mapLogicTypeAndClass[logic.type];
        if(!logic.visible) classes += ' logic-hidden';

        let name = mapLogicTypeAndName[logic.type];
        if(logic.name) name = logic.name;

        const removeLogic = () => {
            const newLogic = [...logicArr];
            newLogic.splice(i, 1);
            setCurrentPiece({...currentPiece, logic: newLogic});
        };

        const switchMoveVision = (event) => {
            if(event.target !== event.currentTarget) return true;
            const newLogic = [...logicArr];
            newLogic[i].visible = !newLogic[i].visible;
            setCurrentPiece({...currentPiece, logic: newLogic});
        };

        return (
            <div key={JSON.stringify(logic)} onClick={switchMoveVision} className={classes}>
                {name}
                <span onClick={removeLogic} className='remove-logic-btn'>✖</span>
            </div>
        );
    });

    function handleAddLogicClick(e) {
        setIsAddLogicFormShown(true);
    }

    function handleAddLogicFormCancel() {
        setIsAddLogicFormShown(false);
    }

    function handleAddLogicsToList(newLogicObject) {
        newLogicObject.visible = true;
        const newPieceLogics = [...currentPiece.logic];
        newPieceLogics.push(newLogicObject);
        setCurrentPiece({...currentPiece, logic: newPieceLogics});
    }

    function handleSaveLogic() {
        const pieceName = pieceNameInput.current.value;
        if(!pieceName) {
            showSaveWarningMessage('Enter piece name');
            return;
        }   

        setIsSavePieceFormShown(true);
    }

    async function handleSavePieceAction(saveFormData) {
        await saveUserPiece({
            pieceLogic: currentPiece.logic,
            pieceName: pieceNameInput.current.value,
            whitePieceImg: saveFormData.whiteImageFile,
            blackPieceImg: saveFormData.blackImageFile
        });
        console.log('Done!');
    };

    


    function showSaveWarningMessage(msg) {
        if(savePieceWarnMsg) clearTimeout(savePieceWarnMsg.timeoutId);

        const timeoutId = setTimeout(() => {
            setSavePieceWarnMsg(null);
        }, 2500);

        setSavePieceWarnMsg({
            text: msg,
            timeoutId: timeoutId
        });
    }

    function hideSaveWarningMessage() {
        if(savePieceWarnMsg) clearTimeout(savePieceWarnMsg.timeoutId);
        setSavePieceWarnMsg(null);
    }

    return (
        <>
            {isAddLogicFormShown && <MoveLogicForm handleCancel={handleAddLogicFormCancel} handleSave={handleAddLogicsToList} />}
            {isSavePieceFormShown && <SavePieceForm pieceName={pieceNameInput.current.value} ref={savePieceFormRef} submitAction={handleSavePieceAction} onClose={() => setSavePieceForm(false)} />}
            <div className="create-top-container">
                <div className="board-container">
                    <SinglePieceChessBoard boardSize={boardSize} piece={currentPiece} position={currentPiecePosition}/>
                </div>

                <div className="right-panel">
                    <input ref={pieceNameInput} className="piece-name-input" name="piece-name" placeholder="Enter piece name" />
                    <div className="piece-logic-container">
                        {pieceLogics}
                    </div>
                    <div className="right-panel-bottom">
                        {Boolean(savePieceWarnMsg) && (
                            <div onClick={hideSaveWarningMessage} className='save-piece-warning'>{savePieceWarnMsg.text}</div>
                        )}
                        <button onClick={handleAddLogicClick} className="btn add-logic-btn">Add Logic</button>
                        <button onClick={handleSaveLogic} className="btn save-logic-btn">Save</button>
                    </div>
                </div>
            </div>
            <div className="pieces-bottom-panel">
                {panelPieceElements}
            </div>
        </>
    );
}