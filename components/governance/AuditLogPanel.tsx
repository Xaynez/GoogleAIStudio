import React, { useState, useMemo } from 'react';
import type { AuditLog } from '../../types';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditLogPanelProps {
    auditLogs: AuditLog[];
}

const PAGE_SIZE = 15;

export const AuditLogPanel: React.FC<AuditLogPanelProps> = ({ auditLogs }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(auditLogs.length / PAGE_SIZE);

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return auditLogs.slice(startIndex, startIndex + PAGE_SIZE);
    }, [auditLogs, currentPage]);

    return (
        <div className="bg-surface-card/50 p-4 rounded-2xl border border-border-subtle backdrop-blur-sm space-y-4">
            <h2 className="text-xl font-bold text-text-primary font-display flex items-center gap-2">
                <History /> System Audit Log
            </h2>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-text-secondary">
                    <thead className="text-xs text-text-secondary uppercase bg-surface-elevated/50">
                        <tr>
                            <th scope="col" className="px-4 py-3">Timestamp</th>
                            <th scope="col" className="px-4 py-3">Actor</th>
                            <th scope="col" className="px-4 py-3">Event</th>
                            <th scope="col" className="px-4 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedLogs.map(log => (
                            <tr key={log.id} className="border-b border-border-subtle hover:bg-surface-elevated/50">
                                <td className="px-4 py-3 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-4 py-3 font-medium text-text-primary">{log.actor}</td>
                                <td className="px-4 py-3">{log.event}</td>
                                <td className="px-4 py-3">
                                    <pre className="text-xs bg-surface-input p-1 rounded overflow-x-auto"><code>{JSON.stringify(log.details, null, 2)}</code></pre>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-md hover:bg-surface-elevated disabled:opacity-50">
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-md hover:bg-surface-elevated disabled:opacity-50">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {auditLogs.length === 0 && (
                <div className="text-center py-8 text-text-muted">
                    No audit log entries found.
                </div>
            )}
        </div>
    );
};