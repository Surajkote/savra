"use client";
import { useEffect, useState, useCallback } from "react";
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, PointElement, LineElement,
    Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale, LinearScale, BarElement, PointElement, LineElement,
    Title, Tooltip, Legend, Filler
);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface TeacherBasic { teacher_id: string; teacher_name: string; }
interface TeacherDetail {
    teacher_name: string;
    score: number;
    grades: string[];
    subjects: string[];
    all_subjects: string[];
    grade_subject_data: Record<string, Record<string, number>>;
    timeline_by_month: Record<string, Record<string, number>>;
    months: string[];
    most_taught_subject: string;
    total_lessons: number;
    total_quizzes: number;
    total_question_papers: number;
    total_assessments: number;
}

const SUBJECT_COLORS: Record<string, string> = {
    Mathematics: "rgba(99,102,241,0.85)",
    Science: "rgba(16,185,129,0.85)",
    English: "rgba(245,158,11,0.85)",
    "Social Studies": "rgba(244,63,94,0.85)",
    Hindi: "rgba(139,92,246,0.85)",
    Physics: "rgba(14,165,233,0.85)",
    Chemistry: "rgba(251,146,60,0.85)",
};

function subjectColor(s: string) {
    return SUBJECT_COLORS[s] || "rgba(148,163,184,0.85)";
}

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<TeacherBasic[]>([]);
    const [selected, setSelected] = useState<string>("");
    const [detail, setDetail] = useState<TeacherDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<string>("");

    useEffect(() => {
        fetch(`${API}/api/teachers`)
            .then((r) => r.json())
            .then((d) => {
                setTeachers(d.teachers);
                if (d.teachers.length > 0) setSelected(d.teachers[0].teacher_name);
                setLoading(false);
            });
    }, []);

    const fetchDetail = useCallback((name: string) => {
        setDetailLoading(true);
        fetch(`${API}/api/teacher/${encodeURIComponent(name)}`)
            .then((r) => r.json())
            .then((d) => {
                setDetail(d);
                setSelectedMonth(d.months?.[0] || "");
                setDetailLoading(false);
            });
    }, []);

    useEffect(() => { if (selected) fetchDetail(selected); }, [selected, fetchDetail]);

    if (loading) return <div className="loading"><div className="spinner" /><p>Loading...</p></div>;

    let stackedChartData = null;
    let timelineChartData = null;

    if (detail) {
        const grades = detail.grades;
        const subjects = detail.subjects;

        stackedChartData = {
            labels: grades.map((g) => `Grade ${g}`),
            datasets: subjects.map((subj) => ({
                label: subj,
                data: grades.map((g) => detail.grade_subject_data[g]?.[subj] || 0),
                backgroundColor: subjectColor(subj),
                borderColor: subjectColor(subj).replace("0.85", "1"),
                borderWidth: 1,
                borderRadius: 6,
            })),
        };

        const monthData = detail.timeline_by_month[selectedMonth] || {};
        const sortedDates = Object.keys(monthData).sort();
        timelineChartData = {
            labels: sortedDates.map((d) => d.slice(5)),
            datasets: [
                {
                    label: "Assessments",
                    data: sortedDates.map((d) => monthData[d]),
                    borderColor: "#6366f1",
                    backgroundColor: "rgba(99,102,241,0.12)",
                    pointBackgroundColor: "#818cf8",
                    pointBorderColor: "#fff",
                    pointRadius: 6,
                    pointHoverRadius: 9,
                    tension: 0.45,
                    fill: true,
                    borderWidth: 2.5,
                },
            ],
        };
    }

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 700, easing: "easeInOutQuart" as const },
        plugins: {
            legend: {
                display: true,
                labels: { color: "#94a3b8", font: { size: 12 }, boxWidth: 14, padding: 14 },
            },
            tooltip: {
                backgroundColor: "#1a2235",
                borderColor: "rgba(99,102,241,0.35)",
                borderWidth: 1,
                titleColor: "#f1f5f9",
                bodyColor: "#94a3b8",
            },
        },
        scales: {
            x: {
                stacked: true,
                grid: { color: "rgba(255,255,255,0.04)" },
                ticks: { color: "#94a3b8" },
                title: { display: true, text: "Grades", color: "#64748b", font: { size: 12, weight: 600 as const } },
            },
            y: {
                stacked: true,
                grid: { color: "rgba(255,255,255,0.05)" },
                ticks: { color: "#94a3b8", stepSize: 1 },
                title: { display: true, text: "No. of Assessments", color: "#64748b", font: { size: 12, weight: 600 as const } },
            },
        },
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 700, easing: "easeInOutQuart" as const },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#1a2235",
                borderColor: "rgba(99,102,241,0.35)",
                borderWidth: 1,
                titleColor: "#f1f5f9",
                bodyColor: "#94a3b8",
                callbacks: {
                    label: (ctx: import('chart.js').TooltipItem<'line'>) => `  ${ctx.parsed.y ?? 0} assessment${(ctx.parsed.y ?? 0) !== 1 ? "s" : ""}`,
                },
            },
        },
        scales: {
            x: {
                grid: { color: "rgba(255,255,255,0.04)" },
                ticks: { color: "#94a3b8", font: { size: 12 } },
                title: { display: true, text: "Date (MM-DD)", color: "#64748b", font: { size: 12, weight: 600 as const } },
            },
            y: {
                beginAtZero: true,
                grid: { color: "rgba(255,255,255,0.05)" },
                ticks: { color: "#94a3b8", stepSize: 1 },
                title: { display: true, text: "No. of Assessments", color: "#64748b", font: { size: 12, weight: 600 as const } },
            },
        },
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">👩‍🏫 Teachers</h1>
                <p className="page-subtitle">Per-teacher breakdown of assessments and activity</p>
            </div>

            <div className="select-wrap" style={{ marginBottom: 28 }}>
                <label>📌 Teacher:</label>
                <select value={selected} onChange={(e) => setSelected(e.target.value)}>
                    {teachers.map((t) => (
                        <option key={t.teacher_id} value={t.teacher_name}>{t.teacher_name}</option>
                    ))}
                </select>
            </div>

            {detailLoading && <div className="loading"><div className="spinner" /><p>Loading teacher data...</p></div>}

            {!detailLoading && detail && stackedChartData && timelineChartData && (
                <>
                    <div className="chart-row">
                        {/* Stacked Bar */}
                        <div className="card" style={{ height: 360 }}>
                            <div className="card-title">Grade vs Assessments by Subject</div>
                            <div style={{ height: "290px" }}>
                                <Bar data={stackedChartData} options={barOptions} />
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="card" style={{ height: 360 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                <div className="card-title" style={{ marginBottom: 0 }}>Assessment Timeline</div>
                                <div className="select-wrap" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: "12px" }}>Month:</label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        style={{ fontSize: "12px" }}
                                    >
                                        {detail.months.map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ height: "270px" }}>
                                <Line data={timelineChartData} options={lineOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Summary below charts */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        {/* Left: score + subjects */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div className="insight-box indigo-accent">
                                <div className="insight-label">⭐ Relative Score — {detail.teacher_name}</div>
                                <div className="score-display">{detail.score.toFixed(2)}</div>
                                <div className="score-label">out of 10</div>
                            </div>
                            <div className="insight-box green-accent">
                                <div className="insight-label">📐 Grades Taught</div>
                                <div className="teacher-tags" style={{ marginTop: 6 }}>
                                    {detail.grades.map((g) => (
                                        <span key={g} className="badge badge-green">Grade {g}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="insight-box amber-accent">
                                <div className="insight-label">📚 Subjects Taught</div>
                                <div className="teacher-tags" style={{ marginTop: 6 }}>
                                    {(detail.all_subjects && detail.all_subjects.length > 0
                                        ? detail.all_subjects
                                        : detail.subjects
                                    ).map((s) => (
                                        <span key={s} className="badge badge-amber">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: activity breakdown */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div className="insight-box" style={{ borderLeft: "3px solid #f59e0b" }}>
                                <div className="insight-label">📊 Activity Breakdown</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                                    {[
                                        { label: "Lessons", val: detail.total_lessons, color: "#10b981", bg: "rgba(16,185,129,0.10)", icon: "📖" },
                                        { label: "Quizzes", val: detail.total_quizzes, color: "#6366f1", bg: "rgba(99,102,241,0.10)", icon: "🧠" },
                                        { label: "Question Papers", val: detail.total_question_papers, color: "#f43f5e", bg: "rgba(244,63,94,0.10)", icon: "📝" },
                                        { label: "Total Assessments", val: detail.total_assessments, color: "#f59e0b", bg: "rgba(245,158,11,0.10)", icon: "✅" },
                                    ].map(({ label, val, color, bg, icon }) => (
                                        <div key={label} style={{ background: bg, borderRadius: 12, padding: "14px 16px" }}>
                                            <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                                            <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
                                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="insight-box amber-accent">
                                <div className="insight-label">📚 Most Taught Subject</div>
                                <div className="insight-value" style={{ marginTop: 8, fontSize: 22 }}>{detail.most_taught_subject}</div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

