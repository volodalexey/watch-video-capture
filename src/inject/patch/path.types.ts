export type ProxyHandlerApplyP<T extends object> = Parameters<
  ProxyHandler<T>['apply']
>;
