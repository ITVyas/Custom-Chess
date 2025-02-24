'use client'
import { useState, useEffect } from "react";
import { getAllUserPieces } from "../create/components/create-util";

export default function usePieces() {
    const [pieces, setPieces] = useState(null);

    const updatePieces = async () => {
        const userPiecesRaw = await getAllUserPieces();
        setPieces(
            Object.entries(userPiecesRaw).map(([key, value]) => {
                return value;
            }).flat()
        );
    }; 
    
    useEffect(() => {
        updatePieces();
    }, []);

    

    return {pieces, updatePieces};
}