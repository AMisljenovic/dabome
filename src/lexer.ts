// src/lexer.ts
import { Token, token, TokenType } from "./token";


// src/lexer.ts

// Da li je karakter slovo?
function isAlpha(src: string) {
  return src.toUpperCase() != src.toLowerCase();
}

// Da li je karakter broj?
function isInt(str: string) {
  const c = str.charCodeAt(0);
  const bounds: [number, number] = ['0'.charCodeAt(0), '9'.charCodeAt(0)];
  return c >= bounds[0] && c <= bounds[1];
}

// Da li je prazan prostor (space, tab, novi red)?
function isSkippable(str: string) {
  return str == " " || str == "\n" || str == "\t" || str == "\r";
}

const KEYWORDS: Record<string, TokenType> = {
  "let": TokenType.Let,
  "fn": TokenType.Fn,
  "if": TokenType.If,
  "else": TokenType.Else,
  "return": TokenType.Return,
  "while": TokenType.While,
  "for": TokenType.For,
};

export function tokenize(sourceCode: string): Token[] {
  const tokens: Token[] = [];
  // Razbijamo kod na niz karaktera radi lakše manipulacije
  const src = sourceCode.split("");

  // Vrtimo se dok imamo karaktera za obradu
  while (src.length > 0) {
    
    // 1. Prvo obrađujemo zagrade i operatore (jedan karakter)
    if (src[0] == "(") {
      tokens.push(token(src.shift()!, TokenType.OpenParen));
    } else if (src[0] == ")") {
      tokens.push(token(src.shift()!, TokenType.CloseParen));
    } else if (src[0] == "{") {
      tokens.push(token(src.shift()!, TokenType.OpenBrace));
    } else if (src[0] == "}") {
      tokens.push(token(src.shift()!, TokenType.CloseBrace));
    } else if (src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" || src[0] == "%") {
      tokens.push(token(src.shift()!, TokenType.BinaryOperator));
    } else if (src[0] == "<" || src[0] == ">") {
      tokens.push(token(src.shift()!, TokenType.BinaryOperator));
    } else if (src[0] == "=") {
      tokens.push(token(src.shift()!, TokenType.Equals));
    } else if (src[0] == ",") {
        tokens.push(token(src.shift()!, TokenType.Comma));
    } 
    
    // 2. Obrađujemo višecifrene tokene
    else {
      
      // Brojevi
      if (isInt(src[0]!)) {
        let num = "";
        while (src.length > 0 && isInt(src[0]!)) {
          num += src.shift();
        }
        tokens.push(token(num, TokenType.Number));
      } 
      
      // Slova (Identifieri i Ključne reči)
      else if (isAlpha(src[0]!)) {
        let ident = "";
        while (src.length > 0 && isAlpha(src[0]!)) {
          ident += src.shift();
        }
        
        // Provera: Da li je ovo rezervisana reč (npr "let") ili korisnička (npr "x")?
        const reserved = KEYWORDS[ident];
        if (typeof reserved == "number") {
             tokens.push(token(ident, reserved));
        } else {
             tokens.push(token(ident, TokenType.Identifier));
        }
      } 
      
      // Ignorišemo whitespace (space, tab, enter)
      else if (isSkippable(src[0]!)) {
        src.shift(); // Samo preskoči
      } 
      
      // Nepoznat karakter
      else {
        console.log("Nepoznat karakter u kodu: ", src[0]);
        src.shift(); // Ipak ga skloni da ne upadnemo u infinite loop
      }
    }
  }

  tokens.push(token("EndOfFile", TokenType.EOF));
  return tokens;
}