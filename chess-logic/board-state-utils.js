import { exists, getPieceKey } from "./utils.js";

export function getDefaultPieceCfg() {
    return {
        color: 'any',
        movesDone: 'any',
        lastMoveAgo: 'any'
    };
}

export function getDefaultSquareCfg() {
    return {
        attacked: 'any',
        color: 'any',
        relativeRow: 'any',
        relativeColumn: 'any'
    };
}

export function getPieceCfgFromCfgPart(cfgPart) {
    return {
        ...(getDefaultPieceCfg()),
        ...cfgPart
    };
}

export function getSqaureCfgFromCfgPart(cfgPart) {
    return {
        ...(getDefaultSquareCfg()),
        ...cfgPart
    };
}

export function doPieceAndCfgMatch(piece, pieceCfg, allyColor) {

    if(pieceCfg.whitelist || pieceCfg.blacklist) {
        const pieceKey = exists(piece) ? getPieceKey(piece) : null;
        if(pieceCfg.whitelist && !pieceCfg.whitelist.includes(pieceKey)) return false;
        if(pieceCfg.backlist && pieceCfg.whitelist.includes(pieceKey)) return false;
        if(!exists(piece)) return true;
    }

    for(let [key, value] of Object.entries(pieceCfg)) {
        if(value === 'any') continue;

        switch(key) {
            case 'color': 
                if(pieceCfg.color === 'ally' && piece.color !== allyColor) return false;
                else if(pieceCfg.color === 'enemy' && piece.color === allyColor) return false;
                else if(['white', 'black'].includes(pieceCfg.color) && piece.color !== pieceCfg.color) return false;    
                break; 
            case 'movesDone': 
                if(pieceCfg.movesDone === '[Enter]' && parseInt(pieceCfg.movesDoneValue) !== piece.movesDone) return false;    
                break; 
            case 'lastMoveAgo': 
                if(pieceCfg.lastMoveAgo === '[Enter]' && parseInt(pieceCfg.lastMoveAgoValue) !== piece.lastMoveAgo) return false;    
                break; 
        }
    }

    return true;
}

export function doSquareAndCfgMatch(square, squareCfg) {
    if(!exists(square)) return false;
    for(let [key, value] of Object.entries(squareCfg)) {
        if(value === 'any') continue;

        switch(key) {
            case 'attacked':
                if(square.attacked !== (squareCfg.attacked === 'yes')) return false;    
                break; 
            case 'color': 
                if(square.color !== squareCfg.color) return false;    
                break; 
            case 'relativeRow': 
                break; //ToDo
            case 'relativeColumn': 
                break; //ToDo
        }
    }

    return true;
}  