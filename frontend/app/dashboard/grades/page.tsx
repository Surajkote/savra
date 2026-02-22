"use client";
import { useEffect, useState, useCallback } from "react";
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, ArcElement,
    Title, Tooltip, Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface GradeDetail {
    grade: number;
    total_assessments: number;
    teacher_data: { teacher: string; count: number }[];
    teachers: string[];
}

const DONUT_COLORS = [
    "rgba(99,102,241,0.85)",
    "rgba(16,185,129,0.85)",
    "rgba(245,158,11,0.85)",
    "rgba(244,63,94,0.85)",
    "rgba(139,92,246,0.85)",
    "rgba(14,165,233,0.85)",
];

export default function GradesPage() {
    const [grades, setGrades] = useState<string[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<string>("");
    const [detail, setDetail] = useState<GradeDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetch(`${API}/api/grades`)
            .then((r) => r.json())
            .then((d) => {
                setGrades(d.grades);
                if (d.grades.length > 0) setSelectedGrade(d.grades[0]);
                setLoading(false);
            });
    }, []);

    const fetchDetail = useCallback((grade: string) => {
        setDetailLoading(true);
        fetch(`${API}/api/grade/${grade}`)
            .then((r) => r.json())
            .then((d) => { setDetail(d); setDetailLoading(false); });
    }, []);

    useEffect(() => { if (selectedGrade) fetchDetail(selectedGrade); }, [selectedGrade, fetchDetail]);

    if (loading) return <div className="loading"><div className="spinner" /><p>Loading...</p></div>;

    const barData = detail
        ? {
            labels: [`Grade ${detail.grade}`],
            datasets: [
                {
                    label: "Assessments",
                    data: [detail.total_assessments],
                    backgroundColor: "rgba(99,102,241,0.85)",
                    borderColor: "rgba(99,102,241,1)",
                    borderWidth: 2,
                    borderRadius: 10,
                },
            ],
        }
        : null;

    const barOptions = {
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
                    label: (ctx: import('chart.js').TooltipItem<'bar'>) => {
                        const v = ctx.parsed.y ?? 0;
                        return `  ${v} assessment${v !== 1 ? 's' : ''}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: { color: "rgba(255,255,255,0.04)" },
                ticks: { color: "#94a3b8" },
                title: { display: true, text: "Grade", color: "#64748b", font: { size: 12, weight: 600 as const } },
            },
            y: {
                beginAtZero: true,
                grid: { color: "rgba(255,255,255,0.05)" },
                ticks: { color: "#94a3b8", stepSize: 1 },
                title: { display: true, text: "No. of Assessments", color: "#64748b", font: { size: 12, weight: 600 as const } },
            },
        },
    };

    const donutTeachers = detail?.teacher_data.filter((t) => t.count > 0) || [];
    const donutData = {
        labels: donutTeachers.map((t) => t.teacher),
        datasets: [
            {
                data: donutTeachers.map((t) => t.count),
                backgroundColor: donutTeachers.map((_, i) => DONUT_COLORS[i % DONUT_COLORS.length]),
                borderColor: "#1a2235",
                borderWidth: 3,
                hoverOffset: 12,
            },
        ],
    };

    const donutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 700, easing: "easeInOutQuart" as const },
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: { color: "#94a3b8", font: { size: 12 }, padding: 14, boxWidth: 14 },
            },
            tooltip: {
                backgroundColor: "#1a2235",
                borderColor: "rgba(99,102,241,0.35)",
                borderWidth: 1,
                titleColor: "#f1f5f9",
                bodyColor: "#94a3b8",
                callbacks: {
                    label: (ctx: import('chart.js').TooltipItem<'doughnut'>) => {
                        const v = ctx.parsed;
                        return `  ${ctx.label}: ${v} assessment${v !== 1 ? 's' : ''}`;
                    },
                },
            },
        },
        cutout: "62%",
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">📊 Gradewise Analytics</h1>
                <p className="page-subtitle">Assessment breakdown per grade and teacher contribution</p>
            </div>

            <div className="select-wrap" style={{ marginBottom: 28 }}>
                <label>📌 Grade:</label>
                <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
                    {grades.map((g) => (
                        <option key={g} value={g}>Grade {g}</option>
                    ))}
                </select>
            </div>

            {detailLoading && <div className="loading"><div className="spinner" /><p>Loading grade data...</p></div>}

            {!detailLoading && detail && barData && (
                <>
                    <div className="chart-row">
                        <div className="card" style={{ height: 360 }}>
                            <div className="card-title">Assessments — Grade {detail.grade}</div>
                            <div style={{ height: "290px" }}>
                                <Bar data={barData} options={barOptions} />
                            </div>
                        </div>

                        <div className="card" style={{ height: 360 }}>
                            <div className="card-title">Teacher Contribution (by assessments)</div>
                            {donutTeachers.length > 0 ? (
                                <div style={{ height: "290px" }}>
                                    <Doughnut data={donutData} options={donutOptions} />
                                </div>
                            ) : (
                                <div className="loading" style={{ height: "270px" }}>
                                    <p style={{ color: "var(--text-muted)" }}>No assessments for this grade yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card" style={{ marginTop: 4 }}>
                        <div className="card-title">Teachers for Grade {detail.grade}</div>
                        <div className="teacher-tags">
                            {detail.teachers.map((t) => (
                                <span key={t} className="teacher-tag">{t}</span>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
