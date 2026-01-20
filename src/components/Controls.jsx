
import React from 'react';

const Icons = {
    Play: () => <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>,
    Pause: () => <svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>,
    Step: () => <svg viewBox="0 0 24 24"><path d="M19 12l-7 5V7l7 5zm-9 5V7H8v10h2z" /></svg>,
    Reset: () => <svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" /></svg>,
    Load: () => <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>
};

export default function Controls({ onRun, onStep, onReset, running }) {
    return (
        <div className="controls-section" style={{ gap: 15 }}>
            <button className="control-btn" onClick={onRun} title={running ? "Pause" : "Run"}>
                {running ? <><Icons.Pause /> Pause</> : <><Icons.Play /> Run</>}
            </button>

            <button className="control-btn" onClick={onStep} disabled={running} style={{ opacity: running ? 0.5 : 1 }}>
                <Icons.Step /> Step
            </button>

            <div style={{ width: 1, height: '60%', background: '#ffffff30' }}></div>
            <button className="control-btn" onClick={onReset}>
                <Icons.Reset /> Reset
            </button>
        </div>
    );
}
