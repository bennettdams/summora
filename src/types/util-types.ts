export type OmitStrict<T, K extends keyof T> = T extends unknown
  ? Pick<T, Exclude<keyof T, K>>
  : never
