
export class Memory {
    constructor(size = 1024) {
        this.buffer = new ArrayBuffer(size);
        this.view = new DataView(this.buffer);
        this.u8 = new Uint8Array(this.buffer);
    }

    reset() {
        this.u8.fill(0);
    }

    readByte(address) {
        this.checkAddress(address);
        return this.view.getUint8(address);
    }

    readWord(address) {
        this.checkAddress(address, 4);
        return this.view.getInt32(address, true); // Little endian
    }

    writeByte(address, value) {
        this.checkAddress(address);
        this.view.setUint8(address, value);
    }

    writeWord(address, value) {
        this.checkAddress(address, 4);
        this.view.setInt32(address, value, true); // Little endian
    }

    checkAddress(address, size = 1) {
        if (address < 0 || address + size > this.buffer.byteLength) {
            throw new Error(`Memory access violation at address 0x${address.toString(16)}`);
        }
    }
}
