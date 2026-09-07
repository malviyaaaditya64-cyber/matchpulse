import React, { useEffect, useState } from "react";
import { api } from "./api";
import SentimentPulse from "./components/SentimentPulse";
import SignalBars from "./components/SignalBars";
import PerformanceForecast from "./components/analytics/PerformanceForecast";
import AnomalyDetection from "./components/analytics/AnomalyDetection";
import MatchInsights from "./components/analytics/MatchInsights";
import HistoricalComparison from "./components/analytics/HistoricalComparison";
import EarlyWarningSignals from "./components/analytics/EarlyWarningSignals";
import TeamPerformanceRadar from "./components/intelligence/TeamPerformanceRadar";
import MatchPressure from "./components/intelligence/MatchPressure";
import NarrativeThemes from "./components/intelligence/NarrativeThemes";
import TeamIntelligence from "./components/intelligence/TeamIntelligence";
import ExecutiveInsights from "./components/intelligence/ExecutiveInsights";
import SentimentTrend from "./components/intelligence/SentimentTrend";
import NarrativeShift from "./components/intelligence/NarrativeShift";
import NarrativeAlerts from "./components/intelligence/NarrativeAlerts";
import StatCard from "./components/StatCard";
import CorrelationPanel from "./components/CorrelationPanel";
import SportSelector from "./components/SportSelector";
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

  const handleNavItemClick = (item) => {
    setActiveNavItem(item);

    if (item === "overview") {
      setTab("overview");
    } else if (item === "press") {
      setTab("press");
    }
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
            <TeamBanner
              team={team}
              sport={sport}
              wins={wins}
              draws={draws}
              losses={losses}
              matchCount={season.length}
            />

            <div
              style={{
                display: "flex",
                gap: 4,
                borderBottom: "1px solid var(--border)",
                marginBottom: 24,
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
                <KPIGrid
                  wins={wins}
                  draws={draws}
                  losses={losses}
                  avgSentiment={avgSentiment}
                />

                <div className="analytics-grid">
                  <section className="analytics-card analytics-card-large">
                    <div className="analytics-card-header">
                      <h3 className="analytics-card-title">Sentiment Pulse</h3>
                      <p className="analytics-card-subtitle">
                        Press-conference tone across the season · bar strip below shows result (green win, amber draw, red loss)
                      </p>
                    </div>
                    <SentimentPulse season={season} />
                  </section>

                  <section className="analytics-card analytics-card-medium">
                    <PerformanceForecast season={season} />
                  </section>

                  <section className="analytics-card analytics-card-small">
                    <AnomalyDetection season={season} />
                  </section>

                  <section className="analytics-card analytics-card-small">
                    <MatchInsights season={season} />
                  </section>

                  <section className="analytics-card analytics-card-large">
                    <HistoricalComparison season={season} />
                  </section>

                  <section className="analytics-card analytics-card-small">
                    <EarlyWarningSignals season={season} />
                  </section>

                  <div className="analytics-card analytics-card-large">
                    <div className="analytics-card-header">
                      <h3 className="analytics-card-title">Team Signals</h3>
                      <p className="analytics-card-subtitle">
                        Blame-shifting and confidence metrics across the season
                      </p>
                    </div>
                    <div className="team-signals-grid" style={{ display: "flex", gap: 24 }}>
                      <div className="team-signal-item" style={{ flex: 1 }}>
                        <SignalBars
                          season={season}
                          dataKey="blame"
                          color="var(--coral)"
                          title="Blame-shifting"
                          hint="Positive = blames referee/umpire/luck/injuries · negative = self-accountability"
                        />
                      </div>
                      <div className="team-signal-item" style={{ flex: 1 }}>
                        <SignalBars
                          season={season}
                          dataKey="confidence"
                          color="var(--amber)"
                          title="Confidence"
                          hint="Positive = assertive language · negative = hedging language"
                        />
                      </div>
                    </div>
                  </div>
                </div>


                <TeamPerformanceRadar season={season} />
                <MatchPressure season={season} />
                <NarrativeThemes season={season} />
                <TeamIntelligence season={season} />
                <ExecutiveInsights season={season} />
                <SentimentTrend season={season} />
                <NarrativeShift season={season} />
                <NarrativeAlerts season={season} />

                {analysis && <CorrelationPanel analysis={analysis} />}
              </>
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