
import React, { useState, useEffect, useRef } from 'react';
import Editor from './components/Editor';
import Registers from './components/Registers';
import StatusPanel from './components/StatusPanel';
import MemoryView from './components/MemoryView';
import Controls from './components/Controls';
import { CPU, REGISTERS } from './core/cpu';
import { Memory } from './core/memory';
import { Assembler } from './core/assembler';
import { EXAMPLES } from './examples';

const memory = new Memory();
const cpu = new CPU(memory);
const assembler = new Assembler();

function App() {
  const [code, setCode] = useState(EXAMPLES['Simple Addition']);
  const [registers, setRegisters] = useState(new Int32Array(16));
  const [cpsr, setCpsr] = useState(0);
  const [pcLine, setPcLine] = useState(-1);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [breakpoints, setBreakpoints] = useState(new Set());
  const [memRevision, setMemRevision] = useState(0);

  const runIntervalRef = useRef(null);
  const isRunningRef = useRef(false);
  const pcMapRef = useRef(new Map());

  // ... imports

  useEffect(() => {
    loadAndAssemble();
    updateState();
  }, []);

  const updateState = () => {
    setRegisters(new Int32Array(cpu.registers));
    setCpsr(cpu.cpsr);
    setMemRevision(m => m + 1);

    const currentPC = cpu.registers[REGISTERS.PC];
    const line = pcMapRef.current.get(currentPC);
    setPcLine(line !== undefined ? line - 1 : -1);
  };

  const loadAndAssemble = (codeToAssemble = code) => {
    try {
      const program = assembler.assemble(codeToAssemble);
      cpu.loadProgram(program);

      pcMapRef.current.clear();
      program.forEach(inst => {
        if (inst.lineNumber) {
          pcMapRef.current.set(inst.address, inst.lineNumber);
        }
      });

      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  };

  const checkBreakpoint = () => {
    const currentPC = cpu.registers[REGISTERS.PC];
    const line = pcMapRef.current.get(currentPC);
    if (line && breakpoints.has(line)) {
      return true;
    }
    return false;
  };

  const executeStep = () => {
    try {
      cpu.step();
      updateState();
      return true;
    } catch (e) {
      setError(e.message);
      stopRun();
      return false;
    }
  };

  const stopRun = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    if (runIntervalRef.current) clearTimeout(runIntervalRef.current);
  };

  const runLoop = () => {
    if (!isRunningRef.current) return;

    if (checkBreakpoint()) {
      stopRun();
      return;
    }

    if (cpu.halted) {
      stopRun();
      return;
    }

    if (executeStep()) {
      // Hardcoded speed: 500ms
      runIntervalRef.current = setTimeout(runLoop, 500);
    }
  };

  const handleStep = () => {
    stopRun();
    setError(null);
    try {
      if (pcMapRef.current.size === 0 || !cpu.program) {
        if (loadAndAssemble()) {
          updateState(); // Show initial state
          return; // Stop. User sees Line 1 (or starting line) highlighted. Next click executes it.
        }
        return;
      }
      executeStep();
    } catch (e) { setError(e.message); }
  };

  const handleRun = () => {
    if (isRunning) {
      stopRun();
      return;
    }

    setError(null);
    if (pcMapRef.current.size === 0 || !cpu.program) {
      if (!loadAndAssemble()) return;
    }

    if (checkBreakpoint()) {
      try {
        cpu.step();
        updateState();
        if (cpu.halted) return;
      } catch (e) { setError(e.message); return; }
    }

    setIsRunning(true);
    isRunningRef.current = true;
    runLoop();
  };

  const handleReset = () => {
    stopRun();
    cpu.reset();
    memory.reset();
    // cpu.program = null; // Don't clear program, we reload it
    // pcMapRef.current.clear();
    setError(null);
    loadAndAssemble(); // Reload current code
    updateState();
    // setPcLine(-1); // updateState sets it correctly to start
  };

  const handleToggleBreakpoint = (lineNum) => {
    const next = new Set(breakpoints);
    if (next.has(lineNum)) next.delete(lineNum);
    else next.add(lineNum);
    setBreakpoints(next);
  };

  const handleLoadExample = (key) => {
    const newCode = EXAMPLES[key];
    setCode(newCode);
    stopRun();
    cpu.reset();
    memory.reset();
    setError(null);
    loadAndAssemble(newCode);
    updateState();
  };

  return (
    <div className="app-container">
      <div className="editor-section">
        <div className="editor-header">
          <span>Assembly Editor</span>
          <select
            onChange={(e) => handleLoadExample(e.target.value)}
            style={{ background: '#333', color: 'white', border: '1px solid #555', fontSize: '0.85rem' }}
            value=""
          >
            <option value="" disabled>Load Example...</option>
            {Object.keys(EXAMPLES).map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <Editor
          code={code}
          onChange={(val) => {
            setCode(val);
            cpu.program = null;
            pcMapRef.current.clear();
            setPcLine(-1);
          }}
          activeLine={pcLine}
          breakpoints={breakpoints}
          onToggleBreakpoint={handleToggleBreakpoint}
        />
        {error && <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: '#8a2d2d', color: 'white', padding: '10px', fontSize: '0.9rem',
          zIndex: 10, display: 'flex', justifyContent: 'space-between'
        }}>
          <span>Error: {error}</span>
          <button onClick={() => setError(null)} style={{ background: 'transparent', border: '1px solid white', color: 'white', cursor: 'pointer' }}>Dismiss</button>
        </div>}
      </div>

      <div className="sidebar">
        <StatusPanel cpsr={cpsr} pc={registers[REGISTERS.PC]} />
        <Registers registers={registers} />
        <MemoryView memory={memory} revision={memRevision} />
      </div>

      <Controls
        onRun={handleRun}
        onStep={handleStep}
        onReset={handleReset}
        onLoadExample={() => { }} // Redundant but prop mismatch check? Controls doesn't use it now?
        // Wait, Controls used onLoadExample previously. I removed it from Controls props in my write_to_file?
        // No, I only touched speed. 
        // Let's check Controls.jsx props.
        running={isRunning}
      />
    </div>
  );
}

export default App;
