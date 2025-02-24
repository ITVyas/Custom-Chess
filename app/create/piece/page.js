'use client';

import CreatePiece from "../components/CreatePiece";
import { PiecesContext, UpdatePiecesContext } from "@/app/context/PieceContext";
import usePieces from "@/app/hooks/usePieces";

export default function CreatePiecePage() {

    const {pieces, updatePieces} = usePieces();
    

    return (
        <PiecesContext.Provider value={pieces}>
            <UpdatePiecesContext.Provider value={updatePieces}>
                <CreatePiece />
            </UpdatePiecesContext.Provider>
        </PiecesContext.Provider>
    );
}