import './checkbox.css';

export default function Checkbox({className, checked, id, labelText, onChange, ...props}) {
    const changeHandle = Boolean(onChange) && ((event) => {
        onChange(event.currentTarget.checked);
    });
    return (
        <p className={className}>
            <input className='my-checkbox' type="checkbox" id={id} onChange={changeHandle || (() => {})} checked={checked} {...props}/>
            <label htmlFor={id}>{labelText}</label>
        </p>
    );
}