// src/runtime/interpreter.ts

import { 
  RuntimeVal, NumberVal, FunctionVal, NativeFnVal,
  MK_NULL, MK_NUMBER 
} from "./values.ts";
import Environment from "./environment.ts";
import { 
  Stmt, Program, BinaryExpr, NumericLiteral, Identifier,
  VarDeclaration, AssignmentExpr, FunctionDeclaration, CallExpr,
  WhileStmt, ForStmt
} from "../ast.ts";

// Evaluira numerički literal
function eval_numeric_literal(node: NumericLiteral): NumberVal {
  return MK_NUMBER(node.value);
}

// Evaluira identifier - traži varijablu u environment-u
function eval_identifier(ident: Identifier, env: Environment): RuntimeVal {
  return env.lookupVar(ident.symbol);
}

// Evaluira binarne izraze (+, -, *, /, %)
function eval_binary_expr(binop: BinaryExpr, env: Environment): RuntimeVal {
  const leftVal = evaluate(binop.left, env);
  const rightVal = evaluate(binop.right, env);

  // Za sada podržavamo samo numeričke operacije
  if (leftVal.type === "number" && rightVal.type === "number") {
    return eval_numeric_binary_expr(
      leftVal as NumberVal, 
      rightVal as NumberVal, 
      binop.operator
    );
  }

  // Ako nisu oba broja, vraćamo null
  return MK_NULL();
}

// Računa numeričke binarne operacije
function eval_numeric_binary_expr(
  left: NumberVal, 
  right: NumberVal, 
  operator: string
): NumberVal {
  let result: number;

  switch (operator) {
    case "+":
      result = left.value + right.value;
      break;
    case "-":
      result = left.value - right.value;
      break;
    case "*":
      result = left.value * right.value;
      break;
    case "/":
      // Provera deljenja nulom
      if (right.value === 0) {
        console.error("Greška: Deljenje nulom!");
        Deno.exit(1);
      }
      result = left.value / right.value;
      break;
    case "%":
      result = left.value % right.value;
      break;
    case "<":
      result = left.value < right.value ? 1 : 0;
      break;
    case ">":
      result = left.value > right.value ? 1 : 0;
      break;
    default:
      console.error("Nepoznat operator:", operator);
      Deno.exit(1);
  }

  return MK_NUMBER(result);
}

// Evaluira program (ceo niz statement-a)
function eval_program(program: Program, env: Environment): RuntimeVal {
  let lastEvaluated: RuntimeVal = MK_NULL();

  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env);
  }

  return lastEvaluated;
}

// Evaluira deklaraciju varijable: let x = 10
function eval_var_declaration(declaration: VarDeclaration, env: Environment): RuntimeVal {
  const value = declaration.value 
    ? evaluate(declaration.value, env) 
    : MK_NULL();
  
  return env.declareVar(declaration.identifier, value);
}

// Evaluira dodelu: x = 10
function eval_assignment(node: AssignmentExpr, env: Environment): RuntimeVal {
  if (node.assigne.kind !== "Identifier") {
    console.error("Greška: Leva strana dodele mora biti varijabla.");
    Deno.exit(1);
  }

  const varname = (node.assigne as Identifier).symbol;
  return env.assignVar(varname, evaluate(node.value, env));
}

// Evaluira deklaraciju funkcije: fn add(a, b) { a + b }
function eval_function_declaration(
  declaration: FunctionDeclaration, 
  env: Environment
): RuntimeVal {
  const fn: FunctionVal = {
    type: "function",
    name: declaration.name,
    parameters: declaration.parameters,
    declarationEnv: env,
    body: declaration.body,
  };

  return env.declareVar(declaration.name, fn);
}

// Evaluira poziv funkcije: add(1, 2)
function eval_call_expr(call: CallExpr, env: Environment): RuntimeVal {
  const args = call.args.map((arg) => evaluate(arg, env));
  const fn = evaluate(call.caller, env);

  // Native funkcija
  if (fn.type === "native-fn") {
    return (fn as NativeFnVal).call(args, env);
  }

  // Korisnički definisana funkcija
  if (fn.type === "function") {
    const func = fn as FunctionVal;
    const scope = new Environment(func.declarationEnv);

    // Binduj parametre sa argumentima
    for (let i = 0; i < func.parameters.length; i++) {
      const varname = func.parameters[i]!;
      scope.declareVar(varname, args[i] ?? MK_NULL());
    }

    // Evaluiraj telo funkcije
    let result: RuntimeVal = MK_NULL();
    for (const stmt of func.body) {
      result = evaluate(stmt, scope);
    }

    return result; // Implicitni return - poslednja vrednost
  }

  console.error("Greška: Pokušaj poziva nečega što nije funkcija:", fn);
  Deno.exit(1);
}

// Evaluira while petlju
function eval_while_stmt(stmt: WhileStmt, env: Environment): RuntimeVal {
  let result: RuntimeVal = MK_NULL();

  // Dok je uslov tačan (različit od 0)
  while (isTruthy(evaluate(stmt.condition, env))) {
    // Kreiraj novi scope za svaku iteraciju
    const iterationScope = new Environment(env);
    for (const s of stmt.body) {
      result = evaluate(s, iterationScope);
    }
  }

  return result;
}

// Evaluira for petlju
function eval_for_stmt(stmt: ForStmt, env: Environment): RuntimeVal {
  // Kreiraj novi scope za for petlju (da bi let i = 0 bio lokalan)
  const scope = new Environment(env);
  let result: RuntimeVal = MK_NULL();

  // Init
  if (stmt.init) {
    evaluate(stmt.init, scope);
  }

  // Loop dok je uslov tačan
  while (stmt.condition === null || isTruthy(evaluate(stmt.condition, scope))) {
    // Kreiraj novi scope za svaku iteraciju
    const iterationScope = new Environment(scope);
    
    // Izvrši telo
    for (const s of stmt.body) {
      result = evaluate(s, iterationScope);
    }

    // Update
    if (stmt.update) {
      evaluate(stmt.update, scope);
    }
  }

  return result;
}

// Proverava da li je vrednost "truthy" (različita od 0 i null)
function isTruthy(val: RuntimeVal): boolean {
  if (val.type === "null") return false;
  if (val.type === "number") return (val as NumberVal).value !== 0;
  return true;
}

// Glavna funkcija za evaluaciju bilo kog čvora
export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return eval_numeric_literal(astNode as NumericLiteral);

    case "Identifier":
      return eval_identifier(astNode as Identifier, env);

    case "BinaryExpr":
      return eval_binary_expr(astNode as BinaryExpr, env);

    case "Program":
      return eval_program(astNode as Program, env);

    case "VarDeclaration":
      return eval_var_declaration(astNode as VarDeclaration, env);

    case "AssignmentExpr":
      return eval_assignment(astNode as AssignmentExpr, env);

    case "FunctionDeclaration":
      return eval_function_declaration(astNode as FunctionDeclaration, env);

    case "CallExpr":
      return eval_call_expr(astNode as CallExpr, env);

    case "WhileStmt":
      return eval_while_stmt(astNode as WhileStmt, env);

    case "ForStmt":
      return eval_for_stmt(astNode as ForStmt, env);

    default:
      console.error("Ovaj AST čvor još nije podržan za evaluaciju:", astNode);
      Deno.exit(1);
  }
}
