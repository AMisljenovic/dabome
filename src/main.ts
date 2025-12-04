import * as path from "https://deno.land/std@0.208.0/path/mod.ts";
import Parser from "./parser.ts";
import { evaluate } from "./runtime/interpreter.ts";
import { createGlobalEnv } from "./runtime/environment.ts";
import { RuntimeVal, NumberVal, StringVal } from "./runtime/values.ts";

// Uzmi argument iz komandne linije
const args = Deno.args;

if (args.length === 0) {
  // REPL mode - interaktivni mod
  console.log("🚀 DABOME REPL v0.6 (Deno)");
  console.log("Unesi kod ili 'izlaz' za izlaz.\n");
  
  const parser = new Parser();
  const env = createGlobalEnv();
  
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  while (true) {
    // Prikaži prompt
    await Deno.stdout.write(encoder.encode("dabome> "));
    
    // Čitaj liniju
    const buf = new Uint8Array(1024);
    const n = await Deno.stdin.read(buf);
    
    if (n === null) break;
    
    const input = decoder.decode(buf.subarray(0, n)).trim();
    
    if (input === "izlaz" || input === "exit") {
      console.log("Doviđenja! 👋");
      break;
    }

    if (input === "") continue;

    try {
      const program = parser.produceAST(input);
      const result = evaluate(program, env);
      
      if (result.type === "number") {
        console.log((result as NumberVal).value);
      } else if (result.type === "string") {
        console.log(`"${(result as StringVal).value}"`);
      } else if (result.type === "function") {
        console.log("[Function]");
      }
    } catch (e) {
      console.error("Greška:", e);
    }
  }
} else {
  // File mode - pokreni .dab fajl
  const filePath = args[0]!;
  
  // Proveri ekstenziju
  if (!filePath.endsWith(".dab")) {
    console.error("❌ Greška: Dabome može da izvršava samo .dab fajlove!");
    Deno.exit(1);
  }

  // Proveri da li fajl postoji
  const absolutePath = path.resolve(filePath);
  
  try {
    // Učitaj i izvrši fajl
    const sourceCode = await Deno.readTextFile(absolutePath);
    
    console.log(`🚀 Izvršavam: ${path.basename(absolutePath)}\n`);
    console.log("-".repeat(40));

    const parser = new Parser();
    const env = createGlobalEnv();

    const program = parser.produceAST(sourceCode);
    evaluate(program, env);
    
    console.log("-".repeat(40));
    console.log("\n✅ Dabome! Program uspešno izvršen.");
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      console.error(`❌ Greška: Fajl '${absolutePath}' ne postoji!`);
    } else {
      console.error("\n❌ Greška pri izvršavanju:", e);
    }
    Deno.exit(1);
  }
}