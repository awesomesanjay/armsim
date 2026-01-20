
export const EXAMPLES = {
    'Simple Addition': `; Add two numbers
MOV R0, #5
MOV R1, #10
ADD R2, R0, R1  ; R2 = 15
`,

    'Expression Eval': `; Evaluate R0 = 3*x + 5 (let x = 4)
MOV R1, #4      ; x = 4
MOV R2, #3
MUL R0, R1, R2  ; R0 = 12
ADD R0, R0, #5  ; R0 = 17
`,

    'Multiplication (Shifts)': `; Multiply R0 by 10 using shifts
; 10*x = 8*x + 2*x
MOV R0, #5      ; x = 5
LSL R1, R0, #3  ; R1 = x * 8 = 40
LSL R2, R0, #1  ; R2 = x * 2 = 10
ADD R0, R1, R2  ; R0 = 50
MOV R3, #0      ; Address 0
STR R0, [R3]    ; Store 50 at address 0
`,

    'Factorial': `; Calculate Factorial of 5
MOV R0, #5      ; n = 5
MOV R1, #1      ; Result
LOOP:
CMP R0, #1
BEQ END
MUL R1, R1, R0
SUB R0, R0, #1
B LOOP
END:
; Result in R1 = 120
`,

    'Even/Odd Check': `; Check if R0 is Even or Odd
MOV R0, #7
MOV R1, #1
AND R2, R0, R1  ; R2 = R0 & 1
CMP R2, #0
BEQ EVEN
; Odd case
MOV R3, #1      ; R3=1 means Odd
B DONE
EVEN:
MOV R3, #0      ; R3=0 means Even
DONE:
`,

    'Memory Test': `; Store values to Memory
MOV R0, #255    ; Value to store (0xFF)
MOV R1, #16     ; Address 16 (0x10)
STR R0, [R1]    ; Write 0xFF to 0x10

MOV R2, #0xAB   ; Value 0xAB
MOV R3, #0      ; Address 0
STR R2, [R3]    ; Write 0xAB to 0x00
`
};
