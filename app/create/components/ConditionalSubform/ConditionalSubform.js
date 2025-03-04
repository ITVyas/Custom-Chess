import { useState } from "react";
import './conditional.css';
import { createRange, exists } from "@/app/utils/util";
import SquareConfiguration from "./SquareConfiguration";
import Note from "@/app/components/note/Note";
import SquareResultConfiguration from "./SquareResultConfiguration";
import { deepCopy } from "@/app/utils/util";
import Checkbox from "@/app/components/checkbox/Checkbox";

const SQUARE_L = 35;
const BUTTON_L = 20;

function boardColsTemplate(condPos) {
    return createRange(1 + condPos.boardExtended.right + condPos.boardExtended.left).map(() => `${SQUARE_L}px`).reduce((acc, val) => {
        return acc + ' ' + val;
    }, '');
}

function boardRowsTemplate(condPos) {
    return createRange(1 + condPos.boardExtended.up + condPos.boardExtended.bottom).map(() => `${SQUARE_L}px`).reduce((acc, val) => {
        return acc + ' ' + val;
    }, '');
}



function getAllSquares(condPos, setConditionPosition, setCurUserSqCfgIndex) {
    const cols = condPos.boardExtended.left + condPos.boardExtended.right + 1;
    const rows = condPos.boardExtended.up + condPos.boardExtended.bottom + 1;
    const pieceCol = condPos.boardExtended.left + 1,
        pieceRow = condPos.boardExtended.up + 1;
    const pieceCfg = condPos.configSquares[condPos.configSquares.findIndex(cfg => cfg.position.row === 0 && cfg.position.column === 0)];

    return createRange(cols*rows).map(i => {
        const row = Math.floor(i / cols) + 1;
        const column = i % cols + 1;

        
        const X = pieceCfg && pieceCfg.squareCfg.color !== 'black' ? (pieceCol % 2)^(pieceRow % 2) : ((pieceCol % 2)^(pieceRow % 2) + 1) % 2;
        let piece = null, nonActive = null;

        let cfgSquareHandler = (event) => { 
            if(event.target !== event.currentTarget) return false;
            const index = condPos.configSquares.findIndex(cfg => cfg.position.row === pieceRow - row && cfg.position.column === column - pieceCol);
            setCurUserSqCfgIndex(index);
        };

        if(row === pieceRow && column === pieceCol) {
            piece = (
                <span className="piece-symbol">⬤</span>
            );
        } else if(condPos.configSquares.findIndex(cfg => cfg.position.row === pieceRow - row && cfg.position.column === column - pieceCol) === -1) {
            nonActive = (
                <div className="non-active" onClick={() => {
                    const newConsPos = {...condPos};
                    newConsPos.configSquares.push({
                        position: {row: pieceRow - row, column: column - pieceCol},
                        pieceCfg: { whitelist: [null] },
                        squareCfg: {},
                        resultCfg: {}
                    });
                    setConditionPosition(newConsPos);
                }}></div>
            );
        }
            
        return (
            <div key={'square'+row+'-'+column} onClick={cfgSquareHandler} style={{
                gridRow: `${1 + row}`,
                gridColumn: `${1 + column}`
            }} className={(row % 2)^(column % 2) === X ? "white-square" : "black-square"}>
                {piece}
                {nonActive}
            </div>
        );
    })
}

function zeroSquareConfig() {
    return {
        position: {row: 0, column: 0},
        pieceCfg: {},
        squareCfg: {},
        resultCfg: { 
            type: "piece-here"
        }
    };
}


function getMaxAndMinRowCol(condPos) {
    let minRow = 0, maxRow = 0, minCol = 0, maxCol = 0;
    condPos.configSquares.forEach(cfg => {
        maxRow = Math.max(cfg.position.row, maxRow);
        maxCol = Math.max(cfg.position.column, maxCol);
        minRow = Math.min(cfg.position.row, minRow);
        minCol = Math.min(cfg.position.column, minCol);
    });
    return {minRow, maxRow, minCol, maxCol};
}

