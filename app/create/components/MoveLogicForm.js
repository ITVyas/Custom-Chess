import { Move } from "@/app/components/piece/piece-logic";
import { useContext, useEffect, useRef, useState } from "react";
import MoveSubform from "./MoveSubform/MoveSubform";
import ConditionalSubform from "./ConditionalSubform/ConditionalSubform";
import TriggerSubform from "./TriggerSubform/TriggerSubform";
import DefendSubform from "./DefendSubform/DefendSubform";
import { PiecesContext } from "@/app/context/PieceContext";
import { deepCopy, isSameJSON } from "@/app/utils/util";

const formNameAndDataKeyMap = {
    'move-logic' : 'move',
    'conditional-logic' : 'conditional',
    'trigger-logic' : 'trigger'
};

const mapFormNameAndValidator = {
    'move-logic' : moveFieldsValidator,
    'conditional-logic': conditionalFieldsValidator,
    'trigger-logic': triggerFieldsValidator
};

const mapFormNameAndDataConverter = {
    'move-logic': convertMoveData,
    'conditional-logic': convertConditionalData,
    'trigger-logic': convertTriggerData
};




function moveFieldsValidator(data) {
    if(data.horizontal === 0 && data.vertical === 0) {
        return {
            valid: false,
            msg: "Moving pattern can't be zero vector"
        };
    }

    if(!data.moveType.move && !data.moveType.take) {
        return {
            valid: false,
            msg: "Pick at least one move type"
        };
    }
    return {
        valid: true
    };
}

function doesBlacklistMeanNoPiece(blacklist, pieces) {
    if(blacklist.length === pieces.length + 1) return true;
    if(blacklist.length === pieces.length) return !blacklist.includes(null);
    return false;
}

function whitelistFromBlacklist(blacklist, pieces) {
    const whitelist = [];
    pieces.forEach(pieceObj => {
        if(!blacklist.includes(pieceObj.type)) whitelist.push(pieceObj.type);
    });
    return whitelist;
}

function conditionalFieldsValidator(data, pieces) {
    const configSquares = data.configSquares;

    if(data.resultType === 'position') {
        configSquares.forEach(squareCfg => {
            if(squareCfg.resultCfg.type === 'ally-piece') {
                if(!squareCfg.resultCfg.value) return {
                    valid: false,
                    msg: `Pick ally piece for placing in result position. (${squareCfg.position.column}, ${squareCfg.position.row})`
                };
            }
        });
    
        const areAllSame = configSquares.reduce((acc, squareCfg) => {
            if(!acc) return false;
            if(squareCfg.position.row === 0 && squareCfg.position.column === 0) {
                return squareCfg.resultCfg.type === 'piece-here';
            }
            if(!squareCfg.resultCfg.type || squareCfg.resultCfg.type === 'same') return true;
    
            const listPresent = squareCfg.pieceCfg.whitelist || squareCfg.pieceCfg.blacklist;
            if(squareCfg.resultCfg.type === 'clear') {
                const noPieceWhitelist = squareCfg.pieceCfg.whitelist && (squareCfg.pieceCfg.whitelist.length === 0 || (squareCfg.pieceCfg.whitelist.length === 1 && squareCfg.pieceCfg.whitelist[0] === null))
                const noPieceBlacklist = squareCfg.pieceCfg.blacklist && doesBlacklistMeanNoPiece(squareCfg.pieceCfg.blacklist, pieces);
                return !listPresent || noPieceBlacklist || noPieceWhitelist;
            }
    
            // last is 'ally-piece'
            if(!listPresent) return false;
            if(squareCfg.pieceCfg.whitelist) {
                if(squareCfg.pieceCfg.whitelist.length !== 1) return false;
                return squareCfg.pieceCfg.whitelist[0] === squareCfg.resultCfg.value;
            } else {
                if(squareCfg.pieceCfg.blacklist.length !== pieces.length - 1) return false;
                return whitelistFromBlacklist(squareCfg.pieceCfg.blacklist)[0] === squareCfg.resultCfg.value;
            }
        }, true);
    
        if(areAllSame) return {
            valid: false,
            msg: 'Condition and result positions are always the same'
        };
    }
    

    return {
        valid: true
    };
}

function triggerFieldsValidator(data) {
    // Signle consequence is transformation
    if(data.consequence.value.length === 0) return {
        valid: false,
        msg: "Empty transformation whitelist"
    };
    return {
        valid: true
    };
}


function convertMoveData(data) {
    return {
        type: 'move',
        params: new Move({row: data.vertical, column: data.horizontal}, data.rotate, data.repeatPattern, data.moveType, false).exportParams()
    };
}

function convertConditionalData(data) {
    return {
        type: 'conditional',
        params: data
    };
}

function convertTriggerData(data) {
    return {
        type: 'trigger',
        params: data
    };
}

let defaultConditionalData = null;


