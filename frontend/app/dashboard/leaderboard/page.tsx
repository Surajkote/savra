"use client";
import { useEffect, useState, useRef } from "react";
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface TeacherEntry {
    teacher_name: string;
    score: number;
    assessments: number;
    lessons: number;
    grades_taught: number[];
}

export default function LeaderboardPage() {
    const [data, setData] = useState<TeacherEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/api/leaderboard`)
            .then((r) => r.json())
            .then((d) => { setData(d.leaderboard); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading"><div className="spinner" /><p>Loading...</p></div>;

    const sorted = [...data].sort((a, b) => a.teacher_name.localeCompare(b.teacher_name));
    const labels = sorted.map((t) => t.teacher_name);
    const scores = sorted.map((t) => t.score);

    const PALETTE = [
        "rgba(99,102,241,0.85)",
        "rgba(139,92,246,0.85)",
        "rgba(16,185,129,0.85)",
        "rgba(245,158,11,0.85)",
        "rgba(244,63,94,0.85)",
    ];

    const chartData = {
        labels,
        datasets: [
            {
                label: "Relative Teacher Performance",
                data: scores,
                backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
                borderColor: labels.map((_, i) => PALETTE[i % PALETTE.length].replace("0.85", "1")),
                borderWidth: 2,
                borderRadius: 10,
                borderSkipped: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: "easeInOutQuart" as const },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#1a2235",
                borderColor: "rgba(99,102,241,0.4)",
                borderWidth: 1,
                padding: 14,
                callbacks: {
                    title: (ctx: { label: string }[]) => ctx[0].label,
                    label: (ctx: { dataIndex: number; parsed: { y: number } }) => {
                        const t = sorted[ctx.dataIndex];
                        return [
                            `  Score: ${ctx.parsed.y.toFixed(2)} / 10`,
                            `  Assessments: ${t.assessments}`,
                            `  Grades taught: ${t.grades_taught.join(", ")}`,
                        ];
                    },
                },
                titleFont: { size: 15, weight: "bold" as const },
                bodyFont: { size: 13 },
                titleColor: "#f1f5f9",
                bodyColor: "#94a3b8",
            },
        },
        scales: {
            x: {
                grid: { color: "rgba(255,255,255,0.04)" },
                ticks: { color: "#94a3b8", font: { size: 13 } },
                title: {
                    display: true,
                    text: "Teachers",
                    color: "#64748b",
                    font: { size: 13, weight: "600" as const },
                },
            },
            y: {
                min: 0,
                max: 10,
                grid: { color: "rgba(255,255,255,0.05)" },
                ticks: { color: "#94a3b8", font: { size: 13 } },
                title: {
                    display: true,
                    text: "Relative Teacher Performance",
                    color: "#64748b",
                    font: { size: 13, weight: "600" as const },
                },
            },
        },
    };

    const best = data.reduce((a, b) => (a.score > b.score ? a : b));
    const worst = data.reduce((a, b) => (a.score < b.score ? a : b));

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">🏆 Teacher Leaderboard</h1>
                <p className="page-subtitle">Relative performance score (0–10) based on assessments and lessons</p>
            </div>

            <div className="card chart-full" style={{ height: 420 }}>
                <Bar data={chartData} options={options} />
            </div>

            <div style={{ marginTop: 40 }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "var(--text-secondary)" }}>
                    📝 Text Insights
                </h2>
                <div className="insights-row">
                    <div className="insight-box green-accent">
                        <div className="insight-label">🏅 Highest Score</div>
                        <div className="insight-value">{best.teacher_name}</div>
                        <div className="insight-sub">Score: {best.score.toFixed(2)} / 10</div>
                        <div className="insight-sub">{best.assessments} assessments · {best.lessons} lessons</div>
                    </div>
                    <div className="insight-box rose-accent">
                        <div className="insight-label">📌 Lowest Score</div>
                        <div className="insight-value">{worst.teacher_name}</div>
                        <div className="insight-sub">Score: {worst.score.toFixed(2)} / 10</div>
                        <div className="insight-sub">{worst.assessments} assessments · {worst.lessons} lessons</div>
                    </div>
                    {data.map((t) => (
                        <div key={t.teacher_name} className="insight-box indigo-accent">
                            <div className="insight-label">{t.teacher_name}</div>
                            <div className="insight-value" style={{ fontSize: "28px" }}>{t.score.toFixed(2)}</div>
                            <div className="insight-sub">
                                {t.assessments} assessments · {t.lessons} lessons · Grades: {t.grades_taught.join(", ")}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
