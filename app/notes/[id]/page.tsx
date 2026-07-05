'use client';

import { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { useParams } from 'next/navigation';

interface VersionItem {
    _id: string;
    createdAt: string;
}

export default function EditorPage() {
    const params = useParams();
    const id = params?.id as string;
    
    const { docId, content, isSyncing, initDocument, fetchServerState, updateContent, restoreVersion } = useEditorStore();
    const [versions, setVersions] = useState<VersionItem[]>([]);
    const [showSidebar, setShowSidebar] = useState(false);

    // 1. Instant Local Load & Background Sync
    useEffect(() => {
        if (!id) return;
        
        // Load instantly from IndexedDB (0 network latency)
        initDocument(id);

        // Fetch server state in the background safely
        fetchServerState(id);

        // Keep syncing in background every 0.5s
        const intervalId = setInterval(() => fetchServerState(id), 500);
        return () => clearInterval(intervalId);
    }, [id, initDocument, fetchServerState]);

    // 2. Fetch Version History List
    const fetchVersions = async () => {
        if (!id) return;
        try {
            const res = await fetch(`/api/versions?docId=${id}`);
            if (res.ok) {
                const data = await res.json();
                setVersions(data.versions);
            }
        } catch (error) {
            console.error("Failed to fetch versions", error);
        }
    };

    const saveSnapshot = async () => {
        if (!id) return;
        try {
            const res = await fetch('/api/versions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ docId: id }),
            });
            if (res.ok) {
                fetchVersions(); // Refresh the sidebar list
            }
        } catch (error) {
            console.error("Failed to save snapshot", error);
        }
    };

    const toggleSidebar = () => {
        if (!showSidebar) fetchVersions();
        setShowSidebar(!showSidebar);
    };


    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex selection:bg-indigo-500/30 overflow-hidden">
            {/* Main Editor Body */}
            <div className="flex-1 flex flex-col items-center p-4 sm:p-8 relative">
                <div className="w-full max-w-5xl flex flex-col h-[calc(100vh-4rem)]">
                    <header className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800/60 text-sm">
                        <div className="flex items-center gap-3 text-neutral-400">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                            <span className="font-medium tracking-wide">Doc: <span className="text-neutral-200">{docId}</span></span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors duration-300 ${
                                isSyncing 
                                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                                    : 'bg-neutral-800/50 text-neutral-400 border border-neutral-700'
                            }`}>
                                {isSyncing ? 'Syncing...' : 'Saved'}
                            </span>
                            <button
                                onClick={saveSnapshot}
                                className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors duration-300"
                            >
                                Snapshot
                            </button>
                            <button
                                onClick={toggleSidebar}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border transition-colors duration-300 ${
                                    showSidebar 
                                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                                    : 'bg-neutral-800/50 text-neutral-400 border-neutral-700 hover:text-neutral-200'
                                }`}
                            >
                                {showSidebar ? 'Hide History' : 'History'}
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 relative group">
                        <textarea
                            className="w-full h-full p-6 bg-neutral-900/40 border border-neutral-800/50 rounded-xl shadow-2xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all duration-300 text-lg leading-relaxed text-neutral-200 placeholder:text-neutral-600 backdrop-blur-sm scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent"
                            value={content}
                            onChange={(e) => updateContent(e.target.value)}
                            placeholder="Start drafting your master plan..."
                            spellCheck={false}
                        />
                    </div>
                </div>
            </div>

            {/* Version Timeline Sidebar */}
            {showSidebar && (
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
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}