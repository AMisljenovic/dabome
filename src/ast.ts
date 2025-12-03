// src/ast.ts

// -----------------------------------------------------------
// Tipovi čvorova u našem stablu
// -----------------------------------------------------------
export type NodeType = 
  | "Program" 
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

// -----------------------------------------------------------
// Expression (Izraz)
// Izraz je deo koda koji UVEK rezultuje nekom vrednošću (npr 5 + 5).
// -----------------------------------------------------------
export interface Expr extends Stmt {}

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