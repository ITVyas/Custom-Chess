import './file-drop.css';
import {useRef, useState } from 'react';

export default function FileDrop({labelUploadFileType="File", accept, fileValidationAsync, reportRef}) {

    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('no file');

    const fileInputRef = useRef(null);

    if(reportRef instanceof Object) {
        if(typeof(reportRef.current) !== 'object' || !reportRef.current) reportRef.current = {};
        reportRef.current.file = file;
        reportRef.current.status = status;
    }
    
    const handleChange = async () => {
        const fileInput = fileInputRef.current;
        const file = fileInput.files[0];
        setFile(file);
        setStatus('validation');

        if(file && fileValidationAsync) {
            const validObj = await fileValidationAsync(file);
            if(validObj.valid) setStatus('correct');
            else setStatus('incorrect');
        } else {
            setStatus(file ? 'correct' : 'no file');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    };

    const handleDragLeaveEnd = (e) => {
        e.currentTarget.classList.remove('drag-over');
    };

    const handleDrop = (e) => {
        e.preventDefault();

        const files = e.dataTransfer.files;
        if(files.length === 0) return;

        fileInputRef.current.files = files;
        handleChange();

        e.currentTarget.classList.remove('drag-over');
    };

    return (
        <label className='my-file-drop' onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeaveEnd} onDragEnd={handleDragLeaveEnd}>
            {file ? (
                <div className={'loaded-file-preview ' + (['correct', 'incorrect'].includes(status) && status)}>
                    <div className='file-preview-name'><div>{file.name}</div></div>
                </div>
            ) : (
                <div className='no-file-content'>
                    <span className='folder-icon'>📂</span>
                    <span className='label-text'>Drag & Drop to Upload {labelUploadFileType}</span>
                    <span className='my-file-drop-OR'>OR</span>
                    <span className='browse-file'>Browse {labelUploadFileType}</span>
                </div>
            )}
            <input ref={fileInputRef} onChange={handleChange} type='file' accept={accept}/>
        </label>
    );
}