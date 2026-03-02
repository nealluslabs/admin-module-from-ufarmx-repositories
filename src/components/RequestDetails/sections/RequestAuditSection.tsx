import { type RequestAuditEntry } from '@/services/request.service';

const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const formatAuditAction = (action: string) =>
  action
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

interface RequestAuditSectionProps {
  loading: boolean;
  entries: RequestAuditEntry[];
}

export function RequestAuditSection({ loading, entries }: RequestAuditSectionProps) {
  return (
    <div className="rounded-2xl bg-white p-6">
      <h3 className="mb-4 text-base font-semibold text-[#344054]">Audit Log</h3>
      <div className="rounded-xl border border-[#EAECF0]">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] border-b border-[#EAECF0] bg-[#F9FAFB] px-4 py-3 text-sm font-medium text-[#667085]">
          <p>Time</p>
          <p>Action</p>
          <p>Actor</p>
          <p>Status Change</p>
        </div>
        {loading ? (
          <div className="px-4 py-10 text-center text-sm text-[#667085]">Loading audit log...</div>
        ) : entries.length ? (
          entries.map((entry) => {
            const actor =
              typeof entry.actorUserId === 'object' && entry.actorUserId
                ? [entry.actorUserId.firstName, entry.actorUserId.lastName].filter(Boolean).join(' ') ||
                  entry.actorUserId.email ||
                  entry.actorType
                : entry.actorType;
            const statusChange =
              entry.fromStatus || entry.toStatus
                ? `${entry.fromStatus || 'N/A'} → ${entry.toStatus || 'N/A'}`
                : 'N/A';

            return (
              <div
                key={entry._id}
                className="grid grid-cols-[1.2fr_1fr_1fr_1fr] border-b border-[#EAECF0] px-4 py-3 text-sm text-[#344054] last:border-b-0"
              >
                <p>{formatDate(entry.createdAt)}</p>
                <p>{formatAuditAction(entry.action)}</p>
                <p className="capitalize">{actor || 'System'}</p>
                <p className="capitalize">{statusChange}</p>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-10 text-center text-sm text-[#667085]">No audit entries yet</div>
        )}
      </div>
    </div>
  );
}
