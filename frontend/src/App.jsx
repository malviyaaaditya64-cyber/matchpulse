import React, { useEffect, useState } from "react";
import { api } from "./api";
import SignalBars from "./components/SignalBars";
import PerformanceForecast from "./components/analytics/PerformanceForecast";
import AnomalyDetection from "./components/analytics/AnomalyDetection";
import MatchInsights from "./components/analytics/MatchInsights";
import EarlyWarningSignals from "./components/analytics/EarlyWarningSignals";
import TeamPerformanceRadar from "./components/intelligence/TeamPerformanceRadar";
import MatchPressure from "./components/intelligence/MatchPressure";
import NarrativeThemes from "./components/intelligence/NarrativeThemes";
import TeamIntelligence from "./components/intelligence/TeamIntelligence";
import ExecutiveInsights from "./components/intelligence/ExecutiveInsights";
import SentimentTrend from "./components/intelligence/SentimentTrend";
import NarrativeShift from "./components/intelligence/NarrativeShift";
import NarrativeAlerts from "./components/intelligence/NarrativeAlerts";
import CorrelationPanel from "./components/CorrelationPanel";
import MatchTranscripts from "./components/MatchTranscripts";
import Login from "./components/Login";
import KPIGrid from "./components/dashboard/KPIGrid";

import TeamBanner from "./components/layout/TeamBanner";
import TopHeader from "./components/layout/TopHeader";
import Sidebar from "./components/layout/Sidebar";


