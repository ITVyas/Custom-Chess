import './number-input.css';

export default function NumberInput({ required, max, min, value, onInput, defaultValue, ...props }) {
    
    const inputHandler = (e) => {
        const parsedVal = parseInt(e.target.value);
        if(!isNaN(parsedVal)) {
            onInput(parsedVal);
        } else {
            if(e.target.value === '' || e.target.value === '-') onInput(e.target.value);
            else onInput(defaultValue || 0);
        }
    };

    const blurHandler = (e) => {
        let parsedVal = parseInt(e.target.value);
        if(isNaN(parsedVal)) {
            return onInput(defaultValue || 0);
        }
        if(min && parsedVal < min) return onInput(min);
        if(max && parsedVal > max) return onInput(max);
    };

    return (
        <input onBlur={blurHandler} onInput={inputHandler} min={min} max={max} className="number-input" type="number" required={required} value={value} {...props} />
    );
}