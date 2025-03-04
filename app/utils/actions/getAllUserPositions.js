import { PiecePositions } from "@/app/components/chess-board/place-pieces";
import getUserCustomPositions from "./getUserCustomPositions";

export default async function getAllUserPositions() {
    const defaultPositions = [PiecePositions.getStandard()];
    const customPositions = await getUserCustomPositions();
    return {
        default: defaultPositions,
        custom: customPositions
    };
}