'use client';

import { useState, useRef } from 'react';
import { addCollaborator } from '@/app/actions/collaborator';

interface ShareDocumentProps {
    docId: string;
    isOwner: boolean;
}

export function ShareDocument({ docId, isOwner }: ShareDocumentProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);
    const [isPending, setIsPending] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    if (!isOwner) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPending(true);
        setStatus(null);

        const formData = new FormData(e.currentTarget);
        
        try {
            const res = await addCollaborator(formData);
            if (res.error) {
                setStatus({ type: 'error', message: res.error });
            } else if (res.success) {
                setStatus({ type: 'success', message: res.success });
                formRef.current?.reset();
                setTimeout(() => setIsOpen(false), 2000);
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Something went wrong' });
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border transition-colors duration-300 ${isOpen
                        ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20'
                    }`}
            >
                Share
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-sm font-semibold text-neutral-200 mb-3">Add Collaborator</h4>
                    
                    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <input type="hidden" name="documentId" value={docId} />
                        
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input 
                                type="email" 
                                name="email" 
                                id="email" 
                                required 
                                placeholder="user@example.com"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="role" className="sr-only">Role</label>
                            <select 
                                name="role" 
                                id="role"
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-indigo-500"
                            >
                                <option value="Viewer">Viewer (Read-only)</option>
                                <option value="Editor">Editor (Can edit)</option>
                            </select>
                        </div>

                        {status && (
                            <div className={`text-xs p-2 rounded-lg ${status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                {status.message}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isPending}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                            {isPending ? 'Adding...' : 'Add'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
