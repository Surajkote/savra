"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = [
    { label: "Home", icon: "🏠", href: "/" },
    { label: "Teacher Leaderboard", icon: "🏆", href: "/dashboard/leaderboard" },
    { label: "Teachers", icon: "👩‍🏫", href: "/dashboard/teachers" },
    { label: "Gradewise Analytics", icon: "📊", href: "/dashboard/grades" },
    { label: "Overall Analytics", icon: "📈", href: "/dashboard" },
];

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const navigate = (href: string) => {
        router.push(href);
        setOpen(false);
    };

    return (
        <>
            <button className="hamburger-btn" onClick={() => setOpen(!open)}>☰</button>
            {open && (
                <div
                    style={{ position: "fixed", inset: 0, zIndex: 99, background: "rgba(0,0,0,0.4)" }}
                    onClick={() => setOpen(false)}
                />
            )}
            <aside className={`sidebar${open ? " open" : ""}`}>
                <div className="sidebar-logo">
                    <span>✦</span> SAVRA
                </div>
                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((item) => (
                        <div
                            key={item.href}
                            className={`nav-item${pathname === item.href ? " active" : ""}`}
                            onClick={() => navigate(item.href)}
                        >
                            <span className="icon">{item.icon}</span>
                            {item.label}
                        </div>
                    ))}
                </nav>
                <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        Savra Principal Dashboard
                    </p>
                </div>
            </aside>
        </>
    );
}
