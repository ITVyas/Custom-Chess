import { getPieceKey } from './utils.js';

const BASE_KEYS = ['id', 'name', 'logic', 'blackImagePath', 'whiteImagePath'];
export class PieceBaseStore {
    constructor(pieceBases={}) {
        this.keyPiecePrototype = pieceBases;
    }

    addBase(piece) {
        const pieceKey = getPieceKey(piece);
        const data = {key: pieceKey};
        const base = {};

        Object.entries(piece).forEach(([key, value]) => {
            if(BASE_KEYS.includes(key)) {
                base[key] = value;
            } else {
                data[key] = value;
            }
        });

        if(pieceKey in this.keyPiecePrototype) return data;

        this.keyPiecePrototype[pieceKey] = base;
        return data;
    }

    getBase(key) {
        if(!(key in this.keyPiecePrototype)) return null;
        return {...this.keyPiecePrototype[key]};
    }

    getBaseField(key, fieldName) {
        if(!(key in this.keyPiecePrototype)) return null;
        return this.keyPiecePrototype[key][fieldName]; 
    }

    getBaseUnitedWithData(pieceData) {
        const key = pieceData.key;
        if(!(key in this.keyPiecePrototype)) return pieceData;
        const base = this.keyPiecePrototype[key];
        return {
            ...pieceData,
            ...base
        };
    } 
}