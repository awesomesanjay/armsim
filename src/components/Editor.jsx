
import React, { useRef, useState } from 'react';

export default function Editor({ code, onChange, activeLine, breakpoints = new Set(), onToggleBreakpoint }) {
    const textareaRef = useRef(null);
    const displayRef = useRef(null);

    const handleChange = (e) => {
        onChange(e.target.value);
    };

    const handleScroll = () => {
        if (textareaRef.current && displayRef.current) {
            displayRef.current.scrollTop = textareaRef.current.scrollTop;
            displayRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    const lines = code.split('\n');

    return (
        <div className="editor-container">
            {/* Line Numbers Sidebar */}
            <div className="line-numbers" style={{ scrollTop: textareaRef.current?.scrollTop }}>
                {/* We need to sync this scroll too, or put it inside the scrollable area? 
             Usually line numbers stay fixed horizontally but scroll vertically.
             Let's try a different layout: 
             Outer container: Flex
             Left: Line Numbers (overflow hidden, synced via JS)
             Right: Stacked Textarea + Display (overflow auto)
         */}
            </div>

            {/* Simple approach: Line numbers inside the display loop, as before, but ensure alignment */}

            <div className="editor-stack">
                <textarea
                    ref={textareaRef}
                    className="editor-input"
                    value={code}
                    onChange={handleChange}
                    onScroll={handleScroll}
                    spellCheck="false"
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                />
                <div ref={displayRef} className="code-display">
                    {lines.map((line, i) => {
                        const isBreakpoint = breakpoints.has(i + 1);
                        return (
                            <div
                                key={i}
                                className={`code-line ${i === activeLine ? 'active' : ''}`}
                            >
                                <div
                                    className="gutter"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleBreakpoint(i + 1);
                                    }}
                                >
                                    {isBreakpoint && <span className="breakpoint-dot">●</span>}
                                    {i === activeLine && <span className="execution-arrow">►</span>}
                                    <span className="line-number">{i + 1}</span>
                                </div>
                                <div className="line-content">{line || ' '}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
