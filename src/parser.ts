// src/parser.ts
import { 
  Stmt, Program, Expr, BinaryExpr, NumericLiteral, Identifier,
  VarDeclaration, AssignmentExpr, FunctionDeclaration, CallExpr,
  WhileStmt, ForStmt
} from "./ast.ts";

import { Token, TokenType } from "./token.ts";
import { tokenize } from "./lexer.ts";

export default class Parser {
  private tokens: Token[] = [];

  // --- Pomoćne metode ---

  // Da li smo stigli do kraja fajla?
  private not_eof(): boolean {
    return this.tokens[0]!.type != TokenType.EOF;
  }

  // Vraća trenutni token
  private at() {
    return this.tokens[0];
  }

  // "Jede" trenutni token i prelazi na sledeći
  private eat() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }
  
  // Očekuje specifičan token, inače baca grešku
  // (Koristićemo kasnije za zagrade)
  private expect(type: TokenType, err: string) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.error("Parser Error:\n", err, prev, " - Ocekivano: ", type);
      Deno.exit(1);
    }
    return prev;
  }

  // --- Glavna logika ---

  public produceAST(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    
    const program: Program = {
      kind: "Program",
      body: [],
    };

    // Parsiraj dok ne stigneš do kraja fajla
    while (this.not_eof()) {
      program.body.push(this.parse_stmt());
    }

    return program;
  }

  // Obrada izjava
  private parse_stmt(): Stmt {
    // Ako je 'let', parsiraj deklaraciju varijable
    switch (this.at()!.type) {
      case TokenType.Let:
        return this.parse_var_declaration();
      case TokenType.Fn:
        return this.parse_fn_declaration();
      case TokenType.While:
        return this.parse_while_stmt();
      case TokenType.For:
        return this.parse_for_stmt();
      default:
        return this.parse_expr();
    }
  }

  // Parsira: fn name(a, b) { ... }
  private parse_fn_declaration(): Stmt {
    this.eat(); // pojedi 'fn' keyword
    
    const name = this.expect(
      TokenType.Identifier,
      "Očekivano ime funkcije posle 'fn'."
    ).value;

    const args = this.parse_args();
    const params: string[] = [];

    for (const arg of args) {
      if (arg.kind !== "Identifier") {
        console.error("Parametri funkcije moraju biti identifieri.");
        Deno.exit(1);
      }
      params.push((arg as Identifier).symbol);
    }

    this.expect(TokenType.OpenBrace, "Očekivano '{' posle parametara funkcije.");

    const body: Stmt[] = [];
    while (this.at()!.type !== TokenType.EOF && this.at()!.type !== TokenType.CloseBrace) {
      body.push(this.parse_stmt());
    }

    this.expect(TokenType.CloseBrace, "Očekivano '}' na kraju tela funkcije.");

    return {
      kind: "FunctionDeclaration",
      name,
      parameters: params,
      body,
    } as FunctionDeclaration;
  }

  // Parsira: while (uslov) { ... }
  private parse_while_stmt(): Stmt {
    this.eat(); // pojedi 'while'
    
    this.expect(TokenType.OpenParen, "Očekivano '(' posle 'while'.");
    const condition = this.parse_expr();
    this.expect(TokenType.CloseParen, "Očekivano ')' posle uslova.");

    this.expect(TokenType.OpenBrace, "Očekivano '{' za telo while petlje.");
    
    const body: Stmt[] = [];
    while (this.at()!.type !== TokenType.EOF && this.at()!.type !== TokenType.CloseBrace) {
      body.push(this.parse_stmt());
    }
    
    this.expect(TokenType.CloseBrace, "Očekivano '}' na kraju while petlje.");

    return {
      kind: "WhileStmt",
      condition,
      body,
    } as WhileStmt;
  }

  // Parsira: for (init; condition; update) { ... }
  private parse_for_stmt(): Stmt {
    this.eat(); // pojedi 'for'
    
    this.expect(TokenType.OpenParen, "Očekivano '(' posle 'for'.");

    // Init (može biti let x = 0 ili samo izraz ili ništa)
    let init: Stmt | null = null;
    if (this.at()!.type === TokenType.Let) {
      init = this.parse_var_declaration();
    } else if (this.at()!.type !== TokenType.Comma) {
      init = this.parse_expr();
    }
    this.expect(TokenType.Comma, "Očekivano ',' posle init dela for petlje.");

    // Condition
    let condition: Expr | null = null;
    if (this.at()!.type !== TokenType.Comma) {
      condition = this.parse_expr();
    }
    this.expect(TokenType.Comma, "Očekivano ',' posle uslova for petlje.");

    // Update
    let update: Expr | null = null;
    if (this.at()!.type !== TokenType.CloseParen) {
      update = this.parse_expr();
    }
    this.expect(TokenType.CloseParen, "Očekivano ')' posle for izraza.");

    this.expect(TokenType.OpenBrace, "Očekivano '{' za telo for petlje.");
    
    const body: Stmt[] = [];
    while (this.at()!.type !== TokenType.EOF && this.at()!.type !== TokenType.CloseBrace) {
      body.push(this.parse_stmt());
    }
    
    this.expect(TokenType.CloseBrace, "Očekivano '}' na kraju for petlje.");

    return {
      kind: "ForStmt",
      init,
      condition,
      update,
      body,
    } as ForStmt;
  }

  // Parsira: let x = 10 ili let x
  private parse_var_declaration(): Stmt {
    this.eat(); // pojedi 'let' keyword
    
    const identifier = this.expect(
      TokenType.Identifier,
      "Očekivano ime varijable posle 'let'."
    ).value;

    // Ako nema '=', varijabla je deklarisana bez vrednosti
    if (this.at()!.type != TokenType.Equals) {
      return {
        kind: "VarDeclaration",
        identifier,
      } as VarDeclaration;
    }

    this.eat(); // pojedi '='
    
    const declaration = {
      kind: "VarDeclaration",
      identifier,
      value: this.parse_expr(),
    } as VarDeclaration;

    return declaration;
  }

  // Obrada izraza
  private parse_expr(): Expr {
    return this.parse_assignment_expr();
  }

  // Parsira dodelu: x = 10
  private parse_assignment_expr(): Expr {
    const left = this.parse_comparison_expr();

    if (this.at()!.type == TokenType.Equals) {
      this.eat(); // pojedi '='
      const value = this.parse_assignment_expr(); // Rekurzivno za x = y = 10
      return {
        kind: "AssignmentExpr",
        assigne: left,
        value,
      } as AssignmentExpr;
    }

    return left;
  }

  // Parsira poređenje: <, >
  private parse_comparison_expr(): Expr {
    let left = this.parse_additive_expr();

    while (this.at()!.value == "<" || this.at()!.value == ">") {
      const operator = this.eat().value;
      const right = this.parse_additive_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  // Redosled operacija: 1. Sabiranje/Oduzimanje (Najniži prioritet)
  private parse_additive_expr(): Expr {
    let left = this.parse_multiplicative_expr();

    // Dok god imamo + ili -, nastavljamo da gradimo stablo
    while (this.at()!.value == "+" || this.at()!.value == "-") {
      const operator = this.eat().value;
      const right = this.parse_multiplicative_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  // Redosled operacija: 2. Množenje/Deljenje (Viši prioritet)
  private parse_multiplicative_expr(): Expr {
    let left = this.parse_call_expr();

    // Dok god imamo *, / ili %, nastavljamo da gradimo stablo
    while (this.at()!.value == "*" || this.at()!.value == "/" || this.at()!.value == "%") {
      const operator = this.eat().value;
      const right = this.parse_call_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  // Parsira poziv funkcije: foo(x, y)
  private parse_call_expr(): Expr {
    const member = this.parse_primary_expr();

    if (this.at()!.type == TokenType.OpenParen) {
      return this.parse_call_member_expr(member);
    }

    return member;
  }

  private parse_call_member_expr(caller: Expr): Expr {
    let callExpr: Expr = {
      kind: "CallExpr",
      caller,
      args: this.parse_args(),
    } as CallExpr;

    // Za ulančane pozive: foo()()
    if (this.at()!.type == TokenType.OpenParen) {
      callExpr = this.parse_call_member_expr(callExpr);
    }

    return callExpr;
  }

  // Parsira argumente: (a, b, c)
  private parse_args(): Expr[] {
    this.expect(TokenType.OpenParen, "Očekivano '('.");
    const args = this.at()!.type == TokenType.CloseParen 
      ? [] 
      : this.parse_args_list();
    
    this.expect(TokenType.CloseParen, "Nedostaje ')' posle argumenata.");
    return args;
  }

  private parse_args_list(): Expr[] {
    const args = [this.parse_assignment_expr()];

    while (this.at()!.type == TokenType.Comma && this.eat()) {
      args.push(this.parse_assignment_expr());
    }

    return args;
  }

  // Najviši prioritet: Brojevi, Zagrade, Varijable
  private parse_primary_expr(): Expr {
    const tk = this.at()!.type;

    switch (tk) {
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;
      
      case TokenType.Number:
        return { 
          kind: "NumericLiteral", 
          value: parseFloat(this.eat().value) 
        } as NumericLiteral;

      case TokenType.OpenParen:
        this.eat(); // pojedi '('
        const value = this.parse_expr();
        this.expect(TokenType.CloseParen, "Neocekivan token naspram '('. Nedostaje ')'"); // očekuj ')'
        return value;

      default:
        console.error("Neocekivan token u parseru:", this.at());
        Deno.exit(1);
    }
  }
}