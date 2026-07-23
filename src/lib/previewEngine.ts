import type {
  GameEvent,
  GameState,
  PlayerAction,
  SeasonResult,
  WineBatch,
} from "../types/game";

const MAX_WEEKS = 12;
const ACTIONS_PER_WEEK = 2;

export function createDemoGame(seed = 2_026_072_300_1): GameState {
  return {
    schemaVersion: 1,
    seed,
    week: 1,
    maxWeeks: MAX_WEEKS,
    seasonComplete: false,
    weather: {
      label: "Sunny",
      temperatureC: 22,
      effect: "+2 ripeness this week",
    },
    player: {
      name: "Bellavigna Estate",
      cash: 1_280_000,
      reputation: 74,
      revenue: 0,
      expenses: 0,
      actionsRemaining: ACTIONS_PER_WEEK,
    },
    rival: {
      name: "Monte Verde Estate",
      estateValue: 1_330_000,
      reputation: 71,
      pressure: 42,
    },
    vineyards: [
      {
        id: "north-ridge",
        name: "North Ridge",
        variety: "Sangiovese",
        hectares: 12.4,
        health: 84,
        ripeness: 68,
        yieldTons: 18.6,
        harvested: false,
      },
      {
        id: "west-slope",
        name: "West Slope",
        variety: "Cabernet Sauvignon",
        hectares: 9.6,
        health: 78,
        ripeness: 61,
        yieldTons: 14.2,
        harvested: false,
      },
      {
        id: "south-fields",
        name: "South Fields",
        variety: "Chardonnay",
        hectares: 8.2,
        health: 88,
        ripeness: 72,
        yieldTons: 12.8,
        harvested: false,
      },
    ],
    facilities: [
      { id: "winery", name: "Winery", efficiency: 92, status: "Ready for crush" },
      { id: "cellar", name: "Cellar", efficiency: 86, status: "1 batch resting" },
      { id: "bottling", name: "Bottling", efficiency: 78, status: "Line available" },
      {
        id: "equipment",
        name: "Equipment",
        efficiency: 88,
        status: "All equipment ready",
      },
    ],
    inventory: [
      {
        id: "reserve-red-2025",
        name: "Reserve Red 2025",
        variety: "Sangiovese",
        stage: "bottled",
        quantity: 2_450,
        quality: 82,
        basePrice: 22,
        assetKey: "wine.reserveRed",
      },
      {
        id: "estate-chardonnay-2025",
        name: "Estate Chardonnay 2025",
        variety: "Chardonnay",
        stage: "cellar",
        quantity: 1_820,
        quality: 78,
        basePrice: 18,
        assetKey: "wine.estateChardonnay",
      },
    ],
    markets: [
      {
        id: "wholesale",
        name: "Wholesale",
        priceMultiplier: 0.82,
        demand: 92,
        trend: 2,
        description: "Reliable volume, modest margins.",
      },
      {
        id: "local",
        name: "Local Cellar Door",
        priceMultiplier: 1,
        demand: 76,
        trend: 4,
        description: "Balanced price with a reputation lift.",
      },
      {
        id: "premium",
        name: "Premium Export",
        priceMultiplier: 1.34,
        demand: 58,
        trend: -1,
        description: "High margin, limited demand.",
      },
    ],
    activeEvent: null,
    notices: [
      {
        id: "welcome",
        tone: "info",
        message: "The harvest window is opening. Choose your first two priorities.",
      },
    ],
    seasonResult: null,
  };
}

