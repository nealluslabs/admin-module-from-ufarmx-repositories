import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { loanService, type LoanListItem } from '@/services/loan.service';
import { ROUTES } from '@/utils/routes';

const formatCurrency = (value?: number) => {
  return `₦ ${Number(value || 0).toLocaleString()}`;
};

const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const getRetailerName = (loan: LoanListItem) => {
  const first = loan.retailerUserId?.firstName || '';
  const last = loan.retailerUserId?.lastName || '';
  const full = `${first} ${last}`.trim();
  return full || loan.retailerUserId?.email || 'N/A';
};

export default function LoansPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<LoanListItem[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const data = await loanService.getLoans({
          page,
          limit: pageSize,
          search: search || undefined,
        });
        setLoans(data.loans || []);
        setTotalPages(Math.max(1, data.pages || 1));
        setTotalCount(data.total || 0);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [page, pageSize, search]);

  const rows = useMemo(() => loans, [loans]);

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div>
        <h1 className="text-2xl font-medium leading-9 text-[#344054]">Loans</h1>
        <p className="text-xs leading-4 text-[#667085]">View loans, transactions, and repayment schedules</p>
      </div>

      <div className="flex items-center justify-end">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search loan, request, retailer, farmer"
          className="h-[45px] w-full max-w-[360px] border-[#E4E7EC]"
        />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white">
        <div className="grid grid-cols-[1fr_1fr_1fr_0.8fr_0.8fr_0.8fr] border-b border-[#EAECF0] bg-[#F9FAFB] px-4 py-3 text-sm font-medium text-[#667085]">
          <p>Loan</p>
          <p>Request/Farmer</p>
          <p>Retailer</p>
          <p>Disbursed</p>
          <p>Tenor</p>
          <p>Action</p>
        </div>

        {loading ? (
          <div className="px-4 py-12 text-center text-sm text-[#667085]">Loading loans...</div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-[#667085]">No loans found</div>
        ) : (
          rows.map((loan) => (
            <div key={loan._id} className="grid grid-cols-[1fr_1fr_1fr_0.8fr_0.8fr_0.8fr] border-b border-[#EAECF0] px-4 py-3 text-sm text-[#392751] last:border-b-0">
              <div>
                <p className="font-medium">#{loan._id.slice(-8)}</p>
                <p className="text-xs text-[#667085]">{formatDate(loan.createdAt)}</p>
              </div>
              <div>
                <p>{loan.requestId?._id ? `#${loan.requestId._id.slice(-8)}` : 'N/A'}</p>
                <p className="text-xs text-[#667085]">{loan.requestId?.farmerName || 'N/A'}</p>
              </div>
              <p>{getRetailerName(loan)}</p>
              <p>{formatCurrency(loan.disbursedAmount)}</p>
              <p>{loan.approvedTenorWeeks}w</p>
              <button
                type="button"
                className="text-left text-[#90C434]"
                onClick={() => navigate(ROUTES.LOAN_DETAIL.replace(':id', loan._id))}
              >
                View
              </button>
            </div>
          ))
        )}
      </div>

      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalCount}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}
