'use client';
import { getPositionKey } from "@/chess-logic/utils";
import { exists } from "@/app/utils/util";
import { useState } from "react";

function defaultFormData() {
    return {
        positionKey: 'standard'
    };
}

export default function LocalPlayForm({ onClose, onSubmit, positions }) {
    const [formData, setFormData] = useState(defaultFormData());

    function positionNameChangeHandler(e) {
        const newPositionKey = e.currentTarget.value;
        setFormData({
            ...formData,
            positionKey: newPositionKey
        });
    }

    function submitHandle(e) {
        e.preventDefault();
        
        if(exists(positions)) {
            onSubmit(formData);
        }
        
        return false;
    }

    const positionOptionEls = positions ? positions.map(position => (
        <option key={getPositionKey(position)} value={getPositionKey(position)}>{position.name}</option>
    )) : null;

    return (
        <form className="local-play-form">
            <span className="close-btn" onClick={onClose}>✖</span>
            <h3 align="center">Starting local game</h3>
            <label htmlFor="select-position">
                <span style={{ marginLeft: 10 }}>Position: </span>
                <select id="select-position" value={formData.position} onChange={positionNameChangeHandler}>
                    {positionOptionEls}
                </select>
            </label>
            
            <button type="submit" className="btn" onClick={submitHandle}>Play</button>
        </form>
    );
}