function getResultSquares(condPos, curUserResultSqCfg, setCurUserResultSqCfgIndex) {
    const {maxCol: maxRelCol, minCol: minRelCol, maxRow: maxRelRow , minRow: minRelRow } = getMaxAndMinRowCol(condPos);
    const cols = Math.abs(minRelCol) + maxRelCol + 1;
    const rows = Math.abs(minRelRow) + maxRelRow + 1;

    const pieceSqaureCfg = condPos.configSquares[condPos.configSquares.findIndex(cfg => cfg.resultCfg.type==='piece-here')];

    const centerCol = Math.abs(minRelCol) + 1;
    const centerRow = maxRelRow + 1;

    const pieceCol = pieceSqaureCfg ? centerCol + pieceSqaureCfg.position.column : null;
    const pieceRow = pieceSqaureCfg ? centerRow - pieceSqaureCfg.position.row : null;

    return createRange(cols*rows).map(i => {
        const row = Math.floor(i / cols) + 1;
        const column = i % cols + 1;

        const X = (pieceSqaureCfg && pieceSqaureCfg.squareCfg.color !== 'black') ? (centerCol % 2)^(centerRow % 2) : ((centerCol % 2)^(centerRow % 2) + 1) % 2;

        let piece = null;
        if(row === pieceRow && column === pieceCol) {
            piece = (
                <span className="piece-symbol">⬤</span>
            );
        }

        const currentSquareResultCfg = condPos.configSquares[condPos.configSquares.findIndex(cfg => cfg.position.row===centerRow - row && cfg.position.column == column - centerCol)];
        if(currentSquareResultCfg && currentSquareResultCfg.resultCfg) {
            if(currentSquareResultCfg.resultCfg.type === 'clear') {
                piece = (
                    <span className="piece-symbol">C</span>
                );
            } else if(!currentSquareResultCfg.resultCfg.type || currentSquareResultCfg.resultCfg.type === 'same') {
                piece = (
                    <span className="piece-symbol">S</span>
                );
            } else if(currentSquareResultCfg.resultCfg.type === 'ally-piece') {
                piece = (
                    <span className="piece-symbol">P</span>
                );
            }
        }

        let noAccess = null;
        if(condPos.configSquares.findIndex(cfg => cfg.position.row === centerRow - row && cfg.position.column == column - centerCol) === -1) {
            noAccess = (
                <div className="no-access"></div>
            );
        }

        let cfgSquareHandler = (event) => { 
            if(event.target !== event.currentTarget) return false;
            if(curUserResultSqCfg && 
                curUserResultSqCfg.position.row === centerRow - row && 
                curUserResultSqCfg.position.column === column - centerCol)
                setCurUserResultSqCfgIndex(null);
            else {
                const index = condPos.configSquares.findIndex(cfg => cfg.position.row === centerRow - row && cfg.position.column === column - centerCol);
                setCurUserResultSqCfgIndex(index);
            }
        };


        return (
            <div key={'result-square'+row+'-'+column} onClick={cfgSquareHandler} style={{
                gridRow: `${row}`,
                gridColumn: `${column}`
            }} className={(row % 2)^(column % 2) === X ? "white-square" : "black-square"}>
                {piece}
                {noAccess}
            </div>
        );
    });
}

function getDefaultState() {
    return {
        boardExtended: {
            right: 0,
            left: 0,
            up: 0,
            bottom: 0
        },
        configSquares: [
            zeroSquareConfig()
        ]
    };
}



