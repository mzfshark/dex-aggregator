// src/types/AggregatorTypes.ts

import { Contract } from "ethers";

export interface AggregatorContract extends Contract {}

export type Contracts = {
  aggregator: AggregatorContract;
  dai: Contract;
  weth: Contract;
};
