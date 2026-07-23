import { useEffect, useMemo, useState } from "react";
import type { AssetPack } from "./lib/assetPack";
import { assetUrl, loadAssetPack } from "./lib/assetPack";
import { IconSlot } from "./components/IconSlot";
import { UpdateToast } from "./components/UpdateToast";
import { useGameUpdater } from "./hooks/useGameUpdater";
import {
  advanceWeek,
  getGame,
  loadGame,
  newGame,
  performAction,
  saveGame,
} from "./lib/gameGateway";
import {
  UPDATE_INTERVAL_OPTIONS,
  type UpdateIntervalMinutes,
} from "./lib/updateSettings";
import type {
  Facility,
  GameState,
  MarketChannel,
  PlayerAction,
  VineyardPlot,
  WineBatch,
} from "./types/game";

type ViewId =
  | "overview"
  | "vineyards"
  | "winery"
  | "cellar"
  | "bottling"
  | "market"
  | "finance"
  | "people"
  | "rivals"
  | "settings";

const NAVIGATION: Array<{ id: ViewId; label: string; icon: string }> = [
  { id: "overview", label: "Overview", icon: "nav.overview" },
  { id: "vineyards", label: "Vineyards", icon: "nav.vineyards" },
  { id: "winery", label: "Winery", icon: "nav.winery" },
  { id: "cellar", label: "Cellar", icon: "nav.cellar" },
  { id: "bottling", label: "Bottling", icon: "nav.bottling" },
  { id: "market", label: "Market", icon: "nav.market" },
  { id: "finance", label: "Finances", icon: "nav.finance" },
  { id: "people", label: "People", icon: "nav.people" },
  { id: "rivals", label: "Rivals", icon: "nav.rivals" },
  { id: "settings", label: "Settings", icon: "nav.settings" },
];

