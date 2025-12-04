import * as fs from "fs";
import * as path from "path";
import Parser from "./parser";
import { evaluate } from "./runtime/interpreter";
import Environment, { createGlobalEnv } from "./runtime/environment";
import { RuntimeVal, NumberVal, NullVal } from "./runtime/values";

// Uzmi argument iz komandne linije
const args = process.argv.slice(2);

if (args.length === 0) {
  // REPL mode - interaktivni mod
  console.log("🚀 DABOME REPL v0.5");
  console.log("Unesi kod ili 'izlaz' za izlaz.\n");
  
  const parser = new Parser();
  const env = createGlobalEnv();
  
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = () => {
    rl.question("dabome> ", (input: string) => {
      if (input.trim() === "izlaz" || input.trim() === "exit") {
        console.log("Doviđenja! 👋");
        rl.close();
        return;
      }

      try {
        const program = parser.produceAST(input);
        const result = evaluate(program, env);
        
        if (result.type === "number") {
          console.log((result as NumberVal).value);
        } else if (result.type === "null") {
          // Ne prikazuj null
        } else if (result.type === "function") {
          console.log("[Function]");
        }
      } catch (e) {
        console.error("Greška:", e);
      }

      prompt();
    });
  };

  prompt();
} else {
  // File mode - pokreni .dab fajl
  const filePath = args[0]!;
  
  // Proveri ekstenziju
  if (!filePath.endsWith(".dab")) {
    console.error("❌ Greška: Dabome može da izvršava samo .dab fajlove!");
    process.exit(1);
  }

  // Proveri da li fajl postoji
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Greška: Fajl '${absolutePath}' ne postoji!`);
    process.exit(1);
  }

  // Učitaj i izvrši fajl
  const sourceCode = fs.readFileSync(absolutePath, "utf-8");
  
  console.log(`🚀 Izvršavam: ${path.basename(absolutePath)}\n`);
  console.log("-".repeat(40));

  const parser = new Parser();
  const env = createGlobalEnv();

  try {
    const program = parser.produceAST(sourceCode);
    evaluate(program, env);
    console.log("-".repeat(40));
    console.log("\n✅ Dabome! Program uspešno izvršen.");
  } catch (e) {
    console.error("\n❌ Greška pri izvršavanju:", e);
    process.exit(1);
  }
}