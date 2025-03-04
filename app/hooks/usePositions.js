'use client'
import { useState, useEffect } from "react";
import getAllUserPositions from "../utils/actions/getAllUserPositions";

export default function usePositions() {
    const [positions, setPositions] = useState(null);

    const updatePositions = async () => {
        const userPositionsRaw = await getAllUserPositions();
        setPositions(
            Object.entries(userPositionsRaw).map(([key, value]) => {
                return value;
            }).flat()
        );
    }; 
    
    useEffect(() => {
        updatePositions();
    }, []);

    

    return {positions, updatePositions};
}