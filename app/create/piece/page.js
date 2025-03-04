'use client';

import CreatePiece from "../components/CreatePiece";
import { PiecesContext, UpdatePiecesContext } from "@/app/context/PieceContext";
import { PositionContext, UpdatePositionContext } from "@/app/context/PositionContext";
import usePieces from "@/app/hooks/usePieces";
import usePositions from "@/app/hooks/usePositions";

export default function CreatePiecePage() {

    const {pieces, updatePieces} = usePieces();
    const {positions, updatePositions} = usePositions();

    return (
        <PiecesContext.Provider value={pieces}>
            <UpdatePiecesContext.Provider value={updatePieces}>
                <PositionContext.Provider value={positions}>
                    <UpdatePositionContext.Provider value={updatePositions}>
                        <CreatePiece />
                    </UpdatePositionContext.Provider>
                </PositionContext.Provider>
            </UpdatePiecesContext.Provider>
        </PiecesContext.Provider>
    );
}