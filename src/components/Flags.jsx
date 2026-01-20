
import React from 'react';
import { FLAGS } from '../core/cpu';

export default function Flags({ cpsr }) {
    return (
        <div className="panel" style={{ height: '10%' }}>
            <h2>Flags</h2>
            <div>
                <span className={`flag ${cpsr & FLAGS.N ? 'active' : ''}`}>N</span>
                <span className={`flag ${cpsr & FLAGS.Z ? 'active' : ''}`}>Z</span>
                <span className={`flag ${cpsr & FLAGS.C ? 'active' : ''}`}>C</span>
                <span className={`flag ${cpsr & FLAGS.V ? 'active' : ''}`}>V</span>
            </div>
        </div>
    );
}
