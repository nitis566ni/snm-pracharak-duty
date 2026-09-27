import React from 'react';
import { History, Shield, Clock, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HistoryView: React.FC = () => {
  const { auditLogs } = useApp();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#0A3A33] tracking-tight">
          History
        </h2>
        <p className="text-xs text-[#4A726B] mt-0.5">
          Change History — The 200 most recent recorded actions across the system.
        </p>
      </div>

      {/* History Table (Direct reproduction of screenshot 2) */}
      <div className="bg-white rounded-3xl border border-[#E2EFEB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5FAF8] border-b border-[#E2EFEB] text-[#4A726B] font-bold">
                <th className="py-3.5 px-6 w-52">When</th>
                <th className="py-3.5 px-6">Who</th>
                <th className="py-3.5 px-6 w-28 text-center">Action</th>
                <th className="py-3.5 px-6">Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBF4F2]">
              {auditLogs.map((log) => {
                const actionLower = log.action.toLowerCase();
                let badgeClass = 'bg-sky-50 text-sky-800 border border-sky-200';
                if (actionLower === 'create') {
                  badgeClass = 'bg-[#0F4C42] text-white';
                } else if (actionLower === 'delete') {
                  badgeClass = 'bg-rose-100 text-rose-900 border border-rose-200';
                } else if (actionLower === 'update') {
                  badgeClass = 'bg-emerald-50 text-emerald-800 border border-emerald-200';
                }

                return (
                  <tr key={log.id} className="hover:bg-[#F9FCFB] transition-colors">
                    {/* When */}
                    <td className="py-3.5 px-6 font-mono text-[11px] text-[#0A3A33]">
                      {new Date(log.timestamp).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                      })}
                    </td>

                    {/* Who */}
                    <td className="py-3.5 px-6 font-medium text-[#0A3A33]">
                      {log.actorEmail || 'indeedinspiring@gmail.com'}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-6 text-center">
                      <span className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-medium font-mono ${badgeClass}`}>
                        {actionLower}
                      </span>
                    </td>

                    {/* Entity */}
                    <td className="py-3.5 px-6 font-mono text-xs text-[#4A726B]">
                      {log.entityId} <span className="text-[#9BB6B0] font-sans font-normal ml-2">({log.details})</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
