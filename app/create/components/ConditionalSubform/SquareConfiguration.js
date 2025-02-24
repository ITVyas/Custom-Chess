import { useContext } from "react";
import Checkbox from "@/app/components/checkbox/Checkbox";
import RadioSetInline from "@/app/components/radio-set-inline/RadioSetInline";
import { PiecesContext } from "@/app/context/PieceContext";
import { getPieceKey } from "../create-util";
import { deepCopy } from "@/app/utils/util";

function currentPieceName(cfg) {
    if(cfg.pieceCfg.whitelist) {
        if(cfg.pieceCfg.whitelist.length === 0 || cfg.pieceCfg.whitelist.length === 1 && cfg.pieceCfg.whitelist[0] === null)
            return 'NO PIECE';
        return 'WHITELIST';
    }
    if(cfg.pieceCfg.blacklist) {
        if(cfg.pieceCfg.blacklist.length === 1 && cfg.pieceCfg.blacklist[0] === null)
            return 'SOME PIECE';
        else if (cfg.pieceCfg.blacklist.length === 0)
            return 'ANYTHING';
        return 'BLACKLIST';
    }
    return null;
}

function valueOrEmptyOrDefault(value, defaultValue) {
    return value || (value === '' ? '' : defaultValue);
}


export default function SquareConfiguration({ startSquareCfg, onCfgChange, onClose }) {
    const pieces = useContext(PiecesContext);
    
    const isThePiece = startSquareCfg.position.row === 0 && startSquareCfg.position.column === 0;
    

    const listContent = Boolean(!isThePiece) && pieces.map(pieceObj => {
        const list = startSquareCfg.pieceCfg.whitelist || startSquareCfg.pieceCfg.blacklist;
        const pieceKey = getPieceKey(pieceObj);
        const checked = list.includes(pieceKey);
        return (
            <Checkbox onChange={() => toggleListPiece(pieceKey)} labelText={pieceObj.name} key={`${pieceKey}-list`} id={`${pieceKey}-list`} checked={checked} />
        );
    })

    function toggleListPiece(pieceType) {
        const newCfg = deepCopy(startSquareCfg);
        const list = newCfg.pieceCfg.whitelist || newCfg.pieceCfg.blacklist;
        const index = list.findIndex(x => x === pieceType);
        if(index !== -1) list.splice(index, 1);
        else list.push(pieceType);
        onCfgChange(newCfg);
    }


    const listIncludeAll = (cfg) => {
        const newCfg = deepCopy(cfg);
        const list = newCfg.pieceCfg.whitelist || newCfg.pieceCfg.blacklist;
        list.splice(0, list.length);
        [null, ...pieces.map(x => getPieceKey(x))].forEach(type => {
            list.push(type);
        });
        onCfgChange(newCfg);
    }

    const listExcludeAll = (cfg) => {
        const newCfg = deepCopy(cfg);
        const list = newCfg.pieceCfg.whitelist || newCfg.pieceCfg.blacklist;
        list.splice(0, list.length, null);
        onCfgChange(newCfg);
    }

    const swapList = (cfg) => {
        const newCfg = deepCopy(cfg);
        [newCfg.pieceCfg.whitelist, newCfg.pieceCfg.blacklist] = [newCfg.pieceCfg.blacklist, newCfg.pieceCfg.whitelist];
        onCfgChange(newCfg);
    }

    const setCfgProp = (cfg, propPath, value) => {
        const newCfg = deepCopy(cfg);
        let currentObj = newCfg;
        propPath.forEach((prop, i) => {
            if(i === propPath.length - 1) {
                if(typeof(value) === 'object') {
                    currentObj[prop] = value['option'];
                    currentObj[prop+'Value'] = value['value'];
                } else {
                    currentObj[prop] = value;
                }
                return;
            }

            if(!currentObj[prop]) currentObj[prop] = {};
            currentObj = currentObj[prop];
        });
        onCfgChange(newCfg);
    };
    
    const pieceName = currentPieceName(startSquareCfg);
    const piece = isThePiece ? (
        <>
            <div>Piece: <b>YOUR PIECE</b></div>
        </>
    ) : (
        <>
            <div>Piece: <b>{pieceName}</b></div>
            <label className="whitelist-btn" htmlFor="whitelist-show-box">
                <span>{(startSquareCfg.pieceCfg.whitelist) ? 'Whitelist' : 'Blacklist'}</span>
                <input type="checkbox" id="whitelist-show-box"/>

                <div className="whitelist-container">
                    <div className="whitelist-control-panel">
                        <button onClick={() => listIncludeAll(startSquareCfg)} className="btn" type="button">All on</button>
                        <button onClick={() => listExcludeAll(startSquareCfg)} className="btn" type="button">All off</button>
                        <button onClick={() => swapList(startSquareCfg)} className="btn" type="button">{(startSquareCfg.pieceCfg.whitelist) ? 'Black-' : 'White-'}</button>
                    </div>
                    <div className="scrollable-whitelist-container">
                        <div className="whitelist-content">
                            <Checkbox onChange={() => toggleListPiece(null)} labelText={'no piece'} id="no-piece-whitelist" checked={(() => {
                                const list = startSquareCfg.pieceCfg.whitelist || startSquareCfg.pieceCfg.blacklist;
                                return list.includes(null);
                            })()} />
                            {listContent}
                        </div>
                    </div>
                </div>
            </label>
        </>
    );
    const pieceConfiguration = (
        <div>
            {
               isThePiece ? (
                    <div className="radio-pick-line">Color: <RadioSetInline onChange={(value) => setCfgProp(startSquareCfg, ['pieceCfg', 'color'], value)} name={'piece-color'} options={['any', 'white', 'black']} setOption={startSquareCfg.pieceCfg.color || 'any'}/></div>
               ) : (
                    <div className="radio-pick-line">Color: <RadioSetInline onChange={(value) => setCfgProp(startSquareCfg, ['pieceCfg', 'color'], value)} name={'piece-color'} options={['any', 'white', 'black', 'ally', 'enemy']} setOption={startSquareCfg.pieceCfg.color || 'any'}/></div>
               )
            }
            
            <div className="radio-pick-line">Moves done: <RadioSetInline onChange={(value) => setCfgProp(startSquareCfg, ['pieceCfg', 'movesDone'], value)} name={'moves-done'} options={['any', '[Enter]']}  setOption={startSquareCfg.pieceCfg.movesDone || 'any'} enterValue={valueOrEmptyOrDefault(startSquareCfg.pieceCfg.movesDoneValue, 0)} enterMin={0} enterMax={99}/></div>
            <div className="radio-pick-line">Last move was _ moves ago: <RadioSetInline onChange={(value) => setCfgProp(startSquareCfg, ['pieceCfg', 'lastMoveAgo'], value)} name={'last-move'} options={['any', '[Enter]']}  setOption={startSquareCfg.pieceCfg.lastMoveAgo || 'any'} enterValue={valueOrEmptyOrDefault(startSquareCfg.pieceCfg.lastMoveAgoValue, 1)} enterMin={1} enterMax={99}/></div>
        </div>
    );
    const squareConfiguration = (
        <div>
            <div className="radio-pick-line">Is attacked: <RadioSetInline onChange={(value) => setCfgProp(startSquareCfg, ['squareCfg', 'attacked'], value)} name={'attacked'} options={['any', 'yes', 'no']}  setOption={startSquareCfg.squareCfg.attacked || 'any'}/></div>
            {
                isThePiece ? (
                    <>
                        <div className="radio-pick-line">Color: <RadioSetInline onChange={(value) => setCfgProp(startSquareCfg, ['squareCfg', 'color'], value)} name={'square-color'} options={['any', 'black', 'white']}  setOption={startSquareCfg.squareCfg.color || 'any'}/></div>
                        <div className="radio-pick-line">Board row: <RadioSetInline onChange={(value) => setCfgProp(startSquareCfg, ['squareCfg', 'relativeRow'], value)} name={'square-row'} options={['any', 'start', 'end', '[Enter]']}  setOption={startSquareCfg.squareCfg.relativeRow || 'any'} enterValue={valueOrEmptyOrDefault(startSquareCfg.squareCfg.relativeRowValue, 1)} enterMin={1} enterMax={99}/></div>
                        <div className="radio-pick-line">Board column: <RadioSetInline onChange={(value) => setCfgProp(startSquareCfg, ['squareCfg', 'relativeColumn'], value)} name={'square-column'} options={['any', 'left', 'right', '[Enter]']}  setOption={startSquareCfg.squareCfg.relativeColumn || 'any'} enterValue={valueOrEmptyOrDefault(startSquareCfg.squareCfg.relativeColumnValue, 1)} enterMin={1} enterMax={99}/></div>
                    </>
                ) : null
            }
            
        </div>
    );

    return (
        <div className="square-configuration">
            <span className="close-cfg" onClick={onClose}>✖</span>
            <div>Relative coords (v / h): <b>{startSquareCfg.position.row} / {startSquareCfg.position.column}</b></div>
            {piece}
            {pieceName !== 'NO PIECE' && (
                <div style={{marginTop: '10px'}}>
                    <div><b>Piece: </b></div>
                    {pieceConfiguration}
                 </div>
            )}
            
            <div style={{marginTop: '10px'}}> 
                <div><b>Square: </b></div>
                {squareConfiguration}
            </div>
            
        </div>
    );
}