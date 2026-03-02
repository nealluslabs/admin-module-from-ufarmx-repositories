import { useState, useMemo } from 'react';
import { Wheat } from 'lucide-react';
import { type FarmerDetail, type FarmerDetailHarvest } from '@/services/farmer.service';
import { PaginationControls } from '@/components/ui/pagination-controls';

const PAGE_SIZE = 5;

interface Props {
  farmer: FarmerDetail;
}

type ProduceTab = 'crops' | 'deposits';

function CropInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('') || 'CR';

  return (
    <div
      style={{ width: 44, height: 44, minWidth: 44 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D8F5EF] to-[#b8eee6] text-xs font-semibold text-[#0a6054]"
    >
      {initials}
    </div>
  );
}

export function FarmProduceSection({ farmer }: Props) {
  const [activeTab, setActiveTab] = useState<ProduceTab>('crops');
  const [page, setPage] = useState(1);

  const items = useMemo<FarmerDetailHarvest[]>(
    () => (activeTab === 'crops' ? farmer.harvests : farmer.cropDeposits),
    [activeTab, farmer]
  );

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const visibleRows = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = (tab: ProduceTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="rounded-2xl bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-6 pb-4">
        <div>
          <h3 className="text-[18px] font-semibold tracking-[-0.36px] text-[#1b2559]">
            Farm Produce &amp; Deposits
          </h3>
          <p className="mt-0.5 text-[12px] text-[#98a2b3]">
            {farmer.harvests.length} crops recorded
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center rounded-xl bg-[#F2F4F7] p-1 gap-1">
          {(['crops', 'deposits'] as ProduceTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className={`rounded-lg px-4 py-1.5 text-[13px] font-medium capitalize transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white text-[#0a6054] shadow-sm'
                  : 'text-[#98a2b3] hover:text-[#667085]'
              }`}
            >
              {tab === 'crops' ? 'Crops' : 'Crop Deposits'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 pb-8">
        {/* Table header */}
        <div className="mb-2 flex w-full items-center border-b border-[#F2F4F7] pb-2">
          <div className="flex flex-[2] items-center gap-3 pr-4">
            <div className="h-5 w-5 shrink-0 rounded border border-[#CBD5E1]" />
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#98a2b3]">Name</p>
          </div>
          <div className="flex-1 pr-4">
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#98a2b3]">Crop Type</p>
          </div>
          <div className="flex-1 pr-4">
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#98a2b3]">Harvest/Kg</p>
          </div>
          <div className="flex-1 pr-4">
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#98a2b3]">Harvest Date</p>
          </div>
          <div className="w-[100px] shrink-0" />
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-2">
          {visibleRows.length > 0 ? (
            visibleRows.map((item) => (
              <div
                key={item.id}
                className="group flex w-full items-center rounded-xl bg-[#FAFAFA] px-0 py-3 transition-colors hover:bg-[#F0FAF8]"
              >
                <div className="flex flex-[2] items-center gap-3 pr-4">
                  <div className="h-5 w-5 shrink-0 rounded border border-[#CBD5E1] bg-white" />
                  <CropInitials name={item.name} />
                  <p className="text-[14px] font-medium capitalize text-[#392751]">{item.name}</p>
                </div>
                <div className="flex-1 pr-4">
                  <span className="inline-flex rounded-md bg-[#F2F4F7] px-2 py-0.5 text-[12px] capitalize text-[#667085]">
                    {item.cropType}
                  </span>
                </div>
                <div className="flex-1 pr-4">
                  <p className="text-[14px] font-semibold text-[#1b2559]">{item.quantity}</p>
                </div>
                <div className="flex-1 pr-4">
                  <p className="text-[14px] text-[#667085]">{item.harvestDate}</p>
                </div>
                <div className="flex w-[100px] shrink-0 items-center justify-end">
                  <button
                    type="button"
                    className="text-[13px] font-medium text-[#0a6054] opacity-0 transition-opacity group-hover:opacity-100 hover:underline"
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F2F4F7]">
                <Wheat className="h-6 w-6 text-[#98a2b3]" />
              </div>
              <p className="text-sm font-medium text-[#344054]">No records available</p>
              <p className="text-xs text-[#667085]">
                {activeTab === 'crops' ? 'No crop records have been added.' : 'No deposit records found.'}
              </p>
            </div>
          )}
        </div>

        {items.length > PAGE_SIZE && (
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            totalItems={items.length}
            showPageSize={false}
            showRange={false}
            className="mt-6 justify-end"
            activeButtonClassName="bg-[#D8F5EF] text-[#0A6054] border-[#D8F5EF]"
            inactiveButtonClassName="bg-[#F6F6F7] border-[#E8E9ED] text-[#5E6482] hover:bg-[#EAECF0]"
            onPageChange={setPage}
            onPageSizeChange={() => undefined}
          />
        )}
      </div>
    </div>
  );
}