export function demoPerform(state: GameState, action: PlayerAction): GameState {
  const game = structuredClone(state);
  if (game.seasonComplete) throw new Error("The season is complete.");
  if (action.type !== "respondToEvent" && game.player.actionsRemaining <= 0) {
    throw new Error("No management actions remain this week.");
  }

  switch (action.type) {
    case "tendVineyard": {
      const plot = requiredPlot(game, action.plotId);
      if (plot.harvested) throw new Error("That parcel has already been harvested.");
      charge(game, 18_000);
      plot.health = Math.min(100, plot.health + 9);
      plot.yieldTons = round1(plot.yieldTons * 1.035);
      useAction(game, `${plot.name} received focused care.`);
      break;
    }
    case "harvest": {
      const plot = requiredPlot(game, action.plotId);
      if (plot.harvested) throw new Error("That parcel has already been harvested.");
      if (plot.ripeness < 70) {
        throw new Error("The grapes need at least 70 ripeness before harvest.");
      }
      charge(game, 24_000);
      plot.harvested = true;
      const quality = Math.min(96, Math.round((plot.ripeness + plot.health) / 2));
      game.inventory.push({
        id: `${plot.id}-w${game.week}`,
        name: `${plot.name} 2026`,
        variety: plot.variety,
        stage: "must",
        quantity: Math.round(plot.yieldTons * 620),
        quality,
        basePrice: 16 + quality * 0.09,
        assetKey:
          plot.variety === "Chardonnay"
            ? "wine.estateChardonnay"
            : "wine.reserveRed",
      });
      useAction(game, `${plot.name} was harvested at quality ${quality}.`);
      break;
    }
    case "processWine": {
      const batch = requiredBatch(game, action.batchId);
      if (batch.stage !== "must") {
        throw new Error("Only freshly harvested must can be moved into the cellar.");
      }
      charge(game, 14_000);
      batch.stage = "cellar";
      batch.quality = Math.min(98, batch.quality + 2);
      useAction(game, `${batch.name} is now developing in the cellar.`);
      break;
    }
    case "bottleWine": {
      const batch = requiredBatch(game, action.batchId);
      if (batch.stage !== "cellar") {
        throw new Error("Only cellar-ready wine can be bottled.");
      }
      charge(game, 11_000);
      batch.stage = "bottled";
      batch.quantity = Math.round(batch.quantity * 0.96);
      useAction(game, `${batch.name} is bottled and ready for market.`);
      break;
    }
    case "sellWine": {
      const batch = requiredBatch(game, action.batchId);
      if (batch.stage !== "bottled") throw new Error("Wine must be bottled before sale.");
      const market = game.markets.find(({ id }) => id === action.marketId);
      if (!market) throw new Error("That market channel does not exist.");
      if (market.id === "premium" && game.player.reputation < 70) {
        throw new Error("Premium Export requires at least 70 reputation.");
      }
      const demandFactor = 0.6 + market.demand / 250;
      const qualityFactor = 0.78 + batch.quality / 300;
      const revenue = Math.round(
        batch.quantity *
          batch.basePrice *
          market.priceMultiplier *
          demandFactor *
          qualityFactor,
      );
      game.inventory = game.inventory.filter(({ id }) => id !== batch.id);
      game.player.cash += revenue;
      game.player.revenue += revenue;
      if (market.id === "local") game.player.reputation += 2;
      useAction(game, `${batch.name} sold through ${market.name} for €${revenue}.`);
      break;
    }
    case "respondToEvent": {
      if (!game.activeEvent) throw new Error("There is no active rival event.");
      if (action.choiceId === "match-price") {
        charge(game, 40_000);
        game.rival.pressure = Math.max(0, game.rival.pressure - 14);
        notice(game, "You protected shelf space, but reduced working capital.");
      } else if (action.choiceId === "host-tasting") {
        charge(game, 18_000);
        game.player.reputation = Math.min(100, game.player.reputation + 7);
        game.rival.pressure = Math.max(0, game.rival.pressure - 9);
        notice(game, "A private tasting strengthened customer loyalty.");
      } else if (action.choiceId === "hold-line") {
        game.rival.pressure = Math.min(100, game.rival.pressure + 5);
        const premium = game.markets.find(({ id }) => id === "premium");
        if (premium) premium.priceMultiplier = Math.min(1.5, premium.priceMultiplier + 0.08);
        notice(game, "You preserved the estate's premium positioning.");
      } else {
        throw new Error("That event response does not exist.");
      }
      game.activeEvent = null;
      break;
    }
  }
  return game;
}

