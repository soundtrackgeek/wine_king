use serde::{Deserialize, Serialize};

const SAVE_SCHEMA_VERSION: u32 = 1;
const STARTING_CASH: i64 = 1_280_000;
const ACTIONS_PER_WEEK: u8 = 2;
const MAX_WEEKS: u8 = 12;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct GameState {
    pub schema_version: u32,
    pub seed: u64,
    pub week: u8,
    pub max_weeks: u8,
    pub season_complete: bool,
    pub weather: Weather,
    pub player: Estate,
    pub rival: Rival,
    pub vineyards: Vec<VineyardPlot>,
    pub facilities: Vec<Facility>,
    pub inventory: Vec<WineBatch>,
    pub markets: Vec<MarketChannel>,
    pub active_event: Option<GameEvent>,
    pub notices: Vec<Notice>,
    pub season_result: Option<SeasonResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Estate {
    pub name: String,
    pub cash: i64,
    pub reputation: i32,
    pub revenue: i64,
    pub expenses: i64,
    pub actions_remaining: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Rival {
    pub name: String,
    pub estate_value: i64,
    pub reputation: i32,
    pub pressure: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct VineyardPlot {
    pub id: String,
    pub name: String,
    pub variety: String,
    pub hectares: f32,
    pub health: i32,
    pub ripeness: i32,
    pub yield_tons: f32,
    pub harvested: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Facility {
    pub id: String,
    pub name: String,
    pub efficiency: i32,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct WineBatch {
    pub id: String,
    pub name: String,
    pub variety: String,
    pub stage: WineStage,
    pub quantity: i32,
    pub quality: i32,
    pub base_price: f32,
    pub asset_key: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum WineStage {
    Must,
    Cellar,
    Bottled,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct MarketChannel {
    pub id: String,
    pub name: String,
    pub price_multiplier: f32,
    pub demand: i32,
    pub trend: i32,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Weather {
    pub label: String,
    pub temperature_c: i32,
    pub effect: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct GameEvent {
    pub id: String,
    pub title: String,
    pub subtitle: String,
    pub body: String,
    pub asset_key: String,
    pub choices: Vec<EventChoice>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct EventChoice {
    pub id: String,
    pub label: String,
    pub consequence: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Notice {
    pub id: String,
    pub tone: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct SeasonResult {
    pub victory: bool,
    pub operating_profit: i64,
    pub estate_value: i64,
    pub rival_estate_value: i64,
    pub summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(
    tag = "type",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum PlayerAction {
    TendVineyard { plot_id: String },
    Harvest { plot_id: String },
    ProcessWine { batch_id: String },
    BottleWine { batch_id: String },
    SellWine { batch_id: String, market_id: String },
    RespondToEvent { choice_id: String },
}

impl GameState {
    pub fn new(seed: u64) -> Self {
        Self {
            schema_version: SAVE_SCHEMA_VERSION,
            seed,
            week: 1,
            max_weeks: MAX_WEEKS,
            season_complete: false,
            weather: Weather {
                label: "Sunny".into(),
                temperature_c: 22,
                effect: "+2 ripeness this week".into(),
            },
            player: Estate {
                name: "Bellavigna Estate".into(),
                cash: STARTING_CASH,
                reputation: 74,
                revenue: 0,
                expenses: 0,
                actions_remaining: ACTIONS_PER_WEEK,
            },
            rival: Rival {
                name: "Monte Verde Estate".into(),
                estate_value: 1_330_000,
                reputation: 71,
                pressure: 42,
            },
            vineyards: vec![
                VineyardPlot {
                    id: "north-ridge".into(),
                    name: "North Ridge".into(),
                    variety: "Sangiovese".into(),
                    hectares: 12.4,
                    health: 84,
                    ripeness: 68,
                    yield_tons: 18.6,
                    harvested: false,
                },
                VineyardPlot {
                    id: "west-slope".into(),
                    name: "West Slope".into(),
                    variety: "Cabernet Sauvignon".into(),
                    hectares: 9.6,
                    health: 78,
                    ripeness: 61,
                    yield_tons: 14.2,
                    harvested: false,
                },
                VineyardPlot {
                    id: "south-fields".into(),
                    name: "South Fields".into(),
                    variety: "Chardonnay".into(),
                    hectares: 8.2,
                    health: 88,
                    ripeness: 72,
                    yield_tons: 12.8,
                    harvested: false,
                },
            ],
            facilities: vec![
                Facility {
                    id: "winery".into(),
                    name: "Winery".into(),
                    efficiency: 92,
                    status: "Ready for crush".into(),
                },
                Facility {
                    id: "cellar".into(),
                    name: "Cellar".into(),
                    efficiency: 86,
                    status: "1 batch resting".into(),
                },
                Facility {
                    id: "bottling".into(),
                    name: "Bottling".into(),
                    efficiency: 78,
                    status: "Line available".into(),
                },
                Facility {
                    id: "equipment".into(),
                    name: "Equipment".into(),
                    efficiency: 88,
                    status: "All equipment ready".into(),
                },
            ],
            inventory: vec![
                WineBatch {
                    id: "reserve-red-2025".into(),
                    name: "Reserve Red 2025".into(),
                    variety: "Sangiovese".into(),
                    stage: WineStage::Bottled,
                    quantity: 2_450,
                    quality: 82,
                    base_price: 22.0,
                    asset_key: "wine.reserveRed".into(),
                },
                WineBatch {
                    id: "estate-chardonnay-2025".into(),
                    name: "Estate Chardonnay 2025".into(),
                    variety: "Chardonnay".into(),
                    stage: WineStage::Cellar,
                    quantity: 1_820,
                    quality: 78,
                    base_price: 18.0,
                    asset_key: "wine.estateChardonnay".into(),
                },
            ],
            markets: vec![
                MarketChannel {
                    id: "wholesale".into(),
                    name: "Wholesale".into(),
                    price_multiplier: 0.82,
                    demand: 92,
                    trend: 2,
                    description: "Reliable volume, modest margins.".into(),
                },
                MarketChannel {
                    id: "local".into(),
                    name: "Local Cellar Door".into(),
                    price_multiplier: 1.0,
                    demand: 76,
                    trend: 4,
                    description: "Balanced price with a reputation lift.".into(),
                },
                MarketChannel {
                    id: "premium".into(),
                    name: "Premium Export".into(),
                    price_multiplier: 1.34,
                    demand: 58,
                    trend: -1,
                    description: "High margin, limited demand.".into(),
                },
            ],
            active_event: None,
            notices: vec![Notice {
                id: "welcome".into(),
                tone: "info".into(),
                message: "The harvest window is opening. Choose your first two priorities.".into(),
            }],
            season_result: None,
        }
    }

    pub fn perform(&mut self, action: PlayerAction) -> Result<(), String> {
        if self.season_complete {
            return Err("The season is complete. Start a new game to continue.".into());
        }

        if !matches!(action, PlayerAction::RespondToEvent { .. })
            && self.player.actions_remaining == 0
        {
            return Err("No management actions remain this week.".into());
        }

        match action {
            PlayerAction::TendVineyard { plot_id } => self.tend_vineyard(&plot_id),
            PlayerAction::Harvest { plot_id } => self.harvest(&plot_id),
            PlayerAction::ProcessWine { batch_id } => self.process_wine(&batch_id),
            PlayerAction::BottleWine { batch_id } => self.bottle_wine(&batch_id),
            PlayerAction::SellWine {
                batch_id,
                market_id,
            } => self.sell_wine(&batch_id, &market_id),
            PlayerAction::RespondToEvent { choice_id } => self.respond_to_event(&choice_id),
        }
    }

    pub fn advance_week(&mut self) -> Result<(), String> {
        if self.season_complete {
            return Err("The season is already complete.".into());
        }
        if self.active_event.is_some() {
            return Err("Resolve the rival event before advancing the week.".into());
        }

        self.charge(12_000)?;
        self.notices.clear();

        let weather_bonus = self.weather_bonus();
        for plot in &mut self.vineyards {
            if !plot.harvested {
                plot.ripeness = (plot.ripeness + 7 + weather_bonus).min(100);
                plot.health = (plot.health - 1).max(35);
            }
        }

        let noise = self.week_noise();
        for (index, market) in self.markets.iter_mut().enumerate() {
            let direction = ((noise + index as i32 * 3) % 9) - 4;
            market.trend = direction;
            market.price_multiplier =
                (market.price_multiplier + direction as f32 * 0.012).clamp(0.72, 1.5);
            market.demand = (market.demand + direction * 2).clamp(35, 100);
        }

        self.rival.estate_value += 21_000 + i64::from(noise.max(-8)) * 1_250;
        self.rival.pressure = (self.rival.pressure + 3 + noise / 3).clamp(10, 95);

        if self.week >= self.max_weeks {
            self.finish_season();
            return Ok(());
        }

        self.week += 1;
        self.player.actions_remaining = ACTIONS_PER_WEEK;
        self.update_weather();

        if self.week == 6 {
            self.active_event = Some(price_war_event());
        }

        self.notices.push(Notice {
            id: format!("week-{}", self.week),
            tone: "info".into(),
            message: format!(
                "Week {} has begun. Market prices and vineyard ripeness have shifted.",
                self.week
            ),
        });
        Ok(())
    }

    pub fn estate_value(&self) -> i64 {
        let inventory_value: i64 = self
            .inventory
            .iter()
            .map(|batch| {
                let stage_factor = match batch.stage {
                    WineStage::Must => 0.35,
                    WineStage::Cellar => 0.68,
                    WineStage::Bottled => 0.9,
                };
                (batch.quantity as f32 * batch.base_price * stage_factor) as i64
            })
            .sum();
        self.player.cash + inventory_value
    }

    fn tend_vineyard(&mut self, plot_id: &str) -> Result<(), String> {
        let plot_index = self
            .vineyards
            .iter()
            .position(|plot| plot.id == plot_id)
            .ok_or_else(|| "That vineyard parcel does not exist.".to_string())?;
        if self.vineyards[plot_index].harvested {
            return Err("That parcel has already been harvested.".into());
        }
        self.charge(18_000)?;
        let plot = &mut self.vineyards[plot_index];
        plot.health = (plot.health + 9).min(100);
        plot.yield_tons = (plot.yield_tons * 1.035 * 10.0).round() / 10.0;
        let name = plot.name.clone();
        self.consume_action();
        self.push_notice("success", format!("{name} received focused care."));
        Ok(())
    }

    fn harvest(&mut self, plot_id: &str) -> Result<(), String> {
        let (name, variety, ripeness, health, yield_tons) = {
            let plot = self
                .vineyards
                .iter()
                .find(|plot| plot.id == plot_id)
                .ok_or_else(|| "That vineyard parcel does not exist.".to_string())?;
            if plot.harvested {
                return Err("That parcel has already been harvested.".into());
            }
            if plot.ripeness < 70 {
                return Err("The grapes need at least 70 ripeness before harvest.".into());
            }
            (
                plot.name.clone(),
                plot.variety.clone(),
                plot.ripeness,
                plot.health,
                plot.yield_tons,
            )
        };

        self.charge(24_000)?;
        if let Some(plot) = self.vineyards.iter_mut().find(|plot| plot.id == plot_id) {
            plot.harvested = true;
        }
        let quality = ((ripeness + health) / 2).clamp(50, 96);
        let quantity = (yield_tons * 620.0) as i32;
        let asset_key = if variety == "Chardonnay" {
            "wine.estateChardonnay"
        } else {
            "wine.reserveRed"
        };
        self.inventory.push(WineBatch {
            id: format!("{}-w{}", plot_id, self.week),
            name: format!("{name} {}", 2026),
            variety,
            stage: WineStage::Must,
            quantity,
            quality,
            base_price: 16.0 + quality as f32 * 0.09,
            asset_key: asset_key.into(),
        });
        self.consume_action();
        self.push_notice(
            "success",
            format!("{name} was harvested at quality {quality}."),
        );
        Ok(())
    }

    fn process_wine(&mut self, batch_id: &str) -> Result<(), String> {
        let batch_index = self
            .inventory
            .iter()
            .position(|batch| batch.id == batch_id)
            .ok_or_else(|| "That wine batch does not exist.".to_string())?;
        if self.inventory[batch_index].stage != WineStage::Must {
            return Err("Only freshly harvested must can be moved into the cellar.".into());
        }
        self.charge(14_000)?;
        let batch = &mut self.inventory[batch_index];
        batch.stage = WineStage::Cellar;
        batch.quality = (batch.quality + 2).min(98);
        let name = batch.name.clone();
        self.consume_action();
        self.push_notice(
            "success",
            format!("{name} is now developing in the cellar."),
        );
        Ok(())
    }

    fn bottle_wine(&mut self, batch_id: &str) -> Result<(), String> {
        let batch_index = self
            .inventory
            .iter()
            .position(|batch| batch.id == batch_id)
            .ok_or_else(|| "That wine batch does not exist.".to_string())?;
        if self.inventory[batch_index].stage != WineStage::Cellar {
            return Err("Only cellar-ready wine can be bottled.".into());
        }
        self.charge(11_000)?;
        let batch = &mut self.inventory[batch_index];
        batch.stage = WineStage::Bottled;
        batch.quantity = (batch.quantity as f32 * 0.96) as i32;
        let name = batch.name.clone();
        self.consume_action();
        self.push_notice(
            "success",
            format!("{name} is bottled and ready for market."),
        );
        Ok(())
    }

    fn sell_wine(&mut self, batch_id: &str, market_id: &str) -> Result<(), String> {
        let market = self
            .markets
            .iter()
            .find(|market| market.id == market_id)
            .cloned()
            .ok_or_else(|| "That market channel does not exist.".to_string())?;
        if market.id == "premium" && self.player.reputation < 70 {
            return Err("Premium Export requires at least 70 reputation.".into());
        }
        let index = self
            .inventory
            .iter()
            .position(|batch| batch.id == batch_id)
            .ok_or_else(|| "That wine batch does not exist.".to_string())?;
        if self.inventory[index].stage != WineStage::Bottled {
            return Err("Wine must be bottled before it can be sold.".into());
        }
        let batch = self.inventory.remove(index);
        let demand_factor = 0.6 + market.demand as f32 / 250.0;
        let quality_factor = 0.78 + batch.quality as f32 / 300.0;
        let revenue = (batch.quantity as f32
            * batch.base_price
            * market.price_multiplier
            * demand_factor
            * quality_factor) as i64;
        self.player.cash += revenue;
        self.player.revenue += revenue;
        if market.id == "local" {
            self.player.reputation = (self.player.reputation + 2).min(100);
        }
        self.consume_action();
        self.push_notice(
            "success",
            format!(
                "{} sold through {} for €{}.",
                batch.name, market.name, revenue
            ),
        );
        Ok(())
    }

    fn respond_to_event(&mut self, choice_id: &str) -> Result<(), String> {
        if self.active_event.is_none() {
            return Err("There is no active rival event.".into());
        }
        let message = match choice_id {
            "match-price" => {
                self.charge(40_000)?;
                self.rival.pressure = (self.rival.pressure - 14).max(0);
                "You protected shelf space, but the discount reduced working capital."
            }
            "host-tasting" => {
                self.charge(18_000)?;
                self.player.reputation = (self.player.reputation + 7).min(100);
                self.rival.pressure = (self.rival.pressure - 9).max(0);
                "A private tasting strengthened your reputation and customer loyalty."
            }
            "hold-line" => {
                self.rival.pressure = (self.rival.pressure + 5).min(100);
                for market in &mut self.markets {
                    if market.id == "premium" {
                        market.price_multiplier = (market.price_multiplier + 0.08).min(1.5);
                    }
                }
                "You held your price and preserved the estate's premium positioning."
            }
            _ => return Err("That event response does not exist.".into()),
        };
        self.active_event = None;
        self.push_notice("success", message.into());
        Ok(())
    }

    fn finish_season(&mut self) {
        self.season_complete = true;
        self.player.actions_remaining = 0;
        let estate_value = self.estate_value();
        let operating_profit = self.player.revenue - self.player.expenses;
        let victory = operating_profit > 0 && estate_value > self.rival.estate_value;
        let summary = if victory {
            "Bellavigna closes the season profitable and ahead of Monte Verde."
        } else if operating_profit <= 0 {
            "The estate did not reach a positive operating profit this season."
        } else {
            "The estate made a profit, but Monte Verde retained the stronger valuation."
        };
        self.season_result = Some(SeasonResult {
            victory,
            operating_profit,
            estate_value,
            rival_estate_value: self.rival.estate_value,
            summary: summary.into(),
        });
    }

    fn charge(&mut self, cost: i64) -> Result<(), String> {
        if self.player.cash < cost {
            return Err(format!(
                "This action costs €{cost}, but the estate lacks the cash."
            ));
        }
        self.player.cash -= cost;
        self.player.expenses += cost;
        Ok(())
    }

    fn consume_action(&mut self) {
        self.player.actions_remaining = self.player.actions_remaining.saturating_sub(1);
    }

    fn push_notice(&mut self, tone: &str, message: String) {
        self.notices.insert(
            0,
            Notice {
                id: format!("notice-{}-{}", self.week, self.notices.len()),
                tone: tone.into(),
                message,
            },
        );
        self.notices.truncate(4);
    }

    fn weather_bonus(&self) -> i32 {
        match self.weather.label.as_str() {
            "Sunny" => 2,
            "Warm breeze" => 1,
            "Light rain" => -1,
            _ => 0,
        }
    }

    fn week_noise(&self) -> i32 {
        let mixed = self
            .seed
            .wrapping_add(u64::from(self.week).wrapping_mul(6_364_136_223_846_793_005))
            .rotate_left(u32::from(self.week % 31));
        (mixed % 17) as i32 - 8
    }

    fn update_weather(&mut self) {
        self.weather = match (self.seed + u64::from(self.week)) % 4 {
            0 => Weather {
                label: "Sunny".into(),
                temperature_c: 24,
                effect: "+2 ripeness this week".into(),
            },
            1 => Weather {
                label: "Warm breeze".into(),
                temperature_c: 21,
                effect: "+1 ripeness this week".into(),
            },
            2 => Weather {
                label: "Light rain".into(),
                temperature_c: 18,
                effect: "-1 ripeness this week".into(),
            },
            _ => Weather {
                label: "Partly cloudy".into(),
                temperature_c: 20,
                effect: "Stable growing conditions".into(),
            },
        };
    }
}

fn price_war_event() -> GameEvent {
    GameEvent {
        id: "rival-price-war".into(),
        title: "A Calculated Undercut".into(),
        subtitle: "Monte Verde has started a price war".into(),
        body: "Your rival has discounted its reserve line just as export buyers arrive. Respond now or protect your margins and weather the pressure.".into(),
        asset_key: "event.rival.priceWar".into(),
        choices: vec![
            EventChoice {
                id: "match-price".into(),
                label: "Match the price".into(),
                consequence: "Costs €40,000 · sharply reduces rival pressure".into(),
            },
            EventChoice {
                id: "host-tasting".into(),
                label: "Host a private tasting".into(),
                consequence: "Costs €18,000 · gain 7 reputation".into(),
            },
            EventChoice {
                id: "hold-line".into(),
                label: "Hold the premium line".into(),
                consequence: "Rival pressure rises · premium prices improve".into(),
            },
        ],
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_game_is_deterministic() {
        assert_eq!(GameState::new(42), GameState::new(42));
    }

    #[test]
    fn tending_consumes_cash_and_an_action() {
        let mut game = GameState::new(42);
        game.perform(PlayerAction::TendVineyard {
            plot_id: "north-ridge".into(),
        })
        .unwrap();
        assert_eq!(game.player.actions_remaining, 1);
        assert_eq!(game.player.cash, STARTING_CASH - 18_000);
        assert_eq!(game.vineyards[0].health, 93);
    }

    #[test]
    fn ripe_plot_can_be_harvested_into_must() {
        let mut game = GameState::new(42);
        game.perform(PlayerAction::Harvest {
            plot_id: "south-fields".into(),
        })
        .unwrap();
        assert!(game.vineyards[2].harvested);
        assert!(game
            .inventory
            .iter()
            .any(|batch| batch.id.starts_with("south-fields") && batch.stage == WineStage::Must));
    }

    #[test]
    fn event_blocks_week_until_resolved() {
        let mut game = GameState::new(42);
        for _ in 1..6 {
            game.advance_week().unwrap();
        }
        assert!(game.active_event.is_some());
        assert!(game.advance_week().is_err());
        game.perform(PlayerAction::RespondToEvent {
            choice_id: "hold-line".into(),
        })
        .unwrap();
        assert!(game.active_event.is_none());
    }

    #[test]
    fn season_finishes_with_a_result() {
        let mut game = GameState::new(42);
        while !game.season_complete {
            if game.active_event.is_some() {
                game.perform(PlayerAction::RespondToEvent {
                    choice_id: "hold-line".into(),
                })
                .unwrap();
            }
            game.advance_week().unwrap();
        }
        assert!(game.season_result.is_some());
        assert_eq!(game.week, MAX_WEEKS);
    }
}
