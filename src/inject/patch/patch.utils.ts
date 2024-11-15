export function makeMethodPatch<
  T extends object,
  M extends keyof T,
  ParT = T[M] extends (...args: any) => any ? Parameters<T[M]> : any[],
  ResT = T[M] extends (...args: any) => any ? ReturnType<T[M]> : any,
>(
  obj: T,
  method: M,
  {
    apply: { loggerBefore: applyLoggerBefore, loggerAfter: applyLoggerAfter },
  }: {
    apply: {
      loggerBefore?: (target: object, thisArg: T, argArray: ParT) => unknown;
      loggerAfter?: (
        result: ResT,
        target: object,
        thisArg: T,
        argArray: ParT,
      ) => unknown;
    };
  } = { apply: {} },
) {
  obj[method] = new Proxy(obj[method] as object, {
    // construct(Target, args) {
    //   console.debug(`patch constructor new ${String(method)}`);
    //   const newTarget = new Target(...args);
    //   return newTarget;
    // },
    apply(target, thisArg, args) {
      applyLoggerBefore?.(target, thisArg, args as ParT);
      const result = Reflect.apply(target as Function, thisArg, args);
      applyLoggerAfter?.(result, target, thisArg, args as ParT);
      return result;
    },
  }) as T[M];
}
