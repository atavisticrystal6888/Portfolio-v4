"use client";

import { useRef, useEffect } from "react";
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from "chart.js";
import { useTheme } from "@/hooks/useTheme";
import styles from "./SkillsRadar.module.css";

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const SKILL_DATA = {
  labels: ["Product Strategy", "Data Analytics", "SQL & Python", "UX Research", "Stakeholder Mgmt", "Technical PM"],
  datasets: [
    {
      label: "Proficiency",
      data: [85, 90, 80, 75, 85, 80],
      borderColor: "var(--accent)",
      backgroundColor: "rgba(99, 102, 241, 0.15)",
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: "var(--accent)",
    },
  ],
};

const CATEGORIES = [
  { name: "Product", skills: ["PRDs & Roadmaps", "User Research", "A/B Testing", "Growth Strategy", "Metrics Design"] },
  { name: "Data", skills: ["Python", "SQL", "Pandas", "Scikit-learn", "Tableau"] },
  { name: "Technical", skills: ["Next.js", "React", "TypeScript", "Git", "REST APIs"] },
  { name: "Soft Skills", skills: ["Stakeholder Mgmt", "Cross-functional", "Presentation", "Problem Solving"] },
];

export function SkillsRadar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const { mode } = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;

    const textColor = mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)";
    const gridColor = mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "radar",
      data: SKILL_DATA,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { display: false },
            grid: { color: gridColor },
            pointLabels: { color: textColor, font: { size: 12 } },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.raw}%`,
            },
          },
        },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [mode]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.chart}>
        <canvas ref={canvasRef} aria-label="Skills radar chart" role="img" />
      </div>
      <div className={styles.categories}>
        {CATEGORIES.map((cat) => (
          <div key={cat.name} className={styles.category}>
            <h4 className={styles.catTitle}>{cat.name}</h4>
            <div className={styles.tags}>
              {cat.skills.map((s) => (
                <span key={s} className={styles.tag}>{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
