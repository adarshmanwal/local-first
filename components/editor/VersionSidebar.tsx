'use client';

import { useEditorStore } from '@/store/useEditorStore';

interface VersionItem {
    _id: string;
    createdAt: string;
}

interface VersionSidebarProps {
    versions: VersionItem[];
    showSidebar: boolean;
    role: 'Owner' | 'Editor' | 'Viewer';
}

export function VersionSidebar({ versions, showSidebar, role }: VersionSidebarProps) {
    const { restoreVersion } = useEditorStore();

    if (!showSidebar) return null;

    const canRestore = role === 'Owner' || role === 'Editor';

    return (
        <div className="w-80 border-l border-neutral-800/60 bg-neutral-900/80 backdrop-blur-md h-screen p-6 overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 shrink-0">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-300 mb-6 pb-3 border-b border-neutral-800">
                Timeline
            </h3>
            {versions.length === 0 ? (
                <p className="text-xs text-neutral-500 italic text-center mt-10">No versions saved yet.</p>
            ) : (
                <div className="space-y-4">
                    {versions.map((v) => (
                        <div key={v._id} className="p-4 bg-neutral-950/50 border border-neutral-800 rounded-xl shadow-sm flex flex-col gap-3 group hover:border-neutral-700 transition-colors duration-300">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 group-hover:bg-indigo-400 transition-colors"></div>
                                <span className="text-xs text-neutral-400 font-mono tracking-tight">
                                    {new Date(v.createdAt).toLocaleString()}
                                </span>
                            </div>
                            {canRestore ? (
                                <button
                                    onClick={() => {
                                        if (confirm("Are you sure you want to revert to this version? This will instantly overwrite the current document for everyone.")) {
                                            restoreVersion(v._id);
                                        }
                                    }}
                                    className="w-full py-2 text-center bg-neutral-800 hover:bg-indigo-600 hover:text-white text-xs text-neutral-300 font-medium tracking-wide uppercase rounded-lg border border-neutral-700 hover:border-indigo-500 transition-all duration-300"
                                >
                                    Restore State
                                </button>
                            ) : (
                                <span className="text-xs text-neutral-600 text-center font-medium uppercase tracking-wide">
                                    View Only
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
