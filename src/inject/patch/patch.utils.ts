export function makeDescriptorPatch<T, K extends keyof T>(
  objectIn: T,
  objectInProperty: K,
  {
    get: {
      patch: getPatch,
      loggerBefore: getLoggerBefore,
      loggerAfter: getLoggerAfter,
    } = {},
    set: {
      patch: setPatch,
      loggerBefore: setLoggerBefore,
      loggerAfter: setLoggerAfter,
    } = {},
  }: {
    get?: {
      patch?: boolean;
      loggerBefore?: (target: object) => unknown;
      loggerAfter?: (result: void, target: object) => unknown;
    };
    set?: {
      patch?: boolean;
      loggerBefore?: (target: object, value: T[K]) => unknown;
      loggerAfter?: (result: void, target: object, value: T[K]) => unknown;
    };
  },
) {
  getPatch = getPatch ?? Boolean(getLoggerBefore || getLoggerAfter);
  setPatch = setPatch ?? Boolean(setLoggerBefore || setLoggerAfter);
  const isAtLeastOnePatch = setPatch;
  if (isAtLeastOnePatch) {
    const descriptor = Object.getOwnPropertyDescriptor(
      objectIn,
      objectInProperty,
    );
    if (typeof descriptor.value === 'function') {
      throw new Error(
        `Please use makePropertyPatch() instead for ${String(objectInProperty)}`,
      );
    }
    Object.defineProperty(objectIn, objectInProperty, {
      ...descriptor,
      get:
        descriptor.get && getPatch
          ? function get() {
              getLoggerBefore?.(this);
              const result = descriptor.get.call(this);
              getLoggerAfter?.(result, this);
              return result;
            }
          : descriptor.get,
      set:
        descriptor.set && setPatch
          ? function set(value) {
              setLoggerBefore?.(this, value);
              const result = descriptor.set.call(this, value);
              setLoggerAfter?.(result, this, value);
              return result;
            }
          : descriptor.set,
    });
  }
}

export function makePropertyPatch<
  T,
  K extends keyof T,
  ParametersT = T[K] extends (...args: any) => any ? Parameters<T[K]> : any[],
  ResultT = T[K] extends (...args: any) => any ? ReturnType<T[K]> : any,
>(
  objectIn: T,
  objectInProperty: K,
  {
    apply: {
      patch: applyPatch,
      loggerBefore: applyLoggerBefore,
      loggerAfter: applyLoggerAfter,
    } = {},
    set: {
      patch: setPatch,
      loggerBefore: setLoggerBefore,
      loggerAfter: setLoggerAfter,
    } = {},
  }: {
    apply?: {
      patch?: boolean;
      loggerBefore?: (
        target: object,
        thisArgument: T,
        argumentsList: ParametersT,
      ) => unknown;
      loggerAfter?: (
        result: ResultT,
        target: object,
        thisArgument: T,
        argumentsList: ParametersT,
      ) => unknown;
    };
    set?: {
      patch?: boolean;
      loggerBefore?: (
        target: object,
        propertyKey: string | symbol,
        value: any,
        receiver: any,
      ) => unknown;
      loggerAfter?: (
        result: boolean,
        target: object,
        propertyKey: string | symbol,
        value: any,
        receiver: any,
      ) => unknown;
    };
  } = {},
) {
  applyPatch = applyPatch ?? Boolean(applyLoggerBefore || applyLoggerAfter);
  setPatch = setPatch ?? Boolean(setLoggerBefore || setLoggerAfter);
  const isAtLeastOnePatch = applyPatch || setPatch;
  if (isAtLeastOnePatch) {
    objectIn[objectInProperty] = new Proxy(
      objectIn[objectInProperty] as object,
      {
        apply: applyPatch
          ? (target, thisArgument, argumentsList) => {
              applyLoggerBefore?.(
                target,
                thisArgument,
                argumentsList as ParametersT,
              );
              const result = Reflect.apply(
                target as Function,
                thisArgument,
                argumentsList,
              );
              applyLoggerAfter?.(
                result,
                target,
                thisArgument,
                argumentsList as ParametersT,
              );
              return result;
            }
          : undefined,
        set: setPatch
          ? (target, propertyKey, value, receiver) => {
              setLoggerBefore?.(target, propertyKey, value, receiver);
              const result = Reflect.set(target, propertyKey, value, receiver);
              setLoggerAfter?.(result, target, propertyKey, value, receiver);
              return result;
            }
          : undefined,
      },
    ) as T[K];
  }
}
