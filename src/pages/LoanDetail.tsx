import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Banknote, ClipboardList, ListChecks } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { loanService, type LoanDetailsResponse, type LoanInstallment } from '@/services/loan.service';
import { ROUTES } from '@/utils/routes';

const formatCurrency = (value?: number) => `₦ ${Number(value || 0).toLocaleString()}`;
const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};
const formatDateOnly = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

type LoanTab = 'overview' | 'transactions' | 'installments';

const tabs: Array<{ id: LoanTab; label: string; icon: React.ElementType }> = [
  { id: 'overview', label: 'Overview', icon: ClipboardList },
  { id: 'transactions', label: 'Transactions', icon: Banknote },
  { id: 'installments', label: 'Installments', icon: ListChecks },
];

function legLabel(leg: LoanInstallment['leg']) {
  if (leg === 'retailer_to_platform') return 'Retailer → Platform';
  return 'Farmer → Retailer';
}

const installmentStatusClasses = (status: string) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'paid') return 'bg-[#ECFDF3] text-[#027A48]';
  if (normalized === 'partially_paid') return 'bg-[#EFF8FF] text-[#175CD3]';
  if (normalized === 'overdue') return 'bg-[#FEF3F2] text-[#B42318]';
  return 'bg-[#FFF6E5] text-[#B54708]';
};

function MiniAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAECF0] text-xs font-semibold text-[#667085]">
      {initials || 'NA'}
    </div>
  );
}

const getStatusClasses = (status: string) => {
  const normalized = String(status || '').toLowerCase();
  if (['active', 'loan_created', 'posted', 'paid', 'repaid', 'completed'].includes(normalized)) {
    return 'bg-[#ECFDF3] text-[#027A48]';
  }
  if (['defaulted', 'cancelled', 'failed', 'reversed', 'overdue'].includes(normalized)) {
    return 'bg-[#FEF3F2] text-[#B42318]';
  }
  return 'bg-[#FFF6E5] text-[#B54708]';
};

