// src/ast.ts

// -----------------------------------------------------------
// Tipovi čvorova u našem stablu
// -----------------------------------------------------------
export type NodeType = 
  | "Program" 
  | "VarDeclaration"
  | "FunctionDeclaration"
  | "WhileStmt"
  | "ForStmt"
  | "AssignmentExpr"
  | "CallExpr"
  | "NumericLiteral" 
  | "Identifier" 
  | "BinaryExpr";

// -----------------------------------------------------------
// Statement (Izjava)
// Izjava je deo koda koji se izvršava ali ne mora da vrati vrednost
// (mada u funkcionalnim jezicima skoro sve vraća vrednost).
// -----------------------------------------------------------
export interface Stmt {
  kind: NodeType;
}

// Koren stabla - ceo program je jedan niz izjava
export interface Program extends Stmt {
  kind: "Program";
  body: Stmt[];
}

// Deklaracija varijable: let x = 10
export interface VarDeclaration extends Stmt {
  kind: "VarDeclaration";
  identifier: string;
  value?: Expr; // Opciono - može biti let x; bez vrednosti
}

// Deklaracija funkcije: fn add(a, b) { a + b }
export interface FunctionDeclaration extends Stmt {
  kind: "FunctionDeclaration";
  name: string;
  parameters: string[];
  body: Stmt[];
}

// While petlja: while (uslov) { ... }
export interface WhileStmt extends Stmt {
  kind: "WhileStmt";
  condition: Expr;
  body: Stmt[];
}

// For petlja: for (init; condition; update) { ... }
export interface ForStmt extends Stmt {
  kind: "ForStmt";
  init: Stmt | null;
  condition: Expr | null;
  update: Expr | null;
  body: Stmt[];
}

// -----------------------------------------------------------
// Expression (Izraz)
// Izraz je deo koda koji UVEK rezultuje nekom vrednošću (npr 5 + 5).
// -----------------------------------------------------------
export interface Expr extends Stmt {}

// Dodela vrednosti: x = 10 (nije deklaracija, već dodela)
export interface AssignmentExpr extends Expr {
  kind: "AssignmentExpr";
  assigne: Expr;  // Kome dodeljujemo (npr. identifier)
  value: Expr;    // Šta dodeljujemo
}

// Poziv funkcije: add(1, 2)
export interface CallExpr extends Expr {
  kind: "CallExpr";
  caller: Expr;   // Funkcija koja se poziva
  args: Expr[];   // Argumenti
}

// Primer: 10 - 5
// left: 10, operator: -, right: 5
export interface BinaryExpr extends Expr {
  kind: "BinaryExpr";
  left: Expr;
  right: Expr;
  operator: string;
}

// Primer: x, y, foo
export interface Identifier extends Expr {
  kind: "Identifier";
  symbol: string;
}

// Primer: 10, 42
export interface NumericLiteral extends Expr {
  kind: "NumericLiteral";
  value: number;
}