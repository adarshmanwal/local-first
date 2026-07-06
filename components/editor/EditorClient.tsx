'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useEditorStore } from '@/store/useEditorStore';
import { VersionSidebar } from './VersionSidebar';
import { ShareDocument } from './ShareDocument';

interface VersionItem {
    _id: string;
    createdAt: string;
}

interface EditorClientProps {
    docId: string;
    title: string;
    initialContent: string;
    role: 'Owner' | 'Editor' | 'Viewer';
}

export function EditorClient({ docId: initialDocId, title, initialContent, role }: EditorClientProps) {
    const { docId, content, isSyncing, initDocument, fetchServerState, updateContent } = useEditorStore();
    const [versions, setVersions] = useState<VersionItem[]>([]);
    const [showSidebar, setShowSidebar] = useState(false);

    const isViewer = role === 'Viewer';
    const canEdit = !isViewer;

    useEffect(() => {
        if (!initialDocId) return;

        initDocument(initialDocId);

        fetchServerState(initialDocId);

        const intervalId = setInterval(() => fetchServerState(initialDocId), 1000);
        return () => clearInterval(intervalId);
    }, [initialDocId, initDocument, fetchServerState]);

    const fetchVersions = async () => {
        if (!initialDocId) return;
        try {
            const res = await fetch(`/api/versions?docId=${initialDocId}`);
            if (res.ok) {
                const data = await res.json();
                setVersions(data.versions);
            }
        } catch (error) {
            console.error("Failed to fetch versions", error);
        }
    };

    const saveSnapshot = async () => {
        if (!canEdit || !initialDocId) return;
        try {
            const res = await fetch('/api/versions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ docId: initialDocId }),
            });
            if (res.ok) {
                fetchVersions();
            }
        } catch (error) {
            console.error("Failed to save snapshot", error);
        }
    };

    const toggleSidebar = () => {
        if (!showSidebar) fetchVersions();
        setShowSidebar(!showSidebar);
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!canEdit) return;
        updateContent(e.target.value);
    };

    const displayContent = docId === initialDocId ? content : initialContent;

    return (
        <>
            <div className="flex-1 flex flex-col items-center p-4 sm:p-8 relative">
                <div className="w-full max-w-5xl flex flex-col h-[calc(100vh-4rem)]">
                    <header className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800/60 text-sm">
                        <div className="flex items-center gap-3 text-neutral-400">
                            <Link href="/" className="p-1.5 rounded-md hover:bg-neutral-800 hover:text-indigo-400 transition-colors mr-1" title="Back to Notes">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
                                </svg>
                            </Link>
                            <span className="font-medium tracking-wide">
                                <span className="text-neutral-200">{title}</span>
                                <span className="ml-2 px-2 py-0.5 rounded bg-neutral-800 text-[10px] uppercase">{role}</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <ShareDocument docId={initialDocId} isOwner={role === 'Owner'} />
                            {canEdit && (
                                <>
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors duration-300 ${isSyncing
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
                                </>
                            )}
                            <button
                                onClick={toggleSidebar}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border transition-colors duration-300 ${showSidebar
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
                            value={displayContent}
                            onChange={handleTextChange}
                            placeholder={isViewer ? "Waiting for content..." : "Start drafting your master plan..."}
                            spellCheck={false}
                            readOnly={isViewer}
                        />
                    </div>
                </div>
            </div>

            <VersionSidebar
                versions={versions}
                showSidebar={showSidebar}
                role={role}
            />
        </>
    );
}