export default function ConditionalSubform({collectObject}) {
    const [conditionPosition, setConditionPosition] = useState(getDefaultState());
    const [currentSquareConfigIndex, setCurrentSquareConfigIndex] = useState(null);
    const [conditionalPositionShow, setConditionPositionShow] = useState(false);
    const [resultPositionShow, setResultPositionShow] = useState(false);
    const [resultPositionPick, setResultPositionPick] = useState('move');
    const [flip, setFlip] = useState({ horizontal: false, vertical: false });

    collectObject.conditional = (() => {
        const conditionPositionCopy = deepCopy(conditionPosition);
        delete conditionPositionCopy.boardExtended;
            
        
        conditionPositionCopy.resultType = resultPositionPick;
        if(resultPositionPick !== 'position') {
            conditionPositionCopy.resultCfg = undefined;
        }

        conditionPositionCopy.flip = deepCopy(flip);
        return conditionPositionCopy;
    })();

    function updateCurrentSqaureCfg(newCfg) {
        const newConditionPosition = {...conditionPosition};
        newConditionPosition.configSquares.splice(currentSquareConfigIndex, 1, newCfg);
        setConditionPosition(newConditionPosition);
    }
    
    function updateCurrentResultCfg(newCfg) {
        const newConditionPosition = deepCopy(conditionPosition);
        if(newCfg.resultCfg.type === 'piece-here') {
            const index = newConditionPosition.configSquares.findIndex(x => (x.position.row !== newCfg.position.row || x.position.column !== newCfg.position.column) && x.resultCfg.type === 'piece-here');
            if(index !== -1) {
                newConditionPosition.configSquares[index].resultCfg.type = 'clear';
            }
        }
        newConditionPosition.configSquares.splice(currentSquareConfigIndex, 1, newCfg);
        setConditionPosition(newConditionPosition);
    }

    const squares = getAllSquares(conditionPosition, setConditionPosition, setCurrentSquareConfigIndex);
    const configuration = exists(currentSquareConfigIndex) ? (<SquareConfiguration onClose={() => setCurrentSquareConfigIndex(null)} startSquareCfg={conditionPosition.configSquares[currentSquareConfigIndex]} onCfgChange={updateCurrentSqaureCfg} />) : null;
    
    const resultSquares = getResultSquares(conditionPosition, conditionPosition[currentSquareConfigIndex], setCurrentSquareConfigIndex);
    const resultConfiguration = exists(currentSquareConfigIndex) ? <SquareResultConfiguration onClose={() => setCurrentSquareConfigIndex(null)} startSquareCfg={conditionPosition.configSquares[currentSquareConfigIndex]} onCfgChange={updateCurrentResultCfg} /> : null;

    function addColumn(side) {
        const newConditionPosition = {...conditionPosition};
        if(side === 'right') newConditionPosition.boardExtended.right += 1;
        else newConditionPosition.boardExtended.left += 1;
        setConditionPosition(newConditionPosition);
    }

    function addRow(side) {
        const newConditionPosition = {...conditionPosition};
        if(side === 'up') newConditionPosition.boardExtended.up += 1;
        else newConditionPosition.boardExtended.bottom += 1;
        setConditionPosition(newConditionPosition);
    }

    return (
        <form className="conditional-fields">
            <p style={{textIndent: '10px'}}>
                Condition position - relative position setup around the piece. Match = move possibility.
            </p>
            <Note>
                The perspective of the piece is the perspective of the player who owns that piece.
            </Note>
            <label className="condition-position-btn">
                <span>Set condition position</span>
                <input onChange={() => setConditionPositionShow(!conditionalPositionShow)} checked={conditionalPositionShow} type="checkbox" style={{display: 'none'}}/>
            </label>
            <p style={{textIndent: '10px'}}>
                Setup move result position or set 'Move'
            </p>
            <div className="condition-result-picks">
                <label htmlFor="reuslt-pick-name" className="move-result">
                    <span>Use move from <span className="move-tab-style">Move</span> tab</span>
                    <input id="reuslt-pick-name" name="condition-result-pick" type="radio" value={'move'} checked={resultPositionPick === 'move'} onChange={(e) => setResultPositionPick(e.currentTarget.value)}/>
                </label>

                <label htmlFor="reuslt-pick-position" className="condition-result-position">
                    <span>Setup 
                        <label className="move-result-position-style">
                            <span>result position</span>    
                            <input onChange={() => setResultPositionShow(!resultPositionShow)} checked={resultPositionShow} id="result-position-checkbox" type="checkbox" style={{display: 'none'}} />
                        </label>
                    </span>
                    <input id="reuslt-pick-position" name="condition-result-pick" type="radio" value={'position'} checked={resultPositionPick === 'position'} onChange={(e) => setResultPositionPick(e.currentTarget.value)}/>
                </label>
            </div>
            
            <div className="conditional-board-modal">
                {configuration}
                <span className="close-board" onClick={() => {
                    setConditionPositionShow(false);
                }}>✖</span>
                <div className="conditional-board-container">
                    <div className="board-scrolling-help-inner">
                        <div style={{
                                gridTemplateColumns: `${BUTTON_L}px ${boardColsTemplate(conditionPosition)} ${BUTTON_L}px`,
                                gridTemplateRows: `${BUTTON_L}px ${boardRowsTemplate(conditionPosition)} ${BUTTON_L}px`
                            }} className="conditional-board">
                                <button onClick={() => addRow('up')} type="button" style={{ gridRow: `1`, gridColumn: `2 / span ${conditionPosition.boardExtended.right + conditionPosition.boardExtended.left + 1}`}} className="add-board-part top">+</button>
                                <button onClick={() => addColumn('left')} type="button" style={{ gridRow: `2 / span ${conditionPosition.boardExtended.bottom+conditionPosition.boardExtended.up + 1}`, gridColumn: '1'}} className="add-board-part left">+</button>
                                <button onClick={() => addRow('bottom')} type="button" style={{ gridRow: `${conditionPosition.boardExtended.bottom+conditionPosition.boardExtended.up + 3}`, gridColumn: `2 / span ${conditionPosition.boardExtended.right + conditionPosition.boardExtended.left + 1}`}} className="add-board-part bot">+</button>
                                <button onClick={() => addColumn('right')} type="button" style={{ gridRow: `2 / span ${1+conditionPosition.boardExtended.bottom+conditionPosition.boardExtended.up}`, gridColumn: `${3+conditionPosition.boardExtended.left+conditionPosition.boardExtended.right}`}} className="add-board-part right">+</button>
                                {squares}
                        </div>
                    </div>
                </div>
            </div>
            
            
            <div className="result-board-modal">
                {resultConfiguration}
                <span className="close-board" onClick={() => {
                    setResultPositionShow(false);
                }}>✖</span>
                <div className="conditional-board-container">
                    <div className="board-scrolling-help-inner">
                        <div style={{
                                gridTemplateColumns: `${boardColsTemplate(conditionPosition)}`,
                                gridTemplateRows: `${boardRowsTemplate(conditionPosition)}`
                            }} className="result-board">
                                {resultSquares}
                        </div>
                    </div>
                </div>
            </div>   

            <Checkbox className={'flip-checkbox'} id={"flip-condition-vertically"} labelText={"Add vertically inverted move"} checked={flip.vertical} onChange={(newVal) => setFlip({...flip, vertical: newVal}) }/>
            <Checkbox className={'flip-checkbox'} id={"flip-condition-horizontally"} labelText={"Add horizontally inverted move"} checked={flip.horizontal} onChange={(newVal) => setFlip({...flip, horizontal: newVal}) }/>
            
        </form>
    );
}
