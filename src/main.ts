import Parser from "./parser";

const parser = new Parser();
const program = parser.produceAST("42"); // Probaj samo broj za sad

// Koristimo JSON.stringify da lepo ispiše duboku strukturu objekta
console.log(JSON.stringify(program, null, 2));