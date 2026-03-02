import { Inbox, Plus } from 'lucide-react';

export function RequestsSection() {
  return (
    <div className="rounded-2xl bg-white p-8">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-[18px] font-semibold tracking-[-0.36px] text-[#1b2559]">Requests</h3>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-[#0a6054] px-4 py-2 text-[13px] font-medium text-white opacity-40 transition-opacity hover:opacity-60"
          disabled
        >
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2F4F7]">
          <Inbox className="h-8 w-8 text-[#98a2b3]" />
        </div>
        <div className="text-center">
          <p className="text-[15px] font-medium text-[#344054]">No requests yet</p>
          <p className="mt-1 text-[13px] text-[#98a2b3]">
            Farmer requests and applications will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