export default function App() {
  const [loggedIn, setLoggedIn] = useState(api.isLoggedIn());
  const [sports, setSports] = useState([]);
  const [sport, setSport] = useState(null);
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState(null);
  const [season, setSeason] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");
  const [activeNavItem, setActiveNavItem] = useState("overview");
  const [placeholderLabel, setPlaceholderLabel] = useState("");

  useEffect(() => {
    if (!loggedIn) return;

    api
      .listSports()
      .then((s) => {
        setSports(s);
        if (s.length) setSport(s[0]);
      })
      .catch((e) => setError(e.message));
  }, [loggedIn]);

  useEffect(() => {
    if (!sport) return;

    setTeam(null);
    setSeason(null);
    setAnalysis(null);

    api
      .listTeams(sport)
      .then((t) => {
        setTeams(t);
        if (t.length) setTeam(t[0]);
      })
      .catch((e) => setError(e.message));
  }, [sport]);

  useEffect(() => {
    if (!team) return;

    setError(null);

    Promise.all([api.getSeason(team), api.getAnalysis(team)])
      .then(([s, a]) => {
        setSeason(s);
        setAnalysis(a);
      })
      .catch((e) => setError(e.message));
  }, [team]);

  const wins = season?.filter((m) => m.result === "W").length ?? 0;
  const draws = season?.filter((m) => m.result === "D").length ?? 0;
  const losses = season?.filter((m) => m.result === "L").length ?? 0;

  const avgSentiment = season?.length
    ? (
        season.reduce((s, m) => s + m.sentiment, 0) / season.length
      ).toFixed(2)
    : "—";

  const SCROLL_TARGETS = {
    "sentiment-trend": "section-sentiment-trend",
    "narrative-shift": "section-narrative-shift",
    "anomaly-detection": "section-anomaly-detection",
    "early-warnings": "section-early-warnings",
    "team-intelligence": "section-team-intelligence",
    "executive-insights": "section-executive-insights",
    correlation: "section-correlation",
    "lag-analysis": "section-correlation",
    "granger-causality": "section-correlation",
  };

  const PLACEHOLDER_LABELS = {
    reports: "Reports",
    "data-explorer": "Data Explorer",
    methodology: "Methodology",
  };

  const handleNavItemClick = (item) => {
    setActiveNavItem(item);

    if (item === "overview") {
      setTab("overview");
      return;
    }
    if (item === "press") {
      setTab("press");
      return;
    }
    if (PLACEHOLDER_LABELS[item]) {
      setTab("placeholder");
      setPlaceholderLabel(PLACEHOLDER_LABELS[item]);
      return;
    }
    const targetId = SCROLL_TARGETS[item];
    if (targetId) {
      setTab("overview");
      requestAnimationFrame(() => {
        setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
      });
    }
  };

  const handleChangeTeamClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      const el = document.getElementById("team-select");
      el?.focus();
    }, 300);
  };

  const handleLogout = () => {
    api.logout();
    setLoggedIn(false);
    setSports([]);
    setSport(null);
    setTeams([]);
    setTeam(null);
    setSeason(null);
    setAnalysis(null);
    setError(null);
  };

  if (!loggedIn) {
    return <Login onSuccess={() => setLoggedIn(true)} />;
  }

  return (
    <div className="dashboard-container">
      <Sidebar
        team={team}
        matchCount={season?.length || 0}
        activeNavItem={activeNavItem}
        onNavItemClick={handleNavItemClick}
        onLogout={handleLogout}
        onChangeTeamClick={handleChangeTeamClick}
      />

      <main className="main-content">
        <TopHeader
          sports={sports}
          selectedSport={sport}
          onSportSelect={setSport}
          teams={teams}
          selectedTeam={team}
          onTeamSelect={setTeam}
        />

        {error && (
          <div
            style={{
              color: "var(--coral)",
              background: "var(--coral-dim)",
              border: "1px solid var(--coral)",
              borderRadius: 8,
              padding: "12px 16px",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            {error} — seed demo data with{" "}
            <code>python seed_demo_data.py</code> and start the backend.
          </div>
        )}

        {season && (
          <>
            <div
              style={{
                display: "flex",
                gap: 4,
                borderBottom: "1px solid var(--border)",
                marginBottom: 20,
              }}
            >
              {[
                { id: "overview", label: "Overview" },
                { id: "press", label: "Press Room" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    fontWeight: 600,
                    padding: "10px 4px",
                    marginRight: 20,
                    border: "none",
                    borderBottom:
                      tab === t.id
                        ? "2px solid var(--accent)"
                        : "2px solid transparent",
                    background: "transparent",
                    color:
                      tab === t.id
                        ? "var(--accent)"
                        : "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <>
                {/* Row 1 — Team banner + Performance Trend */}
                <div className="overview-top-row">
                  <TeamBanner
                    team={team}
                    sport={sport}
                    wins={wins}
                    draws={draws}
                    losses={losses}
                    matchCount={season.length}
                  />
                  <PerformanceForecast season={season} />
                </div>

                {/* Row 2 — KPI cards */}
                <KPIGrid
                  wins={wins}
                  draws={draws}
                  losses={losses}
                  avgSentiment={avgSentiment}
                />

                {/* Row 3 — Recent Anomalies / Key Match Insights / Early Warning / Radar */}
                <div className="analytics-grid">
                  <div className="col-3" id="section-anomaly-detection"><AnomalyDetection season={season} /></div>
                  <div className="col-4"><MatchInsights season={season} /></div>
                  <div className="col-2" id="section-early-warnings"><EarlyWarningSignals season={season} /></div>
                  <div className="col-3"><TeamPerformanceRadar season={season} /></div>
                </div>

                {/* Row 4 — Match Pressure / Narrative Themes / Team Intelligence / Executive Insights */}
                <div className="analytics-grid">
                  <div className="col-3"><MatchPressure season={season} /></div>
                  <div className="col-3"><NarrativeThemes season={season} /></div>
                  <div className="col-3" id="section-team-intelligence"><TeamIntelligence season={season} /></div>
                  <div className="col-3" id="section-executive-insights"><ExecutiveInsights season={season} /></div>
                </div>

                {/* Row 5 — Sentiment Trend Timeline / Narrative Shift / Narrative Alerts */}
                <div className="analytics-grid">
                  <div className="col-5" id="section-sentiment-trend"><SentimentTrend season={season} /></div>
                  <div className="col-4" id="section-narrative-shift"><NarrativeShift season={season} /></div>
                  <div className="col-3"><NarrativeAlerts season={season} /></div>
                </div>

                {/* Row 6 — Blame-shifting / Confidence / Correlation */}
                <div className="analytics-grid">
                  <div className="col-4">
                    <SignalBars
                      season={season}
                      dataKey="blame"
                      color="var(--coral)"
                      title="Blame-shifting"
                      hint="Positive = blames referee/umpire/luck/injuries · negative = self-accountability"
                    />
                  </div>
                  <div className="col-4">
                    <SignalBars
                      season={season}
                      dataKey="confidence"
                      color="var(--accent)"
                      title="Confidence"
                      hint="Positive = assertive language · negative = hedging language"
                    />
                  </div>
                  <div className="col-4" id="section-correlation">
                    {analysis ? (
                      <CorrelationPanel analysis={analysis} />
                    ) : (
                      <div className="intel-card">
                        <div className="intel-card-title">Does negativity predict a losing streak?</div>
                        <div className="intel-empty">Loading correlation analysis…</div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {tab === "placeholder" && (
              <div className="intel-card" style={{ maxWidth: 480, margin: "40px auto", textAlign: "center", padding: "32px 28px" }}>
                <div className="intel-card-title" style={{ fontSize: 16, marginBottom: 8 }}>{placeholderLabel}</div>
                <div className="intel-empty" style={{ fontSize: 13 }}>
                  This section isn't built yet — it needs its own data view and hasn't been wired up.
                  Let us know if you'd like this feature added.
                </div>
              </div>
            )}

            {tab === "press" && (
              <section
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-card)",
                  borderRadius: 14,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 17,
                    fontWeight: 600,
                    marginBottom: 3,
                    color: "var(--text-primary)",
                  }}
                >
                  Press Room
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 12.5,
                    color: "var(--text-muted)",
                    marginBottom: 18,
                  }}
                >
                  The actual transcript behind every score — colored
                  highlights show exactly what language drove the sentiment,
                  blame, and confidence numbers.
                </div>

                <MatchTranscripts season={season} team={team} />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
