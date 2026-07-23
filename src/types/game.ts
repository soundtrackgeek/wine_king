export type WineStage = "must" | "cellar" | "bottled";

export interface Estate {
  name: string;
  cash: number;
  reputation: number;
  revenue: number;
  expenses: number;
  actionsRemaining: number;
}

export interface Rival {
  name: string;
  estateValue: number;
  reputation: number;
  pressure: number;
}

export interface VineyardPlot {
  id: string;
  name: string;
  variety: string;
  hectares: number;
  health: number;
  ripeness: number;
  yieldTons: number;
  harvested: boolean;
}

export interface Facility {
  id: string;
  name: string;
  efficiency: number;
  status: string;
}

export interface WineBatch {
  id: string;
  name: string;
  variety: string;
  stage: WineStage;
  quantity: number;
  quality: number;
  basePrice: number;
  assetKey: string;
}

export interface MarketChannel {
  id: string;
  name: string;
  priceMultiplier: number;
  demand: number;
  trend: number;
  description: string;
}

export interface Weather {
  label: string;
  temperatureC: number;
  effect: string;
}

export interface EventChoice {
  id: string;
  label: string;
  consequence: string;
}

export interface GameEvent {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  assetKey: string;
  choices: EventChoice[];
}

export interface Notice {
  id: string;
  tone: string;
  message: string;
}

export interface SeasonResult {
  victory: boolean;
  operatingProfit: number;
  estateValue: number;
  rivalEstateValue: number;
  summary: string;
}

export interface GameState {
  schemaVersion: number;
  seed: number;
  week: number;
  maxWeeks: number;
  seasonComplete: boolean;
  weather: Weather;
  player: Estate;
  rival: Rival;
  vineyards: VineyardPlot[];
  facilities: Facility[];
  inventory: WineBatch[];
  markets: MarketChannel[];
  activeEvent: GameEvent | null;
  notices: Notice[];
  seasonResult: SeasonResult | null;
}

export type PlayerAction =
  | { type: "tendVineyard"; plotId: string }
  | { type: "harvest"; plotId: string }
  | { type: "processWine"; batchId: string }
  | { type: "bottleWine"; batchId: string }
  | { type: "sellWine"; batchId: string; marketId: string }
  | { type: "respondToEvent"; choiceId: string };
