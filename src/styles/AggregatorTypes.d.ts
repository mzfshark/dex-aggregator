export interface AggregatorContract {
    getBestAmountsOutOnUniswapForks: (
      path: string[],
      amountIn: string
    ) => Promise<[string, string]>;
  }
  
  export interface Contracts {
    aggregator: AggregatorContract;
  }
  