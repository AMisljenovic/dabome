// src/runtime/values.ts

import { Stmt } from "../ast";
import Environment from "./environment";

// Tipovi vrednosti koje naš jezik može da ima u runtime-u
export type ValueType = "null" | "number" | "function" | "native-fn";

// Bazni interfejs za sve runtime vrednosti
export interface RuntimeVal {
  type: ValueType;
}

// Null vrednost - kad nešto nema vrednost
export interface NullVal extends RuntimeVal {
  type: "null";
  value: null;
}

// Numerička vrednost
export interface NumberVal extends RuntimeVal {
  type: "number";
  value: number;
}

// Tip za native funkcije (ugrađene u interpreter)
export type FunctionCall = (args: RuntimeVal[], env: Environment) => RuntimeVal;

// Native funkcija (npr. print, time)
export interface NativeFnVal extends RuntimeVal {
  type: "native-fn";
  call: FunctionCall;
}

// Korisnički definisana funkcija
export interface FunctionVal extends RuntimeVal {
  type: "function";
  name: string;
  parameters: string[];
  declarationEnv: Environment;  // Environment gde je funkcija definisana (closure)
  body: Stmt[];
}

// Pomoćne funkcije za kreiranje vrednosti
export function MK_NULL(): NullVal {
  return { type: "null", value: null };
}

export function MK_NUMBER(n: number = 0): NumberVal {
  return { type: "number", value: n };
}

export function MK_NATIVE_FN(call: FunctionCall): NativeFnVal {
  return { type: "native-fn", call };
}
