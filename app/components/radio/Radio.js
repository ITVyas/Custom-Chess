import './radio.css';

export default function Radio({className, checked, id, labelText, onChange, ...props}) {
    const changeHandle = Boolean(onChange) && ((event) => {
        onChange(event.currentTarget.checked);
    });
    return (
        <p className={className}>
            <input className='my-radio' type="radio" id={id} onChange={changeHandle || (() => {})} checked={checked} {...props} />
            <label htmlFor={id}>{labelText}</label>
        </p>
    );
}
