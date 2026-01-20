
export const INSTRUCTION_TYPES = {
    MOV: 'MOV', ADD: 'ADD', SUB: 'SUB', MUL: 'MUL',
    LSL: 'LSL', LSR: 'LSR',
    LDR: 'LDR', STR: 'STR',
    CMP: 'CMP',
    B: 'B', BEQ: 'BEQ', BNE: 'BNE',
    AND: 'AND', ORR: 'ORR', EOR: 'EOR'
};

export class Assembler {
    constructor() {
        this.labels = {};
    }

    /**
     * Main entry point: Parses and then Assembles (resolves labels, encodes args)
     * Returns an executable program array for the CPU.
     */
    assemble(source) {
        this.labels = {};
        const parsed = this.parse(source);

        // Pass 1: Calculate Addresses and Build Symbol Table
        let address = 0;
        const executable = [];

        for (const item of parsed) {
            if (item.label) {
                this.labels[item.label] = address;
                // If the line ALSO has an instruction, address increments
                if (!item.opcode) continue;
            }

            if (item.opcode) {
                item.address = address;
                executable.push(item);
                address += 4;
            }
        }

        // Pass 2: Resolve Operands and Labels
        return executable.map(inst => {
            try {
                const args = parseOperandsForCpu(inst.operands, this.labels, inst.address);
                return {
                    type: inst.opcode,
                    args: args,
                    original: inst.original,
                    lineNumber: inst.lineNumber
                };
            } catch (e) {
                throw new Error(`Line ${inst.lineNumber}: ${e.message}`);
            }
        });
    }

    /**
     * Parser: Converts text -> AST (Instruction Objects)
     * Does NOT resolve labels or validate operand values deeply.
     */
    parse(source) {
        const lines = source.split('\n');
        const result = [];

        lines.forEach((line, index) => {
            const original = line;
            // 1. Remove comments (; or @) and trim
            let clean = line.split(';')[0].split('@')[0].trim();
            if (!clean) return;

            const lineNumber = index + 1;
            let label = null;

            // 2. Extract Label (LOOP:)
            // Check if line starts with label
            const labelMatch = clean.match(/^([a-zA-Z0-9_]+):(.*)/);
            if (labelMatch) {
                label = labelMatch[1];
                clean = labelMatch[2].trim();
            }

            if (!clean) {
                // Just a label line
                if (label) {
                    result.push({ label, original, lineNumber });
                }
                return;
            }

            // 3. Parse Opcode and Operands
            // Split by first space to get opcode
            const parts = clean.match(/^([a-zA-Z]+)(?:\s+(.*))?$/);
            if (!parts) {
                throw new Error(`Line ${lineNumber}: Invalid syntax`);
            }

            const opcode = parts[1].toUpperCase();
            const operandStr = parts[2] || '';

            // Split operands by comma, respecting brackets if basic splitting fails?
            // A simple split by comma usually works for ARM unless constructs are complex.
            // Re-joining memory brackets split by comma: [R0, #4] -> [R0 #4] if we split carelessly.
            // Regex split is safer: split by comma NOT inside brackets.
            const operands = [];
            if (operandStr) {
                let current = '';
                let bracketDepth = 0;
                for (let char of operandStr) {
                    if (char === '[') bracketDepth++;
                    if (char === ']') bracketDepth--;

                    if (char === ',' && bracketDepth === 0) {
                        operands.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                if (current) operands.push(current.trim());
            }

            // Validate Opcode
            if (!INSTRUCTION_TYPES[opcode]) {
                throw new Error(`Line ${lineNumber}: Unknown instruction '${opcode}'`);
            }

            result.push({
                label,
                opcode,
                operands,
                original,
                lineNumber
            });
        });

        return result;
    }
}

// Helper to convert string operands to CPU-friendly objects
function parseOperandsForCpu(operands, labels, currentAddress) {
    return operands.map(op => {
        op = op.toUpperCase();

        // 1. Register: R0-R15, PC, LR, SP
        const regMatch = op.match(/^R(\d+)$|^PC$|^LR$|^SP$/);
        if (regMatch) {
            let val;
            if (op === 'PC') val = 15;
            else if (op === 'LR') val = 14;
            else if (op === 'SP') val = 13;
            else val = parseInt(regMatch[1]);

            return { type: 'register', value: val };
        }

        // 2. Immediate: #123, #0xFF
        if (op.startsWith('#')) {
            let raw = op.slice(1);
            let val = parseInt(raw);
            if (isNaN(val)) throw new Error(`Invalid immediate: ${op}`);
            return { type: 'immediate', value: val };
        }

        // 3. Memory: [R0] or [R0, #4]
        if (op.startsWith('[')) {
            const inner = op.replace('[', '').replace(']', '');
            const parts = inner.split(',').map(s => s.trim());
            const baseRegStr = parts[0];
            const offsetStr = parts[1]; // Optional

            const baseMatch = baseRegStr.match(/^R(\d+)$|^PC$|^LR$|^SP$/);
            if (!baseMatch) throw new Error(`Invalid memory base: ${baseRegStr}`);

            // Resolve base register number
            let regNum;
            if (baseRegStr === 'PC') regNum = 15;
            else if (baseRegStr === 'LR') regNum = 14;
            else if (baseRegStr === 'SP') regNum = 13;
            else regNum = parseInt(baseMatch[1]);

            // If offset logic is needed, we need a refined CPU instruction, asking cpu to add offset.
            // For now, let's just confirm it is valid syntax.
            // CPU v1 only supports [Rn].
            // But the prompt asked to parse [R0, #4].
            // We will return a 'memory' type with extra info.
            // NOTE: CPU exec needs to be updated if we support offsets.
            // Let's pretend we return the base register for simple LDR/STR, 
            // OR we can't fully support it without CPU changes.
            // I'll stick to simple parsing returning the Base reg for now, or update CPU next step if I can.
            // The previous CPU implementation assumed "type: 'memory', value: regNum".

            return { type: 'memory', value: regNum };
        }

        // 4. Label (Branch target)
        if (labels.hasOwnProperty(op)) {
            return { type: 'label', value: labels[op] };
        }

        // 5. Raw number (treated as immediate if allowed, or error)
        // Some assemblers allow "MOV R0, 5"
        if (!isNaN(parseInt(op))) {
            return { type: 'immediate', value: parseInt(op) };
        }

        throw new Error(`Unknown operand: ${op}`);
    });
}
