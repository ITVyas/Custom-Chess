import './radio-set-inline.css';
import { exists } from '@/app/utils/util';

export default function RadioSetInline({options, name, onChange, setOption, enterValue, enterMin, enterMax}) {
    const buttons = options.map((option, i) => {
        const addClass = i === 0 ? ' first' : 
                        i === options.length - 1 ? ' last' :
                        '';

        const clickHandler = () => {
            document.getElementById(`radio-set-inline-${name}-${option}`).checked = true;
        };

        const blurHandler = (e) => {
            const input = e.currentTarget;
            if(input.value === '') input.value = enterMin || 0;
            if(exists(enterMin) && Number(input.value) < enterMin) input.value = enterMin; 
            if(exists(enterMax) && Number(input.value) > enterMax) input.value = enterMax; 
            onChange({'option': '[Enter]', 'value': Number(input.value)})
        };

        const inputHandler = (e) => {
            const input = e.currentTarget;
            let value = input.value;
            if(value === '') {
                onChange({'option': '[Enter]', 'value': ''})
            } else {
                if(exists(enterMin) && Number(value) < enterMin) value = enterMin; 
                if(exists(enterMax) && Number(value) > enterMax) value = enterMax; 
                value = Number(value);

                onChange({'option': '[Enter]', 'value': value})
            }
        };

        return (
            <label key={`radio-set-inline-${name}-${option}`} htmlFor={`radio-set-inline-${name}-${option}`} className={"radio-set-inline" + addClass}>
                {option === '[Enter]' ? <span>
                    <input onBlur={blurHandler} onInput={inputHandler} onClick={clickHandler} type='number' min={enterMin || 0} max={enterMax || 99} className='radio-set-number-input' value={enterValue || (enterValue === '' ? '' : 0)}/>
                </span> : <span>{option}</span>}
                <input onChange={() => onChange(option === '[Enter]' ? {'option': '[Enter]', 'value': enterValue} : option)} id={`radio-set-inline-${name}-${option}`} type='radio' name={name} value={option} checked={option === setOption} />
            </label>
        );
    });
    return (
        <>
            {buttons}
        </>
    );
}