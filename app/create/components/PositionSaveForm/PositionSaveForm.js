import { useRef } from 'react';
import './position-save-form.css';

export default function PositionSaveForm({ onSubmit=() => {}, onClose=() => {} }) {
    const formRef = useRef();
    const positionNameRef = useRef();
    return (
        <div className='position-save-form-container'>
            <form ref={formRef} className='position-save-form'>
                <span className='close-btn' onClick={onClose}>✖</span>
                <div>
                    <span>Position name:</span>
                    <input ref={positionNameRef} type='text' placeholder='Enter position name' required/>
                </div>
                <button onClick={(e) => {
                    if(!formRef.current.checkValidity()) return true;
                    e.preventDefault();
                    onSubmit({ name: positionNameRef.current.value });
                    return false;
                }} type='submit' className='btn'>Save</button>
            </form>
        </div>
    );
}