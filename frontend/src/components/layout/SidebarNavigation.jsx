import React from "react";

const SidebarNavigation = ({ activeNavItem, onNavItemClick }) => {
  const sections = [
    {
      title: "MAIN",
      items: [
        { id: "overview", label: "Overview" },
        { id: "press", label: "Press Room" },
      ],
    },
    {
      title: "INTELLIGENCE",
      items: [
        { id: "sentiment-trend", label: "Sentiment Trend" },
        { id: "narrative-shift", label: "Narrative Shift" },
        { id: "anomaly-detection", label: "Anomaly Detection" },
        { id: "early-warnings", label: "Early Warnings" },
        { id: "team-intelligence", label: "Team Intelligence" },
        { id: "executive-insights", label: "Executive Insights" },
      ],
    },
    {
      title: "ANALYTICS",
      items: [
        { id: "correlation", label: "Correlation Analysis" },
        { id: "lag-analysis", label: "Lag Analysis" },
        { id: "granger-causality", label: "Granger Causality" },
      ],
    },
    {
      title: "DATA & REPORTS",
      items: [
        { id: "reports", label: "Reports" },
        { id: "data-explorer", label: "Data Explorer" },
        { id: "methodology", label: "Methodology" },
      ],
    },
  ];

  return (
    <nav className="sidebar-nav">
      {sections.map((section) => (
        <div key={section.title} className="nav-section">
          <div className="nav-section-title">{section.title}</div>
          <ul className="nav-list">
            {section.items.map((item) => (
              <li
                key={item.id}
                className={`nav-item ${activeNavItem === item.id ? "active" : ""}`}
                onClick={() => onNavItemClick(item.id)}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default SidebarNavigation;
