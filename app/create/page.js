'use client'

import ChessBoard from "@/app/components/chess-board/ChessBoard";
import './create.css';
import AuthProtected from "../AuthProtected";

import CreatePosition from "./components/CreatePosition";



export default function CreatePage() {

    const content = (<></>);

    return (
        <AuthProtected>
            {content}
        </AuthProtected>
    ); 
}