'use client'

import CreatePosition from "@/app/create/components/CreatePosition"
import { PiecesContext, UpdatePiecesContext } from "@/app/context/PieceContext";
import usePieces from "@/app/hooks/usePieces";
import usePositions from "@/app/hooks/usePositions";
import { PositionContext, UpdatePositionContext } from "@/app/context/PositionContext";

export default function CreatePositionPage() {

    const {pieces, updatePieces} = usePieces();
    const {positions, updatePositions} = usePositions();
    
    
    return (
        <PiecesContext.Provider value={pieces}>
            <UpdatePiecesContext.Provider value={updatePieces}>
                <PositionContext.Provider value={positions}>
                    <UpdatePositionContext.Provider value={updatePositions}>
                        <CreatePosition />
                    </UpdatePositionContext.Provider>
                </PositionContext.Provider>
            </UpdatePiecesContext.Provider>
        </PiecesContext.Provider>
    );
}