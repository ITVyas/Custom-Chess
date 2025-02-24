'use client'

import CreatePosition from "@/app/create/components/CreatePosition"
import { PiecesContext, UpdatePiecesContext } from "@/app/context/PieceContext";
import usePieces from "@/app/hooks/usePieces";

export default function CreatePositionPage() {

    const {pieces, updatePieces} = usePieces();
    
    return (
        <PiecesContext.Provider value={pieces}>
            <UpdatePiecesContext.Provider value={updatePieces}>
                <CreatePosition />
            </UpdatePiecesContext.Provider>
        </PiecesContext.Provider>
    );
}