
import React, { useState } from 'react';
import { Memory } from '../core/memory';

// A simple memory viewer showing a range of addresses
export default function MemoryView({ memory, revision }) {
    const [startAddr, setStartAddr] = useState(0);

    // Show 16 rows of 4 words (16 bytes) -> Actually typically 16 bytes per row
    const rows = [];
    try {
        for (let i = 0; i < 16; i++) {
            const rowAddr = startAddr + i * 16;
            const bytes = [];
            for (let j = 0; j < 16; j++) {
                try {
                    bytes.push(memory.readByte(rowAddr + j));
                } catch (e) {
                    bytes.push(0); // Out of bounds
                }
            }
            rows.push({ addr: rowAddr, bytes });
        }
    } catch (e) {
        console.error(e);
    }

    return (
        <div className="panel" style={{ height: '35%', display: 'flex', flexDirection: 'column' }}>
            <h2>Memory</h2>
            <div style={{ marginBottom: 5 }}>
                <label>Start Address: 0x</label>
                <input
                    type="text"
                    defaultValue="0000"
                    onBlur={(e) => setStartAddr(parseInt(e.target.value, 16) || 0)}
                    style={{ background: '#334155', border: 'none', color: 'white', padding: '2px 5px' }}
                />
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Address</th>
                            {Array.from({ length: 16 }).map((_, i) => <th key={i}>{i.toString(16).toUpperCase()}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(row => (
                            <tr key={row.addr}>
                                <td className="mem-addr">0x{row.addr.toString(16).toUpperCase().padStart(4, '0')}</td>
                                {row.bytes.map((b, i) => (
                                    <td key={i} style={{ color: b === 0 ? '#475569' : '#e2e8f0' }}>
                                        {b.toString(16).toUpperCase().padStart(2, '0')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