export default function LoanDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LoanDetailsResponse | null>(null);
  const [activeTab, setActiveTab] = useState<LoanTab>('overview');
  const [activeInstallmentLeg, setActiveInstallmentLeg] = useState<'retailer_to_platform' | 'farmer_to_retailer'>('retailer_to_platform');
  const [markPaidModalOpen, setMarkPaidModalOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<LoanInstallment | null>(null);
  const [paidDate, setPaidDate] = useState(() => new Date().toISOString().split('T')[0] || '');
  const [reference, setReference] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await loanService.getLoanDetails(id);
        setData(response);
      } catch {
        toast.error('Failed to load loan details');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const groupedInstallments = useMemo(() => {
    const byLeg = {
      retailer_to_platform: [] as LoanInstallment[],
      farmer_to_retailer: [] as LoanInstallment[],
    };

    (data?.installments || []).forEach((item) => {
      byLeg[item.leg].push(item);
    });

    return byLeg;
  }, [data?.installments]);
  const nextRetailerPayableInstallment = useMemo(
    () => groupedInstallments.retailer_to_platform.find((item) => item.status !== 'paid') || null,
    [groupedInstallments.retailer_to_platform]
  );

  useEffect(() => {
    if (
      activeInstallmentLeg === 'retailer_to_platform' &&
      groupedInstallments.retailer_to_platform.length === 0 &&
      groupedInstallments.farmer_to_retailer.length > 0
    ) {
      setActiveInstallmentLeg('farmer_to_retailer');
    }
    if (
      activeInstallmentLeg === 'farmer_to_retailer' &&
      groupedInstallments.farmer_to_retailer.length === 0 &&
      groupedInstallments.retailer_to_platform.length > 0
    ) {
      setActiveInstallmentLeg('retailer_to_platform');
    }
  }, [
    activeInstallmentLeg,
    groupedInstallments.retailer_to_platform.length,
    groupedInstallments.farmer_to_retailer.length,
  ]);

  if (loading) {
    return <div className="px-4 py-10 text-sm text-[#667085]">Loading loan details...</div>;
  }

  if (!data) {
    return <div className="px-4 py-10 text-sm text-[#667085]">Loan not found.</div>;
  }

  const loan = data.loan;
  const request = loan.requestId;
  const farmerName = [loan.farmerId?.firstName, loan.farmerId?.lastName].filter(Boolean).join(' ').trim() || request?.farmerName || 'N/A';
  const retailerName =
    [loan.retailerUserId?.firstName, loan.retailerUserId?.lastName].filter(Boolean).join(' ').trim() ||
    loan.retailerId?.businessName ||
    loan.retailerUserId?.email ||
    'N/A';

  const openMarkPaidModal = (installment: LoanInstallment) => {
    setSelectedInstallment(installment);
    setPaidDate(new Date().toISOString().split('T')[0] || '');
    setReference('');
    setPaymentNote('');
    setMarkPaidModalOpen(true);
  };

  const handleMarkPaid = async () => {
    if (!id || !selectedInstallment) return;
    if (!paidDate) {
      toast.error('Paid date is required');
      return;
    }
    if (!reference.trim()) {
      toast.error('Transaction reference is required');
      return;
    }

    try {
      setSubmittingPayment(true);
      const response = await loanService.markRetailerInstallmentPaid(id, selectedInstallment._id, {
        paidDate: new Date(`${paidDate}T00:00:00.000Z`).toISOString(),
        reference: reference.trim(),
        note: paymentNote.trim() || undefined,
      });
      setData(response);
      setMarkPaidModalOpen(false);
      setSelectedInstallment(null);
      toast.success('Installment marked as paid');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to mark installment as paid');
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-6">
      <button
        type="button"
        onClick={() => navigate(ROUTES.LOANS)}
        className="inline-flex w-fit items-center gap-1 py-2 text-[12px] text-[rgba(44,51,57,0.95)] hover:opacity-80"
      >
        <ArrowLeft className="h-3 w-3" />
        <span>Loans</span>
        <span className="opacity-40">/</span>
        <span className="text-[rgba(122,134,147,0.95)]">{loan._id}</span>
      </button>

      <div className="rounded-2xl bg-white px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-semibold text-[#1b2559]">Loan #{loan._id.slice(-8)}</h1>
            <p className="mt-1 text-sm text-[#667085]">Request: {request?._id ? `#${request._id.slice(-8)}` : 'N/A'}</p>
            <p className="text-sm text-[#667085]">Disbursed: {formatDate(loan.disbursedAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClasses(loan.status)}`}>
              Loan: {loan.status.replaceAll('_', ' ')}
            </span>
            {request?.status ? (
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClasses(request.status)}`}>
                Request: {request.status.replaceAll('_', ' ')}
              </span>
            ) : null}
            {request?._id ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(ROUTES.REQUEST_DETAIL.replace(':id', request._id!))}
              >
                View Request
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[#344054]">Farmer Profile</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!loan.farmerId?._id) {
                  toast.error('Farmer profile is not available');
                  return;
                }
                navigate(ROUTES.FARMER_DETAIL.replace(':id', loan.farmerId._id));
              }}
            >
              View
            </Button>
          </div>
          <div className="flex items-start gap-3">
            <MiniAvatar name={farmerName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#344054]">{farmerName}</p>
              <p className="truncate text-xs text-[#667085]">{loan.farmerId?.email || 'N/A'}</p>
              <p className="truncate text-xs text-[#667085]">{loan.farmerId?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[#344054]">Retailer Profile</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!loan.retailerId?._id) {
                  toast.error('Retailer profile is not available');
                  return;
                }
                navigate(ROUTES.RETAILER_DETAIL.replace(':id', loan.retailerId._id));
              }}
            >
              View
            </Button>
          </div>
          <div className="flex items-start gap-3">
            <MiniAvatar name={retailerName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#344054]">{retailerName}</p>
              <p className="truncate text-xs text-[#667085]">{loan.retailerUserId?.email || 'N/A'}</p>
              <p className="truncate text-xs text-[#667085]">{loan.retailerUserId?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#EAECF0] p-4">
            <p className="text-xs text-[#667085]">Principal</p>
            <p className="mt-1 text-lg font-semibold text-[#344054]">{formatCurrency(loan.principalAmount)}</p>
          </div>
          <div className="rounded-xl border border-[#EAECF0] p-4">
            <p className="text-xs text-[#667085]">Disbursed</p>
            <p className="mt-1 text-lg font-semibold text-[#344054]">{formatCurrency(loan.disbursedAmount)}</p>
          </div>
          <div className="rounded-xl border border-[#EAECF0] p-4">
            <p className="text-xs text-[#667085]">Approved Tenor</p>
            <p className="mt-1 text-lg font-semibold text-[#344054]">{loan.approvedTenorWeeks} weeks</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          {tabs.map(({ id: tabId, label, icon: Icon }) => {
            const isActive = activeTab === tabId;
            return (
              <button
                key={tabId}
                type="button"
                onClick={() => setActiveTab(tabId)}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#0a6054] text-white shadow-[0_2px_8px_rgba(10,96,84,0.30)]'
                    : 'text-[#98a2b3] hover:bg-[#F0FAF8] hover:text-[#0a6054]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#90C434]' : ''}`} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="rounded-2xl bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-[#344054]">Loan Overview</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-[#EAECF0] p-4">
              <p className="text-xs text-[#667085]">Coverage Percent</p>
              <p className="mt-1 text-sm font-medium text-[#344054]">{loan.coveragePercent ?? 0}%</p>
            </div>
            <div className="rounded-xl border border-[#EAECF0] p-4">
              <p className="text-xs text-[#667085]">Disbursement Reference</p>
              <p className="mt-1 text-sm font-medium text-[#344054]">{loan.disbursementReference || 'N/A'}</p>
            </div>
            <div className="rounded-xl border border-[#EAECF0] p-4 md:col-span-2">
              <p className="text-xs text-[#667085]">Disbursement Note</p>
              <p className="mt-1 text-sm font-medium text-[#344054]">{loan.disbursementNote || 'N/A'}</p>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === 'transactions' ? (
        <div className="rounded-2xl bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-[#344054]">Transactions</h2>
          <div className="overflow-hidden rounded-xl border border-[#EAECF0]">
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] border-b border-[#EAECF0] bg-[#F9FAFB] px-4 py-3 text-sm font-medium text-[#667085]">
              <p>Date</p><p>Type</p><p>Leg</p><p>Amount</p><p>Reference</p>
            </div>
            {(data.transactions || []).length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#667085]">No transactions</div>
            ) : (
              data.transactions.map((tx) => (
                <div key={tx._id} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] border-b border-[#EAECF0] px-4 py-3 text-sm text-[#392751] last:border-b-0">
                  <p>{formatDate(tx.createdAt)}</p>
                  <p className="capitalize">{tx.type}</p>
                  <p className="capitalize">{tx.leg.replaceAll('_', ' ')}</p>
                  <p>{formatCurrency(tx.amount)}</p>
                  <p>{tx.reference || 'N/A'}</p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {activeTab === 'installments' ? (
        <div className="rounded-2xl bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-[#344054]">Installments</h2>
          <div className="rounded-xl border border-[#EAECF0] bg-[#FCFCFD] p-4">
            <div className="mb-3 flex items-center gap-6 border-b border-[#EAECF0]">
              {(['retailer_to_platform', 'farmer_to_retailer'] as const).map((leg) => {
                const isActive = activeInstallmentLeg === leg;
                return (
                  <button
                    key={leg}
                    type="button"
                    onClick={() => setActiveInstallmentLeg(leg)}
                    className={`-mb-px border-b-2 pb-2 text-sm font-medium transition-colors ${
                      isActive ? 'border-[#0A6054] text-[#0A6054]' : 'border-transparent text-[#667085] hover:text-[#344054]'
                    }`}
                  >
                    {legLabel(leg)}
                    <span className="ml-2 text-xs text-[#98A2B3]">({groupedInstallments[leg].length})</span>
                  </button>
                );
              })}
            </div>
            <div className="overflow-hidden rounded-xl border border-[#EAECF0] bg-white">
              <div className={`grid border-b border-[#EAECF0] bg-[#F9FAFB] px-4 py-3 text-sm font-medium text-[#667085] ${
                activeInstallmentLeg === 'retailer_to_platform'
                  ? 'grid-cols-[0.6fr_1fr_1fr_1fr_1fr_1fr]'
                  : 'grid-cols-[0.6fr_1fr_1fr_1fr_1fr]'
              }`}>
                <p>#</p><p>Due Date</p><p>Amount</p><p>Paid</p><p>Status</p>
                {activeInstallmentLeg === 'retailer_to_platform' ? <p>Action</p> : null}
              </div>
              {groupedInstallments[activeInstallmentLeg].length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-[#667085]">No installments</div>
              ) : (
                groupedInstallments[activeInstallmentLeg].map((item) => (
                  <div key={item._id} className={`grid border-b border-[#EAECF0] px-4 py-3 text-sm text-[#392751] last:border-b-0 ${
                    activeInstallmentLeg === 'retailer_to_platform'
                      ? 'grid-cols-[0.6fr_1fr_1fr_1fr_1fr_1fr]'
                      : 'grid-cols-[0.6fr_1fr_1fr_1fr_1fr]'
                  }`}>
                    <p>{item.installmentNumber}</p>
                    <p>{formatDateOnly(item.dueDate)}</p>
                    <p>{formatCurrency(item.amount)}</p>
                    <p>{formatCurrency(item.paidAmount)}</p>
                    <p>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize ${installmentStatusClasses(item.status)}`}>
                        {item.status.replaceAll('_', ' ')}
                      </span>
                    </p>
                    {activeInstallmentLeg === 'retailer_to_platform' ? (
                      <div className="text-right">
                        {item.status !== 'paid' ? (
                          nextRetailerPayableInstallment?._id === item._id ? (
                            <Button size="sm" variant="outline" onClick={() => openMarkPaidModal(item)}>
                              Mark Paid
                            </Button>
                          ) : (
                            <span className="text-xs text-[#98A2B3]">Await previous installment</span>
                          )
                        ) : (
                          <span className="text-xs text-[#98A2B3]">-</span>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={markPaidModalOpen} onOpenChange={setMarkPaidModalOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Mark Retailer Payment</DialogTitle>
            <DialogDescription>
              Capture repayment for installment {selectedInstallment?.installmentNumber || '-'} and post a repayment transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#344054]">Date Paid</label>
              <Input type="date" value={paidDate} onChange={(event) => setPaidDate(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#344054]">Transaction ID / Reference</label>
              <Input
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="e.g. TRX-2026-001"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#344054]">Note</label>
              <textarea
                value={paymentNote}
                onChange={(event) => setPaymentNote(event.target.value)}
                placeholder="Optional note"
                className="min-h-[92px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMarkPaidModalOpen(false)}
              disabled={submittingPayment}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleMarkPaid} disabled={submittingPayment}>
              {submittingPayment ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