export function demoAdvanceWeek(state: GameState): GameState {
  const game = structuredClone(state);
  if (game.seasonComplete) throw new Error("The season is already complete.");
  if (game.activeEvent) throw new Error("Resolve the rival event before advancing.");

  charge(game, 12_000);
  const weatherBonus = game.weather.label === "Sunny" ? 2 : 0;
  for (const plot of game.vineyards) {
    if (!plot.harvested) {
      plot.ripeness = Math.min(100, plot.ripeness + 7 + weatherBonus);
      plot.health = Math.max(35, plot.health - 1);
    }
  }
  const noise = weekNoise(game.seed, game.week);
  game.markets.forEach((market, index) => {
    const direction = ((noise + index * 3) % 9) - 4;
    market.trend = direction;
    market.priceMultiplier = clamp(
      market.priceMultiplier + direction * 0.012,
      0.72,
      1.5,
    );
    market.demand = clamp(market.demand + direction * 2, 35, 100);
  });
  game.rival.estateValue += 21_000 + Math.max(-8, noise) * 1_250;
  game.rival.pressure = clamp(game.rival.pressure + 3 + Math.round(noise / 3), 10, 95);

  if (game.week >= game.maxWeeks) {
    game.seasonComplete = true;
    game.player.actionsRemaining = 0;
    game.seasonResult = seasonResult(game);
    return game;
  }

  game.week += 1;
  game.player.actionsRemaining = ACTIONS_PER_WEEK;
  game.weather = weatherFor(game.seed, game.week);
  if (game.week === 6) game.activeEvent = priceWarEvent();
  game.notices = [
    {
      id: `week-${game.week}`,
      tone: "info",
      message: `Week ${game.week} has begun. Markets and vineyard ripeness have shifted.`,
    },
  ];
  return game;
}

function requiredPlot(game: GameState, id: string) {
  const plot = game.vineyards.find((candidate) => candidate.id === id);
  if (!plot) throw new Error("That vineyard parcel does not exist.");
  return plot;
}

function requiredBatch(game: GameState, id: string): WineBatch {
  const batch = game.inventory.find((candidate) => candidate.id === id);
  if (!batch) throw new Error("That wine batch does not exist.");
  return batch;
}

function charge(game: GameState, cost: number) {
  if (game.player.cash < cost) throw new Error(`This action costs €${cost}.`);
  game.player.cash -= cost;
  game.player.expenses += cost;
}

function useAction(game: GameState, message: string) {
  game.player.actionsRemaining = Math.max(0, game.player.actionsRemaining - 1);
  notice(game, message);
}

function notice(game: GameState, message: string) {
  game.notices = [
    { id: `notice-${game.week}-${game.notices.length}`, tone: "success", message },
    ...game.notices,
  ].slice(0, 4);
}

function priceWarEvent(): GameEvent {
  return {
    id: "rival-price-war",
    title: "A Calculated Undercut",
    subtitle: "Monte Verde has started a price war",
    body: "Your rival has discounted its reserve line just as export buyers arrive. Respond now or protect your margins and weather the pressure.",
    assetKey: "event.rival.priceWar",
    choices: [
      {
        id: "match-price",
        label: "Match the price",
        consequence: "Costs €40,000 · sharply reduces rival pressure",
      },
      {
        id: "host-tasting",
        label: "Host a private tasting",
        consequence: "Costs €18,000 · gain 7 reputation",
      },
      {
        id: "hold-line",
        label: "Hold the premium line",
        consequence: "Rival pressure rises · premium prices improve",
      },
    ],
  };
}

function seasonResult(game: GameState): SeasonResult {
  const inventoryValue = game.inventory.reduce((total, batch) => {
    const factor = batch.stage === "bottled" ? 0.9 : batch.stage === "cellar" ? 0.68 : 0.35;
    return total + batch.quantity * batch.basePrice * factor;
  }, 0);
  const estateValue = Math.round(game.player.cash + inventoryValue);
  const operatingProfit = game.player.revenue - game.player.expenses;
  const victory = operatingProfit > 0 && estateValue > game.rival.estateValue;
  return {
    victory,
    operatingProfit,
    estateValue,
    rivalEstateValue: game.rival.estateValue,
    summary: victory
      ? "Bellavigna closes the season profitable and ahead of Monte Verde."
      : operatingProfit <= 0
        ? "The estate did not reach a positive operating profit this season."
        : "The estate made a profit, but Monte Verde retained the stronger valuation.",
  };
}

function weatherFor(seed: number, week: number) {
  const options = [
    { label: "Sunny", temperatureC: 24, effect: "+2 ripeness this week" },
    { label: "Warm breeze", temperatureC: 21, effect: "+1 ripeness this week" },
    { label: "Light rain", temperatureC: 18, effect: "-1 ripeness this week" },
    { label: "Partly cloudy", temperatureC: 20, effect: "Stable growing conditions" },
  ];
  return options[(seed + week) % options.length];
}

function weekNoise(seed: number, week: number): number {
  return ((seed % 97) * (week + 11)) % 17 - 8;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
