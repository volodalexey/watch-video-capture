import {
  QueryFunction,
  QueryFunctionContext,
  QueryKey,
} from '@tanstack/react-query';

export function WithAbortCheck<
  TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = never,
>(queryFn: QueryFunction<TQueryFnData, TQueryKey, TPageParam>) {
  return async (params: QueryFunctionContext<TQueryKey, TPageParam>) => {
    const { signal } = params;
    let aborted = false;
    signal?.addEventListener('abort', () => {
      aborted = true;
    });
    // run as macrotask for all the same queryFn to be aborted
    // this prevents access to the storage multiple times
    await new Promise((resolve) => setTimeout(resolve));
    if (aborted) {
      return;
    }
    const res = await queryFn(params);
    if (aborted) {
      return;
    }
    return res;
  };
}
