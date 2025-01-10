import { GraduationCap } from "lucide-react";

export function Header() {
    return (
        <header className="p-4 h-[80px] flex items-center gap-2 px-4 py-3">
            <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-lg">EduTrack</span>
        </header>
    );
}