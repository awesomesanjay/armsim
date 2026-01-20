
import React from 'react';
import { REGISTERS } from '../core/cpu';

const REG_NAMES = Object.keys(REGISTERS).sort((a, b) => REGISTERS[a] - REGISTERS[b]);

export default function Registers({ registers }) {
    return (
        <div className="panel" style={{ height: '45%' }}>
            <h2>Registers</h2>
            <table>
                <tbody>
                    {REG_NAMES.map(name => {
                        if (name === 'PC') return null; // Shown in Status Panel
                        const val = registers[REGISTERS[name]];
                        return (
                            <tr key={name}>
                                <td className="reg-name">{name}</td>
                                <td className="reg-hex">0x{val.toString(16).toUpperCase().padStart(8, '0')}</td>
                                <td className="reg-dec">{val}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
