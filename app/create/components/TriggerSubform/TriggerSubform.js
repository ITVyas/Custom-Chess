import Note from "@/app/components/note/Note";
import './trigger.css';
import NumberInput from "@/app/components/number-input/NumberInput";
import { useContext, useState } from "react";
import Checkbox from "@/app/components/checkbox/Checkbox";
import { deepCopy } from "@/app/utils/util";
import { PiecesContext } from "@/app/context/PieceContext";
import { getPieceKey } from "../create-util";

function getDefaultData() {
    return {
        condition: {
            type: 'capture'
        },

        consequence: {
            type: 'transformation',
            whitelist: []
        }
    };
}

function getDefaultSubData() {
    return {
        'row' : 1,
        'column' : 1,
        'transformation': {}
    };
}

const updatePickedData = (dataObject, setDataObject) => {
    return function updateData(propPath, value) {
        const newData = {...dataObject};
        if(!Array.isArray(propPath)) {
            newData[propPath] = value;
        } else {
            let objectToModify = newData;
            propPath.forEach((prop, i) => {
                if(i <= propPath.length - 2) {
                    if(!objectToModify[prop]) objectToModify[prop] = {};
                    objectToModify = objectToModify[prop];
                } 
                else objectToModify[prop] = value;
            });
        };
        setDataObject(newData);
    }
};

export default function TriggerSubform({collectObject}) {
    const pieces = useContext(PiecesContext);
    const [transformationShow, setTransformationShow] = useState(false);
    const [data, setData] = useState(getDefaultData());
    const [subData, setSubData] = useState(getDefaultSubData());

    const updateData = updatePickedData(data, setData);
    const updateSubData = updatePickedData(subData, setSubData);

    collectObject.trigger = (() => {
        const dataCopy = deepCopy(data);
        
        const subDataKeys = Object.keys(subData);
        if(subDataKeys.includes(dataCopy.condition.type))
            dataCopy.condition.value = subData[dataCopy.condition.type];
        if(subDataKeys.includes(dataCopy.consequence.type))
            dataCopy.consequence.value = subData[dataCopy.consequence.type];

        if(dataCopy.consequence.type === 'transformation') {
            dataCopy.consequence.whitelist = undefined;
            const whitelist = [];
            Object.entries(dataCopy.consequence.value).forEach(([key, value]) => {
                if(value) whitelist.push(key);
            });
            dataCopy.consequence.value = whitelist;
        }

        return dataCopy;
    })();

    const transformationList = Boolean(pieces) && pieces.map(pieceObj => {
        const pieceKey = getPieceKey(pieceObj);
        const key = 'transformation'+pieceKey;
        return <Checkbox onChange={(newValue) => updateSubData(['transformation', pieceKey], newValue)} checked={Boolean(subData.transformation[pieceKey])} key={key} name={pieceKey} id={key} labelText={pieceObj.name} />;
    });
    
    return (
        <form className="trigger-fields">
            <p style={{textIndent : '10px'}}>Trigger - an action that occurs after each move of <b>this piece</b> if the condition is met.</p>
            
            <Note>
                The perspective of the piece is the perspective of the player who owns that piece.
            </Note>
            
            <div className="trigger-condition-pick">
                <div>Condition:</div>
                <label htmlFor="condition-capture">
                    <span>Сapture</span>
                    <input onChange={() => updateData(['condition', 'type'], 'capture')} checked={data.condition.type === 'capture'} type="radio" id="condition-capture" name="condition"/>
                </label>
                <label htmlFor="condition-row">
                    <span>
                        Reach at least
                            <NumberInput min={1} onInput={(newValue) => updateSubData('row', newValue)} defaultValue={1} value={subData.row} max={99} />
                        row
                    </span>
                    <input onChange={() => updateData(['condition', 'type'], 'row')} checked={data.condition.type === 'row'} type="radio" id="condition-row" name="condition" />
                </label>
                <label htmlFor="condition-column">
                    <span>
                        Reach at least 
                        <NumberInput onInput={(newValue) => updateSubData('column', newValue)} defaultValue={1} value={subData.column} min={1} max={99} />
                        column
                    </span>
                    <input onChange={() => updateData(['condition', 'type'], 'column')} checked={data.condition.type === 'column'} type="radio" id="condition-column" name="condition"/>
                </label>
            </div>
            <div className="trigger-consequence-pick">
                <div>Consequence: </div>
                <label className="consequence-transformation-option" htmlFor="consequence-transformation">
                    <span>
                        Piece transformation into 
                        <label htmlFor="list-transform-input" className="trigger-list-transform">
                            <span>Whitelist</span>
                            <input onChange={() => setTransformationShow(!transformationShow)} checked={transformationShow} id="list-transform-input" type="checkbox" style={{display: "none"}} />
                        </label>
                        <div className="transform-list">
                            <div className="transform-options">
                                {transformationList}
                            </div>
                        </div>
                    </span>
                    <input onChange={() => updateData(['consequence', 'type'], 'transformation')} checked={data.consequence.type === 'transformation'} type="radio" id="consequence-transformation" name="consequence" />
                </label>
            </div>
        </form>
    );
}