export function App() {
  const [pack, setPack] = useState<AssetPack | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [activeView, setActiveView] = useState<ViewId>("overview");
  const [selectedPlotId, setSelectedPlotId] = useState("south-fields");
  const [selectedBatchId, setSelectedBatchId] = useState("reserve-red-2025");
  const [selectedMarketId, setSelectedMarketId] = useState("local");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const updater = useGameUpdater();

  useEffect(() => {
    Promise.all([loadAssetPack(), getGame()])
      .then(([loadedPack, loadedGame]) => {
        setPack(loadedPack);
        setGame(loadedGame);
      })
      .catch((error: unknown) => {
        setFatalError(errorMessage(error));
      });
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 4200);
    return () => window.clearTimeout(timer);
  }, [message]);

  async function run(operation: () => Promise<GameState>, success?: string) {
    setBusy(true);
    try {
      const next = await operation();
      setGame(next);
      if (success) setMessage(success);
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  function act(action: PlayerAction) {
    return run(() => performAction(action));
  }

  async function handleSave() {
    setBusy(true);
    try {
      const location = await saveGame();
      setMessage(`Season saved — ${location}`);
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleLoad() {
    await run(loadGame, "Saved season restored.");
  }

  async function handleNewGame() {
    await run(() => newGame(), "A new 12-week season has begun.");
    setActiveView("overview");
    setSelectedPlotId("south-fields");
    setSelectedBatchId("reserve-red-2025");
  }

  if (fatalError) {
    return (
      <main className="fatal-screen">
        <div className="fatal-card">
          <p className="eyebrow">Wine King could not start</p>
          <h1>Asset-pack error</h1>
          <p>{fatalError}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!pack || !game) {
    return (
      <main className="loading-screen" aria-label="Loading Wine King">
        <div className="loading-mark">WK</div>
        <p>Opening Bellavigna Estate…</p>
      </main>
    );
  }

  return (
    <div className="game-shell">
      <Sidebar
        pack={pack}
        game={game}
        activeView={activeView}
        onNavigate={setActiveView}
      />
      <Header pack={pack} game={game} />

      <main className="workspace">
        <EstateScene
          pack={pack}
          game={game}
          selectedPlotId={selectedPlotId}
          onSelectPlot={(id) => {
            setSelectedPlotId(id);
            setActiveView("vineyards");
          }}
          onSelectFacility={(id) => {
            const view: ViewId =
              id === "equipment"
                ? "people"
                : id === "winery"
                  ? "winery"
                  : id === "cellar"
                    ? "cellar"
                    : "bottling";
            setActiveView(view);
          }}
        />

        <ManagementPanel
          pack={pack}
          game={game}
          activeView={activeView}
          selectedPlotId={selectedPlotId}
          selectedBatchId={selectedBatchId}
          selectedMarketId={selectedMarketId}
          busy={busy}
          onSelectPlot={setSelectedPlotId}
          onSelectBatch={setSelectedBatchId}
          onSelectMarket={setSelectedMarketId}
          onAction={act}
          onNewGame={handleNewGame}
          onSave={handleSave}
          onLoad={handleLoad}
          updateIntervalMinutes={updater.intervalMinutes}
          updateLastCheckedAt={updater.lastCheckedAt}
          updateStatus={updater.statusText}
          updateError={updater.error}
          updateChecking={updater.phase === "checking"}
          onSetUpdateInterval={updater.setIntervalMinutes}
          onCheckForUpdates={() => void updater.checkNow()}
        />

        <BottomDeck
          pack={pack}
          game={game}
          selectedBatchId={selectedBatchId}
          onSelectBatch={(id) => {
            setSelectedBatchId(id);
            setActiveView("market");
          }}
          onSelectRival={() => setActiveView("rivals")}
        />
      </main>

      <Footer
        pack={pack}
        game={game}
        busy={busy}
        onAdvance={() => run(advanceWeek)}
      />

      {message && (
        <div
          className={`toast ${updater.availableUpdate ? "toast-above-update" : ""}`}
          role="status"
        >
          {message}
        </div>
      )}

      {updater.availableUpdate && (
        <UpdateToast
          pack={pack}
          update={updater.availableUpdate}
          phase={updater.phase}
          progress={updater.progress}
          error={updater.error}
          onInstall={() =>
            void updater.install(async () => {
              await saveGame();
            })
          }
          onDismiss={updater.dismiss}
        />
      )}

      {game.activeEvent && (
        <EventModal
          pack={pack}
          game={game}
          busy={busy}
          onChoose={(choiceId) =>
            act({ type: "respondToEvent", choiceId })
          }
        />
      )}

      {game.seasonResult && (
        <SeasonSummary
          pack={pack}
          game={game}
          busy={busy}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  );
}

function Sidebar({
  pack,
  game,
  activeView,
  onNavigate,
}: {
  pack: AssetPack;
  game: GameState;
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-crown">
          <IconSlot pack={pack} slot="status.prestige" size={28} />
        </div>
        <div>
          <strong>WINE</strong>
          <strong>KING</strong>
        </div>
      </div>

      <nav className="side-nav" aria-label="Estate navigation">
        {NAVIGATION.map((item) => (
          <button
            type="button"
            key={item.id}
            className={activeView === item.id ? "active" : ""}
            onClick={() => onNavigate(item.id)}
            data-testid={`nav-${item.id}`}
          >
            <IconSlot pack={pack} slot={item.icon} size={22} />
            <span>{item.label}</span>
            {item.id === "rivals" && game.rival.pressure >= 50 && (
              <span className="nav-badge">!</span>
            )}
          </button>
        ))}
      </nav>

      <div className="estate-signature">
        <span>EST. 1912</span>
        <strong>{game.player.name}</strong>
        <small>Family Estate</small>
      </div>
    </aside>
  );
}

function Header({ pack, game }: { pack: AssetPack; game: GameState }) {
  const stats = [
    {
      icon: "status.cash",
      label: "Cash",
      value: formatMoney(game.player.cash),
      detail: `${signedMoney(game.player.revenue - game.player.expenses)} profit`,
    },
    {
      icon: "status.prestige",
      label: "Prestige",
      value: String(game.player.reputation),
      detail: game.player.reputation >= 80 ? "Renowned" : "Established",
    },
    {
      icon: "status.week",
      label: "Harvest",
      value: `Week ${game.week} of ${game.maxWeeks}`,
      detail: `Late summer · Year 1`,
    },
    {
      icon: "status.weather",
      label: `${game.weather.temperatureC}°C`,
      value: game.weather.label,
      detail: game.weather.effect,
    },
  ];
  return (
    <header className="topbar">
      <div className="page-title">
        <span>Bellavigna</span>
        <h1>Estate Overview</h1>
      </div>
      <div className="stat-strip">
        {stats.map((stat) => (
          <div className="top-stat" key={stat.label}>
            <IconSlot pack={pack} slot={stat.icon} size={25} />
            <div>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.detail}</small>
            </div>
          </div>
        ))}
      </div>
      <div className="alert-pill">
        <IconSlot pack={pack} slot="status.alert" size={22} />
        <div>
          <strong>{game.notices.length}</strong>
          <span>Notices</span>
        </div>
      </div>
    </header>
  );
}

function EstateScene({
  pack,
  game,
  selectedPlotId,
  onSelectPlot,
  onSelectFacility,
}: {
  pack: AssetPack;
  game: GameState;
  selectedPlotId: string;
  onSelectPlot: (id: string) => void;
  onSelectFacility: (id: string) => void;
}) {
  return (
    <section
      className="estate-scene"
      aria-label="Interactive estate map"
      style={{
        backgroundImage: `url("${assetUrl(pack, "scene.estate.overview")}")`,
      }}
    >
      <div className="scene-heading">
        <span>Bellavigna Estate</span>
        <strong>30.2 hectares under vine</strong>
      </div>
      {pack.scene.hotspots.map((hotspot) => {
        const plot = game.vineyards.find(({ id }) => id === hotspot.targetId);
        const facility = game.facilities.find(({ id }) => id === hotspot.targetId);
        const isPlot = hotspot.kind === "plot";
        const isSelected = isPlot && selectedPlotId === hotspot.targetId;
        return (
          <button
            type="button"
            key={hotspot.id}
            className={`scene-hotspot ${isPlot ? "plot-hotspot" : "facility-hotspot"} ${
              isSelected ? "selected" : ""
            }`}
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
            onClick={() =>
              isPlot
                ? onSelectPlot(hotspot.targetId)
                : onSelectFacility(hotspot.targetId)
            }
          >
            <IconSlot
              pack={pack}
              slot={isPlot ? "plot.grapes" : `facility.${hotspot.targetId}`}
              size={18}
            />
            <span>
              <strong>{hotspot.label}</strong>
              <small>
                {plot
                  ? `${plot.ripeness}% ripe · ${plot.health}% health`
                  : `${facility?.efficiency ?? 0}% efficiency`}
              </small>
            </span>
          </button>
        );
      })}
      <div className="scene-legend">
        <span><i className="legend-dot ready" /> Ready</span>
        <span><i className="legend-dot watch" /> Watch</span>
        <span><i className="legend-dot pressure" /> Rival pressure</span>
      </div>
    </section>
  );
}

function ManagementPanel(props: {
  pack: AssetPack;
  game: GameState;
  activeView: ViewId;
  selectedPlotId: string;
  selectedBatchId: string;
  selectedMarketId: string;
  busy: boolean;
  onSelectPlot: (id: string) => void;
  onSelectBatch: (id: string) => void;
  onSelectMarket: (id: string) => void;
  onAction: (action: PlayerAction) => void;
  onNewGame: () => void;
  onSave: () => void;
  onLoad: () => void;
  updateIntervalMinutes: UpdateIntervalMinutes;
  updateLastCheckedAt: Date | null;
  updateStatus: string;
  updateError: string | null;
  updateChecking: boolean;
  onSetUpdateInterval: (minutes: UpdateIntervalMinutes) => void;
  onCheckForUpdates: () => void;
}) {
  const {
    pack,
    game,
    activeView,
    selectedPlotId,
    selectedBatchId,
    selectedMarketId,
    busy,
    onSelectPlot,
    onSelectBatch,
    onSelectMarket,
    onAction,
    onNewGame,
    onSave,
    onLoad,
    updateIntervalMinutes,
    updateLastCheckedAt,
    updateStatus,
    updateError,
    updateChecking,
    onSetUpdateInterval,
    onCheckForUpdates,
  } = props;
  const selectedPlot =
    game.vineyards.find(({ id }) => id === selectedPlotId) ?? game.vineyards[0];
  const selectedBatch =
    game.inventory.find(({ id }) => id === selectedBatchId) ?? game.inventory[0];
  const selectedMarket =
    game.markets.find(({ id }) => id === selectedMarketId) ?? game.markets[0];
  const facility = game.facilities.find(({ id }) => id === activeView);

  return (
    <aside className="management-panel">
      {activeView === "overview" && (
        <>
          <PanelHeading eyebrow="Estate at a glance" title="Current priorities" />
          <MetricGrid
            metrics={[
              ["Under vine", "30.2 ha"],
              ["Actions left", String(game.player.actionsRemaining)],
              ["Cellar value", formatMoney(inventoryValue(game.inventory))],
              ["Rival pressure", `${game.rival.pressure}%`],
            ]}
          />
          <div className="priority-list">
            {game.vineyards
              .slice()
              .sort((a, b) => b.ripeness - a.ripeness)
              .map((plot) => (
                <button
                  type="button"
                  key={plot.id}
                  onClick={() => onSelectPlot(plot.id)}
                >
                  <IconSlot pack={pack} slot="plot.grapes" size={22} />
                  <span>
                    <strong>{plot.harvested ? "Harvest complete" : `Harvest ${plot.variety}`}</strong>
                    <small>{plot.name} · {plot.ripeness}% ripe</small>
                  </span>
                  <b>{plot.harvested ? "Done" : plot.ripeness >= 70 ? "Ready" : "Watch"}</b>
                </button>
              ))}
          </div>
          <NoticeList game={game} />
        </>
      )}

      {activeView === "vineyards" && (
        <>
          <PanelHeading eyebrow="Vineyard management" title={selectedPlot.name} />
          <SelectList
            items={game.vineyards.map((plot) => ({
              id: plot.id,
              title: plot.name,
              detail: `${plot.variety} · ${plot.hectares} ha`,
            }))}
            selectedId={selectedPlot.id}
            onSelect={onSelectPlot}
          />
          <HealthBlock plot={selectedPlot} />
          <div className="action-stack">
            <ActionButton
              pack={pack}
              icon="action.tend"
              label="Tend vineyard"
              detail="€18,000 · improve health and yield"
              disabled={busy || selectedPlot.harvested || game.player.actionsRemaining === 0}
              onClick={() =>
                onAction({ type: "tendVineyard", plotId: selectedPlot.id })
              }
            />
            <ActionButton
              pack={pack}
              icon="action.harvest"
              label="Harvest now"
              detail="€24,000 · create a fresh wine batch"
              accent
              disabled={
                busy ||
                selectedPlot.harvested ||
                selectedPlot.ripeness < 70 ||
                game.player.actionsRemaining === 0
              }
              onClick={() =>
                onAction({ type: "harvest", plotId: selectedPlot.id })
              }
            />
          </div>
        </>
      )}

      {(activeView === "winery" ||
        activeView === "cellar" ||
        activeView === "bottling") && (
        <>
          <PanelHeading
            eyebrow="Production"
            title={facility?.name ?? "Winery"}
          />
          {facility && (
            <div className="facility-status">
              <div>
                <span>Efficiency</span>
                <strong>{facility.efficiency}%</strong>
              </div>
              <div className="progress-track">
                <span style={{ width: `${facility.efficiency}%` }} />
              </div>
              <small>{facility.status}</small>
            </div>
          )}
          <SelectList
            items={game.inventory.map((batch) => ({
              id: batch.id,
              title: batch.name,
              detail: `${titleCase(batch.stage)} · ${formatNumber(batch.quantity)} bottles`,
            }))}
            selectedId={selectedBatch?.id ?? ""}
            onSelect={onSelectBatch}
            empty="No batches are currently in production."
          />
          {selectedBatch && (
            <BatchDetails pack={pack} batch={selectedBatch} />
          )}
          {activeView === "winery" && selectedBatch?.stage === "must" && (
            <ActionButton
              pack={pack}
              icon="action.process"
              label="Move into cellar"
              detail="€14,000 · fermentation and maturation"
              accent
              disabled={busy || game.player.actionsRemaining === 0}
              onClick={() =>
                onAction({ type: "processWine", batchId: selectedBatch.id })
              }
            />
          )}
          {(activeView === "cellar" || activeView === "bottling") &&
            selectedBatch?.stage === "cellar" && (
              <ActionButton
                pack={pack}
                icon="action.bottle"
                label="Bottle this batch"
                detail="€11,000 · 4% bottling loss"
                accent
                disabled={busy || game.player.actionsRemaining === 0}
                onClick={() =>
                  onAction({ type: "bottleWine", batchId: selectedBatch.id })
                }
              />
            )}
          {selectedBatch &&
            !(
              (activeView === "winery" && selectedBatch.stage === "must") ||
              ((activeView === "cellar" || activeView === "bottling") &&
                selectedBatch.stage === "cellar")
            ) && (
              <p className="panel-hint">
                Select a batch at the matching production stage to take action.
              </p>
            )}
        </>
      )}

      {activeView === "market" && (
        <>
          <PanelHeading eyebrow="Sell inventory" title="Market desk" />
          <SelectList
            items={game.inventory
              .filter((batch) => batch.stage === "bottled")
              .map((batch) => ({
                id: batch.id,
                title: batch.name,
                detail: `${formatNumber(batch.quantity)} bottles · Q${batch.quality}`,
              }))}
            selectedId={selectedBatch?.id ?? ""}
            onSelect={onSelectBatch}
            empty="Bottle a wine batch before entering the market."
          />
          {selectedBatch?.stage === "bottled" && (
            <>
              <BatchDetails pack={pack} batch={selectedBatch} compact />
              <div className="market-list">
                {game.markets.map((market) => (
                  <MarketOption
                    key={market.id}
                    market={market}
                    selected={market.id === selectedMarket?.id}
                    onSelect={() => onSelectMarket(market.id)}
                  />
                ))}
              </div>
              <div className="sale-estimate">
                <span>Estimated sale</span>
                <strong>{formatMoney(estimateSale(selectedBatch, selectedMarket))}</strong>
              </div>
              <ActionButton
                pack={pack}
                icon="action.sell"
                label={`Sell via ${selectedMarket.name}`}
                detail="Completes this batch's vineyard-to-market journey"
                accent
                disabled={busy || game.player.actionsRemaining === 0}
                testId="sell-action"
                onClick={() =>
                  onAction({
                    type: "sellWine",
                    batchId: selectedBatch.id,
                    marketId: selectedMarket.id,
                  })
                }
              />
            </>
          )}
        </>
      )}

      {activeView === "finance" && (
        <>
          <PanelHeading eyebrow="Season ledger" title="Finances" />
          <MetricGrid
            metrics={[
              ["Cash", formatMoney(game.player.cash)],
              ["Revenue", formatMoney(game.player.revenue)],
              ["Expenses", formatMoney(game.player.expenses)],
              ["Operating profit", signedMoney(game.player.revenue - game.player.expenses)],
              ["Inventory value", formatMoney(inventoryValue(game.inventory))],
              ["Estate value", formatMoney(game.player.cash + inventoryValue(game.inventory))],
            ]}
          />
          <div className="finance-note">
            <strong>Victory requirement</strong>
            <p>
              Finish profitable and with a higher estate value than{" "}
              {game.rival.name}.
            </p>
          </div>
        </>
      )}

      {activeView === "people" && (
        <>
          <PanelHeading eyebrow="Estate operations" title="People & equipment" />
          <MetricGrid
            metrics={[
              ["Seasonal crew", "18"],
              ["Winemaker", "Available"],
              ["Equipment", "88%"],
              ["Weekly payroll", "€12,000"],
            ]}
          />
          <div className="staff-card">
            <IconSlot pack={pack} slot="nav.people" size={30} />
            <div>
              <strong>Harvest team is ready</strong>
              <p>
                Staffing is intentionally simplified in v0.1.0 so every decision
                stays focused on the production loop.
              </p>
            </div>
          </div>
        </>
      )}

      {activeView === "rivals" && (
        <>
          <PanelHeading eyebrow="Competitive intelligence" title={game.rival.name} />
          <div className="rival-profile">
            <IconSlot pack={pack} slot="event.rival" size={34} />
            <div>
              <span>Pressure level</span>
              <strong>{game.rival.pressure}%</strong>
            </div>
          </div>
          <div className="progress-track rival-progress">
            <span style={{ width: `${game.rival.pressure}%` }} />
          </div>
          <MetricGrid
            metrics={[
              ["Estate value", formatMoney(game.rival.estateValue)],
              ["Reputation", String(game.rival.reputation)],
              ["Value gap", signedMoney(game.player.cash + inventoryValue(game.inventory) - game.rival.estateValue)],
              ["Next event", game.week < 6 ? "Week 6" : "Resolved"],
            ]}
          />
          <div className="finance-note">
            <strong>Known strategy</strong>
            <p>
              Monte Verde protects volume, escalates price pressure, and grows
              steadily each week.
            </p>
          </div>
        </>
      )}

      {activeView === "settings" && (
        <>
          <PanelHeading eyebrow="Game & presentation" title="Settings" />
          <div className="pack-card">
            <span>Active visual pack</span>
            <strong>{pack.name}</strong>
            <small>Version {pack.version} · manifest schema {pack.schemaVersion}</small>
            <p>{pack.description}</p>
          </div>
          <div className="update-settings-card">
            <div className="update-settings-heading">
              <IconSlot pack={pack} slot="status.update" size={25} />
              <div>
                <strong>Automatic updates</strong>
                <p>Wine King always checks once at startup.</p>
              </div>
            </div>
            <label htmlFor="update-interval">Background check interval</label>
            <select
              id="update-interval"
              value={updateIntervalMinutes}
              onChange={(event) =>
                onSetUpdateInterval(
                  Number(event.target.value) as UpdateIntervalMinutes,
                )
              }
            >
              {UPDATE_INTERVAL_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes === 0
                    ? "Off"
                    : `Every ${minutes} minutes`}
                </option>
              ))}
            </select>
            <div className="update-settings-status" aria-live="polite">
              <span>{updateStatus}</span>
              <small>
                {updateLastCheckedAt
                  ? `Last checked ${updateLastCheckedAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "No completed check yet"}
              </small>
              {updateError && <em>{updateError}</em>}
            </div>
            <button
              type="button"
              className="check-update-button"
              disabled={updateChecking}
              onClick={onCheckForUpdates}
              data-testid="check-updates"
            >
              <IconSlot pack={pack} slot="action.check" size={19} />
              {updateChecking ? "Checking…" : "Check now"}
            </button>
          </div>
          <div className="action-stack utility-actions">
            <ActionButton
              pack={pack}
              icon="common.save"
              label="Save season"
              detail="Write the current deterministic game state"
              disabled={busy}
              testId="save-game"
              onClick={onSave}
            />
            <ActionButton
              pack={pack}
              icon="common.load"
              label="Load season"
              detail="Restore the latest save"
              disabled={busy}
              testId="load-game"
              onClick={onLoad}
            />
            <ActionButton
              pack={pack}
              icon="common.new"
              label="Start new season"
              detail="Reset all progress"
              disabled={busy}
              testId="new-game"
              onClick={onNewGame}
            />
          </div>
        </>
      )}
    </aside>
  );
}

function BottomDeck({
  pack,
  game,
  selectedBatchId,
  onSelectBatch,
  onSelectRival,
}: {
  pack: AssetPack;
  game: GameState;
  selectedBatchId: string;
  onSelectBatch: (id: string) => void;
  onSelectRival: () => void;
}) {
  return (
    <section className="bottom-deck">
      <div className="deck-panel inventory-panel">
        <div className="deck-heading">
          <div>
            <span>Cellar inventory</span>
            <strong>{game.inventory.length} active batches</strong>
          </div>
          <small>{formatNumber(game.inventory.reduce((sum, batch) => sum + batch.quantity, 0))} units</small>
        </div>
        <div className="wine-cards">
          {game.inventory.slice(0, 3).map((batch) => (
            <button
              type="button"
              key={batch.id}
              className={`wine-card ${selectedBatchId === batch.id ? "selected" : ""}`}
              onClick={() => onSelectBatch(batch.id)}
            >
              <img src={assetUrl(pack, batch.assetKey)} alt="" />
              <span>
                <strong>{batch.name}</strong>
                <small>{titleCase(batch.stage)} · Q{batch.quality}</small>
                <b>{formatNumber(batch.quantity)}</b>
              </span>
            </button>
          ))}
          {game.inventory.length === 0 && (
            <p className="empty-state">No wine remains in inventory.</p>
          )}
        </div>
      </div>

      <div className="deck-panel forecast-panel">
        <div className="deck-heading">
          <div>
            <span>Harvest forecast</span>
            <strong>Parcel readiness</strong>
          </div>
          <small>Week {game.week}</small>
        </div>
        <div className="forecast-rows">
          {game.vineyards.map((plot) => (
            <div key={plot.id}>
              <span>{plot.variety}</span>
              <div className="dot-scale" aria-label={`${plot.ripeness}% ripe`}>
                {[20, 40, 60, 80, 100].map((mark) => (
                  <i
                    key={mark}
                    className={plot.ripeness >= mark ? "filled" : ""}
                  />
                ))}
              </div>
              <strong>{plot.harvested ? "Harvested" : `${plot.yieldTons} t`}</strong>
            </div>
          ))}
        </div>
      </div>

      <button type="button" className="deck-panel rival-card" onClick={onSelectRival}>
        <div className="deck-heading">
          <div>
            <span>Rivals</span>
            <strong>{game.rival.name}</strong>
          </div>
          <small>High attention</small>
        </div>
        <div className="rival-card-body">
          <IconSlot pack={pack} slot="event.rival" size={38} />
          <div>
            <span>Market pressure</span>
            <strong>{game.rival.pressure}%</strong>
            <p>
              {game.week < 6
                ? "Competitive activity is building toward a major move."
                : "Review the latest rival intelligence."}
            </p>
          </div>
        </div>
        <span className="text-link">
          View rival activity
          <IconSlot pack={pack} slot="common.next" size={16} />
        </span>
      </button>
    </section>
  );
}

function Footer({
  pack,
  game,
  busy,
  onAdvance,
}: {
  pack: AssetPack;
  game: GameState;
  busy: boolean;
  onAdvance: () => void;
}) {
  return (
    <footer className="footer-bar">
      <div className="save-state">
        <span className="save-dot" />
        Deterministic season · Seed {game.seed}
      </div>
      <div className="turn-status">
        <span>{game.player.actionsRemaining} actions remaining</span>
        <div className="season-track">
          <span style={{ width: `${(game.week / game.maxWeeks) * 100}%` }} />
        </div>
        <strong>Week {game.week}</strong>
      </div>
      <button
        type="button"
        className="advance-button"
        disabled={busy || game.seasonComplete || Boolean(game.activeEvent)}
        onClick={onAdvance}
        data-testid="end-week"
      >
        End week
        <IconSlot pack={pack} slot="common.next" size={18} />
      </button>
    </footer>
  );
}

function EventModal({
  pack,
  game,
  busy,
  onChoose,
}: {
  pack: AssetPack;
  game: GameState;
  busy: boolean;
  onChoose: (choiceId: string) => void;
}) {
  const event = game.activeEvent!;
  return (
    <div className="modal-layer cinematic-layer" role="dialog" aria-modal="true">
      <div
        className="event-modal"
        style={{ backgroundImage: `url("${assetUrl(pack, event.assetKey)}")` }}
      >
        <div className="event-content">
          <span className="event-kicker">Rival encounter · Week {game.week}</span>
          <h2>{event.title}</h2>
          <h3>{event.subtitle}</h3>
          <p>{event.body}</p>
          <div className="event-choices">
            {event.choices.map((choice) => (
              <button
                type="button"
                key={choice.id}
                disabled={busy}
                onClick={() => onChoose(choice.id)}
                data-testid={`event-choice-${choice.id}`}
              >
                <span>
                  <strong>{choice.label}</strong>
                  <small>{choice.consequence}</small>
                </span>
                <IconSlot pack={pack} slot="common.next" size={18} />
              </button>
            ))}
          </div>
        </div>
        <div className="event-estate-mark">
          <IconSlot pack={pack} slot="event.rival" size={22} />
          <span>Monte Verde</span>
        </div>
      </div>
    </div>
  );
}

function SeasonSummary({
  pack,
  game,
  busy,
  onNewGame,
}: {
  pack: AssetPack;
  game: GameState;
  busy: boolean;
  onNewGame: () => void;
}) {
  const result = game.seasonResult!;
  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <div className="season-summary">
        <IconSlot
          pack={pack}
          slot={result.victory ? "status.prestige" : "event.rival"}
          size={44}
        />
        <span className="eyebrow">Season one complete</span>
        <h2>{result.victory ? "The estate prevails" : "Monte Verde holds the lead"}</h2>
        <p>{result.summary}</p>
        <MetricGrid
          metrics={[
            ["Operating profit", signedMoney(result.operatingProfit)],
            ["Your estate", formatMoney(result.estateValue)],
            ["Monte Verde", formatMoney(result.rivalEstateValue)],
            ["Reputation", String(game.player.reputation)],
          ]}
        />
        <button type="button" disabled={busy} onClick={onNewGame}>
          Start another season
        </button>
      </div>
    </div>
  );
}

function PanelHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="panel-heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
    </div>
  );
}

function MetricGrid({ metrics }: { metrics: Array<[string, string]> }) {
  return (
    <div className="metric-grid">
      {metrics.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function SelectList({
  items,
  selectedId,
  onSelect,
  empty = "Nothing is available yet.",
}: {
  items: Array<{ id: string; title: string; detail: string }>;
  selectedId: string;
  onSelect: (id: string) => void;
  empty?: string;
}) {
  if (!items.length) return <p className="empty-state">{empty}</p>;
  return (
    <div className="select-list">
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          className={selectedId === item.id ? "selected" : ""}
          onClick={() => onSelect(item.id)}
        >
          <span>
            <strong>{item.title}</strong>
            <small>{item.detail}</small>
          </span>
          <i />
        </button>
      ))}
    </div>
  );
}

function HealthBlock({ plot }: { plot: VineyardPlot }) {
  return (
    <div className="health-block">
      <div>
        <span>Ripeness</span>
        <strong>{plot.ripeness}%</strong>
        <div className="progress-track"><span style={{ width: `${plot.ripeness}%` }} /></div>
      </div>
      <div>
        <span>Vine health</span>
        <strong>{plot.health}%</strong>
        <div className="progress-track"><span style={{ width: `${plot.health}%` }} /></div>
      </div>
      <div className="yield-line">
        <span>Expected yield</span>
        <strong>{plot.yieldTons} tonnes</strong>
      </div>
    </div>
  );
}

function ActionButton({
  pack,
  icon,
  label,
  detail,
  disabled,
  accent = false,
  onClick,
  testId,
}: {
  pack: AssetPack;
  icon: string;
  label: string;
  detail: string;
  disabled: boolean;
  accent?: boolean;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      type="button"
      className={`action-button ${accent ? "accent" : ""}`}
      disabled={disabled}
      onClick={onClick}
      data-testid={testId}
    >
      <IconSlot pack={pack} slot={icon} size={24} />
      <span>
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
      <IconSlot pack={pack} slot="common.next" size={17} />
    </button>
  );
}

function BatchDetails({
  pack,
  batch,
  compact = false,
}: {
  pack: AssetPack;
  batch: WineBatch;
  compact?: boolean;
}) {
  return (
    <div className={`batch-details ${compact ? "compact" : ""}`}>
      <img src={assetUrl(pack, batch.assetKey)} alt="" />
      <div>
        <span>{batch.variety}</span>
        <strong>{batch.name}</strong>
        <small>
          {formatNumber(batch.quantity)} bottles · Quality {batch.quality}
        </small>
        <b>{formatMoney(batch.basePrice)} base price</b>
      </div>
    </div>
  );
}

function MarketOption({
  market,
  selected,
  onSelect,
}: {
  market: MarketChannel;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={selected ? "selected" : ""}
      onClick={onSelect}
    >
      <span>
        <strong>{market.name}</strong>
        <small>{market.description}</small>
      </span>
      <b>{market.trend >= 0 ? "+" : ""}{market.trend}%</b>
    </button>
  );
}

function NoticeList({ game }: { game: GameState }) {
  return (
    <div className="notice-list">
      <strong>Estate log</strong>
      {game.notices.slice(0, 2).map((notice) => (
        <p key={notice.id}>{notice.message}</p>
      ))}
    </div>
  );
}

function inventoryValue(inventory: WineBatch[]): number {
  return Math.round(
    inventory.reduce((sum, batch) => {
      const factor =
        batch.stage === "bottled" ? 0.9 : batch.stage === "cellar" ? 0.68 : 0.35;
      return sum + batch.quantity * batch.basePrice * factor;
    }, 0),
  );
}

function estimateSale(batch: WineBatch, market: MarketChannel): number {
  const demandFactor = 0.6 + market.demand / 250;
  const qualityFactor = 0.78 + batch.quality / 300;
  return Math.round(
    batch.quantity *
      batch.basePrice *
      market.priceMultiplier *
      demandFactor *
      qualityFactor,
  );
}

function formatMoney(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `€${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) return `€${Math.round(value / 1_000)}K`;
  return `€${Math.round(value)}`;
}

function signedMoney(value: number): string {
  return `${value >= 0 ? "+" : "−"}${formatMoney(Math.abs(value))}`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
