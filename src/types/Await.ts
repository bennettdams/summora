export type Await<Type> = Type extends Promise<infer Value>
  ? Await<Value>
  : Type
