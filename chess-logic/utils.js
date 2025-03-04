
export function exists(x) {
    return x !== undefined && x !== null && (typeof(x) !== 'number' || !isNaN(x));
}

export function getPieceKey(pieceObj) {
    if('key' in pieceObj) return pieceObj.key;
    return exists(pieceObj.id) ? pieceObj.id : pieceObj.name;
}

export function getPositionKey(position) {
    return exists(position.id) ? position.id : position.name; 
}