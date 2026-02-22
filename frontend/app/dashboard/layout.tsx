"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem("savra_auth") !== "true") {
            router.replace("/");
        } else {
            setChecked(true);
        }
    }, [router]);

    if (!checked) return null;

    return (
        <>
            <Sidebar />
            <main className="main-content">{children}</main>
        </>
    );
}
