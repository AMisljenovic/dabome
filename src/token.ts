// Tipovi tokena koje naš jezik prepoznaje
export enum TokenType {
  // Literali
  Number,
  String,
  Identifier, // Imena varijabli i funkcija

  // Ključne reči
  Let,
  Fn,
  If,
  Else,
  Return,
  While,
  For,

  // Operatori i Interpunkcija
  BinaryOperator, // +, -, *, /
  Equals,         // =
  OpenParen,      // (
  CloseParen,     // )
  OpenBrace,      // {
  CloseBrace,     // }
  Comma,          // ,
  EOF,            // End Of File
}

// Struktura jednog tokena
export interface Token {
  value: string; // Stvarna vrednost, npr "10", "x", "+"
  type: TokenType;
}

// Pomoćna funkcija za pravljenje tokena
export function token(value: string, type: TokenType): Token {
  return { value, type };
}