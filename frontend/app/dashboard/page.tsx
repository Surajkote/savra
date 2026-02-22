"use client";
import { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, PointElement, LineElement,
    ArcElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale, LinearScale, BarElement, PointElement, LineElement,
    ArcElement, Title, Tooltip, Legend, Filler
);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface OverallData {
    total_teachers: number;
    total_assessments: number;
    total_lessons: number;
    total_quizzes: number;
    total_question_papers: number;
    total_activities: number;
    grades: string[];
    subjects: string[];
    leaderboard: { teacher_name: string; score: number; assessments: number; lessons: number; grades_taught: string[] }[];
    grade_chart: { labels: string[]; data: number[] };
    activity_chart: { labels: string[]; data: number[] };
    monthly_chart: { labels: string[]; data: number[] };
    top_teacher: { teacher_name: string; score: number; assessments: number; lessons: number } | null;
}

const STAT_CARDS = [
    { key: "total_teachers", label: "Active Teachers", icon: "👩‍🏫", color: "#6366f1", bg: "rgba(99,102,241,0.10)" },
    { key: "total_lessons", label: "Lessons Created", icon: "📖", color: "#10b981", bg: "rgba(16,185,129,0.10)" },
    { key: "total_assessments", label: "Assessments Made", icon: "📝", color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
    { key: "total_quizzes", label: "Quizzes Conducted", icon: "🧠", color: "#f43f5e", bg: "rgba(244,63,94,0.10)" },
    { key: "total_activities", label: "Total Activities", icon: "📊", color: "#8b5cf6", bg: "rgba(139,92,246,0.10)" },
];

const DOUGHNUT_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#14b8a6"];

export default function OverallAnalyticsPage() {
    const [data, setData] = useState<OverallData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/api/overall`)
            .then((r) => r.json())
            .then((d) => { setData(d); setLoading(false); });
    }, []);

    if (loading) return (
        <div className="loading"><div className="spinner" /><p>Loading analytics...</p></div>
    );
    if (!data) return null;

    /* ── Chart data ── */
    const doughnutData = {
        labels: data.activity_chart.labels,
        datasets: [{
            data: data.activity_chart.data,
            backgroundColor: DOUGHNUT_COLORS,
            borderColor: "rgba(255,255,255,0.06)",
            borderWidth: 2,
            hoverOffset: 8,
        }],
    };

    const gradeBarData = {
        labels: data.grade_chart.labels,
        datasets: [{
            label: "Assessments",
            data: data.grade_chart.data,
            backgroundColor: data.grade_chart.labels.map((_, i) =>
                `hsla(${200 + i * 30}, 80%, 60%, 0.82)`),
            borderRadius: 8,
            borderSkipped: false,
        }],
    };

    const monthlyLineData = {
        labels: data.monthly_chart.labels,
        datasets: [{
            label: "Total Activities",
            data: data.monthly_chart.data,
            borderColor: "#6366f1",
            backgroundColor: "rgba(99,102,241,0.12)",
            pointBackgroundColor: "#818cf8",
            pointBorderColor: "#fff",
            pointRadius: 6,
            pointHoverRadius: 9,
            tension: 0.45,
            fill: true,
            borderWidth: 2.5,
        }],
    };

    const chartBaseOpts = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 700 },
        plugins: {
            legend: { labels: { color: "#94a3b8", font: { size: 12 }, boxWidth: 14, padding: 14 } },
            tooltip: {
                backgroundColor: "#1a2235",
                borderColor: "rgba(99,102,241,0.35)",
                borderWidth: 1,
                titleColor: "#f1f5f9",
                bodyColor: "#94a3b8",
            },
        },
        scales: {
            x: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#94a3b8" } },
            y: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#94a3b8", stepSize: 1 } },
        },
    };

    /* AI pulse insights */
    const top = data.leaderboard[0];
    const bottom = data.leaderboard[data.leaderboard.length - 1];
    const avgAssessments = (data.total_assessments / (data.total_teachers || 1)).toFixed(1);
    const mostActiveGrade = data.grade_chart.labels[
        data.grade_chart.data.indexOf(Math.max(...data.grade_chart.data))
    ];

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">📈 Overall Analytics</h1>
                <p className="page-subtitle">School-wide performance overview — all teachers, grades &amp; activities</p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 16, marginBottom: 28 }}>
                {STAT_CARDS.map(({ key, label, icon, color, bg }) => {
                    const val = data[key as keyof OverallData] as number;
                    return (
                        <div key={key} style={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--border)",
                            borderRadius: 16,
                            padding: "20px 22px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            transition: "transform 0.2s, border-color 0.2s",
                            cursor: "default",
                        }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                                (e.currentTarget as HTMLDivElement).style.borderColor = color + "55";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.transform = "";
                                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)" }}>{label}</span>
                                <span style={{ background: bg, borderRadius: 8, padding: "6px 8px", fontSize: 18 }}>{icon}</span>
                            </div>
                            <div style={{ fontSize: 40, fontWeight: 900, color, lineHeight: 1, letterSpacing: "-0.03em" }}>{val}</div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row 1: Grade Bar + Activity Doughnut */}
            <div className="chart-row" style={{ marginBottom: 24 }}>
                <div className="card" style={{ height: 360 }}>
                    <div className="card-title">📊 Assessments by Grade</div>
                    <div style={{ height: 290 }}>
                        <Bar data={gradeBarData} options={{
                            ...chartBaseOpts,
                            plugins: { ...chartBaseOpts.plugins, legend: { display: false } },
                        }} />
                    </div>
                </div>

                <div className="card" style={{ height: 360, display: "flex", flexDirection: "column" }}>
                    <div className="card-title">🎯 Activity Type Breakdown</div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ height: 260, width: "100%" }}>
                            <Doughnut data={doughnutData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                animation: { duration: 700 },
                                cutout: "62%",
                                plugins: {
                                    legend: { position: "bottom" as const, labels: { color: "#94a3b8", font: { size: 12 }, padding: 14 } },
                                    tooltip: {
                                        backgroundColor: "#1a2235",
                                        borderColor: "rgba(99,102,241,0.35)",
                                        borderWidth: 1,
                                        titleColor: "#f1f5f9",
                                        bodyColor: "#94a3b8",
                                    },
                                },
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 2: Monthly Trend (full width) */}
            <div className="card chart-full" style={{ height: 300, marginBottom: 24 }}>
                <div className="card-title">📅 Monthly Activity Trend</div>
                <div style={{ height: 230 }}>
                    <Line data={monthlyLineData} options={{
                        ...chartBaseOpts,
                        plugins: { ...chartBaseOpts.plugins, legend: { display: false } },
                    }} />
                </div>
            </div>

            {/* Bottom Row: Top Teacher Spotlight + AI Insights */}
            <div className="chart-row">
                {/* Top Teacher */}
                <div className="card">
                    <div className="card-title">🏆 Top Performer</div>
                    {top && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: "50%",
                                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 24, flexShrink: 0,
                                }}>👑</div>
                                <div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{top.teacher_name}</div>
                                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Highest performance score</div>
                                </div>
                                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                                    <div style={{ fontSize: 40, fontWeight: 900, color: "#818cf8", letterSpacing: "-0.03em", lineHeight: 1 }}>{top.score.toFixed(1)}</div>
                                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>/ 10</div>
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                                {[
                                    { label: "Assessments", val: top.assessments, color: "#f59e0b" },
                                    { label: "Lessons", val: top.lessons, color: "#10b981" },
                                    { label: "Grades", val: top.grades_taught.length, color: "#6366f1" },
                                ].map(({ label, val, color }) => (
                                    <div key={label} style={{
                                        background: "var(--bg-secondary)", borderRadius: 12,
                                        padding: "12px 14px", textAlign: "center",
                                    }}>
                                        <div style={{ fontSize: 26, fontWeight: 800, color }}>{val}</div>
                                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Grades Taught</div>
                                <div className="teacher-tags">
                                    {top.grades_taught.map((g) => (
                                        <span key={g} className="badge badge-indigo">Grade {g}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Pulse Insights */}
                <div className="card">
                    <div className="card-title">🤖 AI Pulse Summary</div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Real-time insights from your data</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                            {
                                icon: "🏅", color: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.3)",
                                text: `${top?.teacher_name} has the highest score (${top?.score.toFixed(1)}/10) with ${top?.assessments} assessments and ${top?.lessons} lessons.`,
                            },
                            {
                                icon: "📉", color: "rgba(244,63,94,0.10)", border: "rgba(244,63,94,0.25)",
                                text: `${bottom?.teacher_name} has the lowest score (${bottom?.score.toFixed(1)}/10) — consider additional support.`,
                            },
                            {
                                icon: "📚", color: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.25)",
                                text: `${mostActiveGrade} leads in assessments. Average per teacher: ${avgAssessments} assessments.`,
                            },
                            {
                                icon: "🔢", color: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)",
                                text: `${data.total_activities} total activities across ${data.grades.length} grades and ${data.subjects.length} subjects.`,
                            },
                        ].map((item, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "flex-start", gap: 12,
                                background: item.color,
                                border: `1px solid ${item.border}`,
                                borderRadius: 12, padding: "12px 14px",
                            }}>
                                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
