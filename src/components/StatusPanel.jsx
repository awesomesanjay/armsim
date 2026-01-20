
import React from 'react';
import { FLAGS } from '../core/cpu';

export default function StatusPanel({ cpsr, pc }) {
    return (
        <div className="panel" style={{ height: '15%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 5 }}>
                <h2 style={{ margin: 0, border: 'none' }}>Status</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 10 }}>
                <div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4 }}>FLAGS</div>
                    <div style={{ display: 'flex' }}>
                        <span className={`flag ${cpsr & FLAGS.N ? 'active' : ''}`}>N</span>
                        <span className={`flag ${cpsr & FLAGS.Z ? 'active' : ''}`}>Z</span>
                        <span className={`flag ${cpsr & FLAGS.C ? 'active' : ''}`}>C</span>
                        <span className={`flag ${cpsr & FLAGS.V ? 'active' : ''}`}>V</span>
                    </div>
                </div>

                <div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4 }}>PROGRAM COUNTER</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: 'var(--accent-blue)' }}>
                        0x{pc.toString(16).toUpperCase().padStart(8, '0')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Line {Math.floor(pc / 4)}</div>
                </div>
            </div>
        </div>
    );
}