export default function MoveLogicForm({ handleCancel, handleSave }) {
    const [warningMsg, setWarningMsg] = useState(null);
    const [confitmationMsg, setConfirmationMsg] = useState(null);
    const pieces = useContext(PiecesContext);

    const logicNameRef = useRef(null);
    const conditionalSwitchInputRef = useRef(null);
    const moveSwitchInputRef = useRef(null);
    const pickingLogicTypeRef = useRef(null);
    const forcedMarkInputRef = useRef(null);

    const collectedData = {};

    useEffect(() => {
        defaultConditionalData = deepCopy(collectedData.conditional);
    }, []);


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

    function hideWarningMessage() {
        if(warningMsg) clearTimeout(warningMsg.timeoutId);
        setWarningMsg(null);
    }

    

    const save = async (ignoreAllConfirmations=false) => {
        const checkedRadio = pickingLogicTypeRef.current.querySelector('input[type="radio"]:checked');
        const formName = checkedRadio.id;
        
        if(Object.keys(formNameAndDataKeyMap).includes(formName)) {
            const data = collectedData[formNameAndDataKeyMap[formName]];

            if(formName === 'move-logic') {
                const conditionalData = collectedData[formNameAndDataKeyMap['conditional-logic']];
                if(!ignoreAllConfirmations && conditionalData.resultType === 'move' && !isSameJSON(defaultConditionalData, conditionalData)) {
                    setConfirmationMsg({
                        msg: "You have filled Conditional form with Move result. Do you mean submitting on Conditional tab?",
                        yes: "Cancel (yes)",
                        no: "Submit Move (no)",
                        yesAction: () => {
                            setConfirmationMsg(null);
                            conditionalSwitchInputRef.current.checked = true;
                        },
                        noAction: () => {
                            setConfirmationMsg(null);
                            moveSwitchInputRef.current.checked = true;
                            save(true);
                        }
                    });
                    return;
                }
            }

            if(formName === 'conditional-logic') {
                if(data.resultType === 'move') {
                    const moveValid = moveFieldsValidator(collectedData[formNameAndDataKeyMap['move-logic']]);
                    if(!moveValid.valid) {
                        showWarningMessage(moveValid.msg);
                        return;
                    } else {
                        data.move = convertMoveData(collectedData[formNameAndDataKeyMap['move-logic']]);
                    }
                }
            }

            const validator = mapFormNameAndValidator[formName]; 
            const validResult = validator(data, pieces);

            if(!validResult.valid) {
                showWarningMessage(validResult.msg);
            } else {
                const converter = mapFormNameAndDataConverter[formName];
                const logicData = converter(data);

                if(logicNameRef.current.value) logicData.name = logicNameRef.current.value;
                if(forcedMarkInputRef.current.checked) logicData.forced = true;
                
                handleSave(logicData);
                handleCancel();
            }
        } else {
            if(formName === 'defend-logic') {
                handleSave({type: 'defend'});
                handleCancel();
            }
        }
        
    }

    const cancel = () => {
        handleCancel();
    };

    return (
        <div className={"add-logic-form-container"}>
            <div className="add-logic-form">
                <div className="setting-fields">
                    <MoveSubform collectObject={collectedData}/>
                    <ConditionalSubform collectObject={collectedData}/>
                    <TriggerSubform collectObject={collectedData}/>
                    <DefendSubform collectObject={collectedData}/>
                    <div className="buttons-bottom">
                        {Boolean(warningMsg) && <div onClick={hideWarningMessage} className="form-warning-msg">{warningMsg.text}</div>}
                        {Boolean(confitmationMsg) && (
                            <div className="form-confirmation-modal">
                                <div className="confirmation-msg">
                                    {confitmationMsg.msg}
                                </div>
                                <div className="confirmation-buttons">
                                    <button onClick={confitmationMsg.yesAction} className="btn confirmation-yes">{confitmationMsg.yes}</button>
                                    <button onClick={confitmationMsg.noAction} className="btn confirmation-no">{confitmationMsg.no}</button>
                                </div>
                            </div>
                        )}
                        <button onClick={cancel} className="btn">Cancel</button>
                        <button onClick={() => save()} className="btn" disabled={Boolean(confitmationMsg)}>Save</button>
                    </div>
                </div>
                <div ref={pickingLogicTypeRef} className="picking-logic-type">
                    <label className="logic-type move" htmlFor="move-logic">
                        Move
                        <input ref={moveSwitchInputRef} id="move-logic" name="logic-type" type="radio" value={'move'} defaultChecked/>
                    </label>
                    <label className="logic-type conditional" htmlFor="conditional-logic">
                        Conditional Move
                        <input ref={conditionalSwitchInputRef} id="conditional-logic" name="logic-type" type="radio" value={'conditional'}/>
                    </label>
                    <label className="logic-type trigger" htmlFor="trigger-logic">
                        Trigger
                        <input id="trigger-logic" name="logic-type" type="radio" value={'trigger'}/>
                    </label>
                    <label className="logic-type defend" htmlFor="defend-logic">
                        <span className="crown"></span>Defend
                        <input id="defend-logic" name="logic-type" type="radio" value={'defend'}/>
                    </label>
                    <label className="logic-type important" htmlFor="important-logic">
                        <span className="info">
                            <div>
                            If there are multiple Forced moves available in a turn, you must choose one of them. 
                            </div>
                        </span>
                        Forced Mark
                        <input ref={forcedMarkInputRef} id="important-logic" name="important-mark" type="checkbox" value={'important'}/>
                    </label>

                    <input ref={logicNameRef} className="logic-name-input" name="logic-name" type="text" placeholder="Enter name for this logic..." />
                </div>
            </div>
        </div>
    );
}