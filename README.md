# Dabome Programming Language (`.dab`)

> **"Dabome"** (Serbian: *Of course / Naturally / Indeed*)

**Dabome** is a custom, interpreted, functional-style programming language built from scratch in TypeScript. It explores the fundamentals of compiler design, featuring a hand-written lexer and a recursive descent parser.

It's designed to be logical, affirmative, and straight to the point. Does it work? **Dabome.**

## 🚀 Features (Current Status)

- [x] **Lexer (Tokenizer):** Handles multi-digit numbers, identifiers, operators, keywords, and grouping.
- [x] **Parser:** Recursive Descent Parser that generates an Abstract Syntax Tree (AST).
- [x] **Arithmetic Operations:** Full support for `+`, `-`, `*`, `/`, `%` with correct **Order of Operations** (PEMDAS).
- [x] **AST Visualization:** Outputs a structured JSON representation of the code.
- [ ] **Interpreter:** (Coming Soon) Tree-walk evaluation.
- [ ] **Variables & Environment:** `let` binding and scopes.
- [ ] **Functions:** First-class functions with implicit returns.

## 🛠️ Tech Stack

* **Host Language:** TypeScript
* **Runtime:** Node.js
* **Architecture:** Tree-walk Interpreter

## 📦 Installation & Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/AMisljenovic/dabome.git
cd dabome
npm install
```

## 🏃 Usage

Currently, you can run the Parser to see the AST generation.

1.  Edit `src/main.ts` with your code.
2.  Run the project:

```bash
npx ts-node src/main.ts
```

## 🧪 Examples & Capabilities

### 1. Arithmetic & Precedence (Working ✅)
Dabome understands that multiplication has higher priority than addition, and respects parentheses.

**Input:**
```javascript
// Complex math expression
10 + 5 * 2 + (100 - 50)
```

**Output (AST Structure):**
The parser correctly structures this as `(10 + (5 * 2)) + (100 - 50)`.

```json
{
  "kind": "Program",
  "body": [
    {
      "kind": "BinaryExpr",
      "operator": "+",
      "left": {
        "kind": "BinaryExpr",
        "operator": "+",
        "left": { "kind": "NumericLiteral", "value": 10 },
        "right": {
          "kind": "BinaryExpr", // 5 * 2 is grouped here
          "operator": "*",
          "left": { "kind": "NumericLiteral", "value": 5 },
          "right": { "kind": "NumericLiteral", "value": 2 }
        }
      },
      "right": {
        "kind": "BinaryExpr", // (100 - 50) is grouped here
        "operator": "-",
        "left": { "kind": "NumericLiteral", "value": 100 },
        "right": { "kind": "NumericLiteral", "value": 50 }
      }
    }
  ]
}
```

### 2. The "Dabome" Syntax Goals (Planned 🚧)
The goal is to support a clean, functional syntax where everything is an expression.

**Variables & Logic:**
```javascript
let x = 45
let y = 10

// 'If' is an expression that returns a value
let rezultat = if (x > y) {
  x
} else {
  y
}
```

**Functions:**
```javascript
// Functions are first-class citizens
let saberi = fn(a, b) {
  a + b  // Implicit return
}

print(saberi(10, 20))
```

## 🤝 Contribution

This is an educational project. Feel free to fork it and try implementing new features like loops or error handling!