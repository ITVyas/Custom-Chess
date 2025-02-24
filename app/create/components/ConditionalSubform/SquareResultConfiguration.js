import { useContext, useEffect, useState } from "react";
import Radio from "@/app/components/radio/Radio";
import { PiecesContext } from "@/app/context/PieceContext";
import { getPieceKey } from "../create-util";

export default function SquareResultConfiguration({ startSquareCfg, onCfgChange, onClose }) {
    const pieces = useContext(PiecesContext);
    const [pickedAllyPieceForPlace, setPickedAllyPieceForPlace] = useState(startSquareCfg.resultCfg.type === 'ally-piece' ? startSquareCfg.resultCfg.value : null);

    function setResultConfigType(type) {
        const newCfg = {...startSquareCfg};
        newCfg.resultCfg.type = type;
        if(type === 'ally-piece') newCfg.resultCfg.value = pickedAllyPieceForPlace;
        else newCfg.resultCfg.value = undefined;
        onCfgChange(newCfg);
    }

    const resultAllyPieceList = Boolean(pieces) && pieces.map(pieceObj => {
        const pieceKey = getPieceKey(pieceObj);
        return (
            <Radio onChange={() => {
                setPickedAllyPieceForPlace(pieceKey);
                if(startSquareCfg.resultCfg.type === 'ally-piece') {
                    const newCfg = {
                        ...startSquareCfg,
                        resultCfg: {
                            ...startSquareCfg.resultCfg,
                            value: pieceKey
                        }
                    };
                    onCfgChange(newCfg);
                }
            }} checked={pieceKey === pickedAllyPieceForPlace} id={'result-ally-place-'+pieceKey} key={'result-ally-place-'+pieceKey} name="result-ally-place" labelText={pieceObj.name} />
        )
    });

    return (
        <div className="square-result-configuration">
            <span className="close-cfg" onClick={onClose}>✖</span>

            <label htmlFor="result-cfg-place-piece">
                <span>Place the piece here</span>
                <input onChange={(e) => setResultConfigType(e.currentTarget.value)} value={'piece-here'} id="result-cfg-place-piece" name="result-cfg" type="radio" defaultChecked={startSquareCfg.resultCfg.type==='piece-here'} />
            </label>

            <label htmlFor="result-cfg-apply-list">
                <span>
                    Clear square
                </span>
                <input onChange={(e) => setResultConfigType(e.currentTarget.value)} value={'clear'} id="result-cfg-apply-list" name="result-cfg" type="radio" defaultChecked={startSquareCfg.resultCfg.type==='clear'} />
            </label>

            <label className="result-ally-list-btn" htmlFor="result-cfg-ally-piece">
                <span>Place picked ally
                    <label>
                        <span>Piece</span>
                        <input type="checkbox" defaultChecked={false} />
                    </label>
                    <div className="result-ally-piece-list">
                        <div>
                        {resultAllyPieceList}
                        </div>
                    </div>
                </span>
                <input onChange={(e) => setResultConfigType(e.currentTarget.value)} value={'ally-piece'}  id="result-cfg-ally-piece" name="result-cfg" type="radio" defaultChecked={startSquareCfg.resultCfg.type==='ally-piece'} />
            </label>

            <label htmlFor="result-cfg-leave-same">
                <span>Leave square the same</span>
                <input onChange={(e) => setResultConfigType(e.currentTarget.value)} value={'same'}  id="result-cfg-leave-same" name="result-cfg" type="radio" defaultChecked={!startSquareCfg.resultCfg.type || startSquareCfg.resultCfg.type==='same'} />
            </label>
        </div>
    );
}