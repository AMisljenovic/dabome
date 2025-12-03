// src/parser.ts
import { 
  Stmt, Program, Expr, NumericLiteral, Identifier 
} from "./ast";

import { Token, TokenType } from "./token";
import { tokenize } from "./lexer";

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
  private expect(type: TokenType, err: any) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.error("Parser Error:\n", err, prev, " - Ocekivano: ", type);
      process.exit(1);
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
    // Za sada nemamo variable declarations (let), samo izraze
    return this.parse_expr();
  }

  // Obrada izraza
  private parse_expr(): Expr {
    return this.parse_additive_expr();
  }

  // Redosled operacija: 1. Sabiranje/Oduzimanje (Najniži prioritet)
  // (Implementiraćemo ovo odmah u sledećem koraku)
  private parse_additive_expr(): Expr {
    return this.parse_multiplicative_expr();
  }

  // Redosled operacija: 2. Množenje/Deljenje (Viši prioritet)
  private parse_multiplicative_expr(): Expr {
    return this.parse_primary_expr();
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
        process.exit(1);
        return {} as Expr;
    }
  }
}