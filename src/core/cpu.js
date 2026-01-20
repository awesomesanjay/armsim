
export const REGISTERS = {
    R0: 0, R1: 1, R2: 2, R3: 3, R4: 4, R5: 5, R6: 6, R7: 7,
    R8: 8, R9: 9, R10: 10, R11: 11, R12: 12, R13: 13, LR: 14, PC: 15
};

export const FLAGS = {
    N: 0x80000000,
    Z: 0x40000000,
    C: 0x20000000,
    V: 0x10000000
};

export class CPU {
    constructor(memory) {
        this.memory = memory;
        this.registers = new Int32Array(16);
        this.cpsr = 0; // Current Program Status Register
        this.halted = false;
        this.history = [];
        this.program = null;
        this.branchTaken = false;
    }

    reset() {
        this.registers.fill(0);
        this.cpsr = 0;
        this.halted = false;
        this.history = [];
        this.branchTaken = false;
        // Keep program loaded
    }

    loadProgram(program) {
        this.program = program;
        this.reset();
    }

    setFlag(flag, value) {
        if (value) {
            this.cpsr |= flag;
        } else {
            this.cpsr &= ~flag;
        }
    }

    getFlag(flag) {
        return (this.cpsr & flag) !== 0;
    }

    saveState() {
        // Deep clone registers
        const state = {
            registers: new Int32Array(this.registers),
            cpsr: this.cpsr
        };
        this.history.push(state);
        if (this.history.length > 500) this.history.shift();
    }

    step() {
        if (this.halted) return;
        if (!this.program) return;

        // Check PC Bounds
        const index = Math.floor(this.registers[REGISTERS.PC] / 4);
        if (index >= this.program.length) {
            this.halted = true;
            return;
        }

        // Save history before execution
        this.saveState();

        const instruction = this.program[index];
        try {
            this.execute(instruction);
        } catch (e) {
            console.error("Execution error:", e);
            this.halted = true;
            throw e;
        }

        // Increment PC if not branched
        if (!this.branchTaken) {
            this.registers[REGISTERS.PC] += 4;
        }
        this.branchTaken = false;
    }

    run(maxSteps = 1000) {
        let count = 0;
        while (!this.halted && count < maxSteps) {
            this.step();
            count++;
        }
        return count; // Expose steps taken
    }

    getState() {
        return {
            registers: this.registers,
            cpsr: this.cpsr,
            halted: this.halted,
            pc: this.registers[REGISTERS.PC],
            historyDepth: this.history.length
        };
    }

    execute(inst) {
        const { type, args } = inst;
        const [op1, op2, op3] = args;

        switch (type) {
            case 'MOV':
                // MOV Rd, <op2>
                this.registers[op1.value] = this.getVal(op2);
                this.updateFlags(this.registers[op1.value]); // MOV updates N/Z usually
                break;
            case 'ADD':
                // ADD Rd, Rn, <op2>
                let valAdd;
                if (args.length === 2) {
                    valAdd = this.registers[op1.value] + this.getVal(op2);
                    this.registers[op1.value] = valAdd;
                } else {
                    valAdd = this.registers[op2.value] + this.getVal(op3);
                    this.registers[op1.value] = valAdd;
                }
                // Basic flags
                this.updateFlags(valAdd);
                // TODO: Carry/Overflow logic is complex, skipping for simplicty unless requested
                break;
            case 'SUB':
                let valSub;
                if (args.length === 2) {
                    valSub = this.registers[op1.value] - this.getVal(op2);
                    this.registers[op1.value] = valSub;
                } else {
                    valSub = this.registers[op2.value] - this.getVal(op3);
                    this.registers[op1.value] = valSub;
                }
                this.updateFlags(valSub);
                break;
            case 'MUL':
                // MUL Rd, Rm, Rs
                let valMul = this.registers[op2.value] * this.getVal(op3);
                this.registers[op1.value] = valMul;
                this.updateFlags(valMul);
                break;
            case 'CMP':
                // CMP Rn, <op2>
                const res = this.registers[op1.value] - this.getVal(op2);
                this.updateFlags(res);
                break;
            case 'B':
                this.registers[REGISTERS.PC] = op1.value;
                this.branchTaken = true;
                break;
            case 'BEQ':
                if (this.getFlag(FLAGS.Z)) {
                    this.registers[REGISTERS.PC] = op1.value;
                    this.branchTaken = true;
                }
                break;
            case 'BNE':
                if (!this.getFlag(FLAGS.Z)) {
                    this.registers[REGISTERS.PC] = op1.value;
                    this.branchTaken = true;
                }
                break;
            case 'LDR':
                // LDR Rd, [address]
                {
                    const addr = this.registers[op2.value];
                    this.registers[op1.value] = this.memory.readWord(addr);
                }
                break;
            case 'STR':
                // STR Rd, [address]
                {
                    const addr = this.registers[op2.value];
                    this.memory.writeWord(addr, this.registers[op1.value]);
                }
                break;
            case 'AND':
                // AND Rd, Rn, <op2>
                let valAnd;
                if (args.length === 2) {
                    valAnd = this.registers[op1.value] & this.getVal(op2);
                    this.registers[op1.value] = valAnd;
                } else {
                    valAnd = this.registers[op2.value] & this.getVal(op3);
                    this.registers[op1.value] = valAnd;
                }
                this.updateFlags(valAnd);
                break;
            case 'ORR':
                // ORR Rd, Rn, <op2>
                let valOrr;
                if (args.length === 2) {
                    valOrr = this.registers[op1.value] | this.getVal(op2);
                    this.registers[op1.value] = valOrr;
                } else {
                    valOrr = this.registers[op2.value] | this.getVal(op3);
                    this.registers[op1.value] = valOrr;
                }
                this.updateFlags(valOrr);
                break;
            case 'EOR':
                // EOR Rd, Rn, <op2>
                let valEor;
                if (args.length === 2) {
                    valEor = this.registers[op1.value] ^ this.getVal(op2);
                    this.registers[op1.value] = valEor;
                } else {
                    valEor = this.registers[op2.value] ^ this.getVal(op3);
                    this.registers[op1.value] = valEor;
                }
                this.updateFlags(valEor);
                break;
            case 'LSL':
                // LSL Rd, Rn, <op2>
                let valLsl;
                if (args.length === 2) {
                    valLsl = this.registers[op1.value] << this.getVal(op2);
                    this.registers[op1.value] = valLsl;
                } else {
                    valLsl = this.registers[op2.value] << this.getVal(op3);
                    this.registers[op1.value] = valLsl;
                }
                this.updateFlags(valLsl);
                break;
            case 'LSR':
                // LSR Rd, Rn, <op2>
                let valLsr;
                if (args.length === 2) {
                    valLsr = this.registers[op1.value] >>> this.getVal(op2);
                    this.registers[op1.value] = valLsr;
                } else {
                    valLsr = this.registers[op2.value] >>> this.getVal(op3);
                    this.registers[op1.value] = valLsr;
                }
                this.updateFlags(valLsr);
                break;
            default:
                console.warn("Unimplemented instruction:", type);
        }
    }

    getVal(op) {
        if (op.type === 'register') return this.registers[op.value];
        if (op.type === 'immediate') return op.value;
        if (op.type === 'memory') return 0;
        return 0;
    }

    updateFlags(result) {
        this.setFlag(FLAGS.Z, result === 0);
        this.setFlag(FLAGS.N, result < 0);
    }
}
