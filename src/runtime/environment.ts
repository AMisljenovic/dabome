// src/runtime/environment.ts

import { RuntimeVal, MK_NULL, MK_NUMBER, MK_NATIVE_FN, NumberVal } from "./values";

// Environment - čuva varijable i njihove vrednosti
export default class Environment {
  private parent: Environment | undefined;
  private variables: Map<string, RuntimeVal>;

  constructor(parentEnv?: Environment) {
    this.parent = parentEnv;
    this.variables = new Map();
  }

  // Deklariše novu varijablu
  public declareVar(varname: string, value: RuntimeVal): RuntimeVal {
    if (this.variables.has(varname)) {
      console.error(`Greška: Varijabla '${varname}' je već deklarisana.`);
      process.exit(1);
    }

    this.variables.set(varname, value);
    return value;
  }

  // Dodeljuje vrednost postojećoj varijabli
  public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varname);
    env.variables.set(varname, value);
    return value;
  }

  // Vraća vrednost varijable
  public lookupVar(varname: string): RuntimeVal {
    const env = this.resolve(varname);
    return env.variables.get(varname) as RuntimeVal;
  }

  // Pronalazi environment gde je varijabla definisana
  public resolve(varname: string): Environment {
    if (this.variables.has(varname)) {
      return this;
    }

    if (this.parent == undefined) {
      console.error(`Greška: Varijabla '${varname}' ne postoji.`);
      process.exit(1);
    }

    return this.parent.resolve(varname);
  }
}

// Kreira globalni environment sa ugrađenim vrednostima
export function createGlobalEnv(): Environment {
  const env = new Environment();
  
  // Ugrađene konstante
  env.declareVar("null", MK_NULL());
  env.declareVar("true", MK_NUMBER(1));   // true = 1
  env.declareVar("false", MK_NUMBER(0));  // false = 0

  // Native funkcije
  
  // print(...args) - ispisuje vrednosti
  env.declareVar("print", MK_NATIVE_FN((args, _scope) => {
    const output = args.map(arg => {
      if (arg.type === "number") return (arg as NumberVal).value;
      if (arg.type === "null") return "null";
      if (arg.type === "function") return "[Function]";
      return arg;
    });
    console.log(...output);
    return MK_NULL();
  }));

  // time() - vraća trenutno vreme u ms
  env.declareVar("time", MK_NATIVE_FN((_args, _scope) => {
    return MK_NUMBER(Date.now());
  }));
  
  return env;
}
