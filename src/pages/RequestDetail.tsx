import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardList, FileText, History, Landmark, ListChecks } from 'lucide-react';
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
import {
  requestService,
  type RequestAdminNote,
  type RequestAuditEntry,
  type RequestDetail,
} from '@/services/request.service';
import { RequestInformationSection } from '@/components/RequestDetails/sections/RequestInformationSection';
import { RequestProductsSection } from '@/components/RequestDetails/sections/RequestProductsSection';
import { RequestPaymentsSection } from '@/components/RequestDetails/sections/RequestPaymentsSection';
import { RequestDocumentsSection } from '@/components/RequestDetails/sections/RequestDocumentsSection';
import { RequestAuditSection } from '@/components/RequestDetails/sections/RequestAuditSection';
import { creditScoreService } from '@/services/credit-score.service';
import { deriveCreditCategory, getCreditCategoryPalette, normalizeScore } from '@/utils/credit-score';
import { ROUTES } from '@/utils/routes';

type RequestTab = 'information' | 'products' | 'payments' | 'documents' | 'audit';

const tabs: Array<{ id: RequestTab; label: string; icon: React.ElementType }> = [
  { id: 'information', label: 'Information', icon: ClipboardList },
  { id: 'products', label: 'Products', icon: ListChecks },
  { id: 'payments', label: 'Payment Schedule', icon: Landmark },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'audit', label: 'Audit Log', icon: History },
];

const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const formatCurrency = (value?: number) => {
  const amount = Number(value || 0);
  return `₦ ${amount.toLocaleString()}`;
};

const getStatusClasses = (status: string) => {
  const normalized = status.toLowerCase();
  if (['approved', 'offer_accepted', 'loan_created'].includes(normalized)) {
    return 'bg-[#ECFDF3] text-[#027A48]';
  }
  if (['admin_rejected', 'offer_rejected', 'rejected', 'cancelled'].includes(normalized)) {
    return 'bg-[#FEF3F2] text-[#B42318]';
  }
  if (['admin_under_review'].includes(normalized)) {
    return 'bg-[#EFF8FF] text-[#175CD3]';
  }
  if (['offer_sent'].includes(normalized)) {
    return 'bg-[#F4F3FF] text-[#5925DC]';
  }
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

const getNoteAuthorLabel = (note: RequestAdminNote): string => {
  const author = note.authorUserId;
  if (author && typeof author === 'object') {
    const fullName = [author.firstName, author.lastName].filter(Boolean).join(' ').trim();
    return fullName || author.email || 'Admin';
  }
  return 'Admin';
};

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [latestFarmerScore, setLatestFarmerScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RequestTab>('information');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [adminNotes, setAdminNotes] = useState<RequestAdminNote[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditTrail, setAuditTrail] = useState<RequestAuditEntry[]>([]);
  const [noteDraft, setNoteDraft] = useState('');
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [coveragePercent, setCoveragePercent] = useState('70');
  const [approvedTenorWeeks, setApprovedTenorWeeks] = useState('12');
  const [actionNote, setActionNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const retailerName = useMemo(() => {
    if (!request?.retailer) return 'N/A';
    const name = [request.retailer.firstName, request.retailer.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    return name || request.retailer.businessName || request.retailer.email || 'N/A';
  }, [request]);

  const farmerName = useMemo(() => {
    if (!request) return 'N/A';
    if (request.farmerName) return request.farmerName;
    if (request.farmer) {
      const fullName = [request.farmer.firstName, request.farmer.lastName].filter(Boolean).join(' ').trim();
      if (fullName) return fullName;
    }
    return 'N/A';
  }, [request]);

  const farmerEmail = request?.farmer?.email || request?.farmerEmail || 'N/A';
  const farmerPhone = request?.farmer?.phone || request?.farmerPhone || 'N/A';
  const farmerScoreValue = normalizeScore(
    latestFarmerScore !== null ? latestFarmerScore : request?.farmer?.creditScore
  );
  const farmerCreditScore = farmerScoreValue ?? 0;
  const farmerCategory = deriveCreditCategory(
    farmerScoreValue,
    request?.farmer?.creditScoreCategory
  );
  const farmerPalette = getCreditCategoryPalette(farmerCategory);

  const retailerCreditScore = 0;
  const retailerCategory = deriveCreditCategory(retailerCreditScore);
  const retailerPalette = getCreditCategoryPalette(retailerCategory);

  const fetchRequest = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await requestService.getRequestById(id);
      setRequest(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch request details');
      navigate(ROUTES.REQUESTS);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    if (!id) return;
    try {
      setNotesLoading(true);
      const notes = await requestService.getRequestNotes(id);
      setAdminNotes(notes);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch notes');
    } finally {
      setNotesLoading(false);
    }
  };

  const fetchAuditTrail = async () => {
    if (!id) return;
    try {
      setAuditLoading(true);
      const entries = await requestService.getRequestAuditTrail(id, { limit: 150 });
      setAuditTrail(entries);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch audit log');
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      navigate(ROUTES.REQUESTS);
      return;
    }
    fetchRequest();
    fetchNotes();
    fetchAuditTrail();
  }, [id, navigate]);

  useEffect(() => {
    const loadLatestFarmerScore = async () => {
      const farmerId = request?.farmer?._id;
      if (!farmerId) {
        setLatestFarmerScore(null);
        return;
      }

      try {
        const latest = await creditScoreService.getFarmerLatestScore(farmerId);
        if (latest && typeof latest.total_score === 'number') {
          setLatestFarmerScore(latest.total_score);
        } else {
          setLatestFarmerScore(null);
        }
      } catch {
        setLatestFarmerScore(null);
      }
    };

    loadLatestFarmerScore();
  }, [request?.farmer?._id]);

  const canMoveToReview = request?.status === 'submitted';
  const canApproveOrReject = request?.status === 'admin_under_review';
  const farmerProfileId = request?.farmer?._id || '';
  const retailerProfileId = request?.retailer_id || '';

  const handleMoveToReview = async () => {
    if (!request) return;
    try {
      setSubmittingAction(true);
      await requestService.moveToReview(request._id);
      toast.success('Request moved to admin review');
      await fetchRequest();
      await fetchAuditTrail();
    } catch (error) {
      console.error(error);
      toast.error('Failed to move request to review');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleApprove = async () => {
    if (!request) return;
    const coverage = Number(coveragePercent);
    const tenorWeeks = Number(approvedTenorWeeks);
    if (!Number.isFinite(coverage) || coverage < 0 || coverage > 100) {
      toast.error('Coverage percent must be between 0 and 100');
      return;
    }
    if (!Number.isFinite(tenorWeeks) || tenorWeeks < 1) {
      toast.error('Approved tenor must be at least 1 week');
      return;
    }

    try {
      setSubmittingAction(true);
      await requestService.approveRequest(request._id, {
        coveragePercent: coverage,
        approvedTenorWeeks: tenorWeeks,
        note: actionNote || undefined,
      });
      toast.success('Request approved and offer sent');
      setApproveModalOpen(false);
      setActionNote('');
      await fetchRequest();
      await fetchAuditTrail();
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve request');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async () => {
    if (!request) return;
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      setSubmittingAction(true);
      await requestService.rejectRequest(request._id, {
        reason: rejectionReason.trim(),
        note: actionNote || undefined,
      });
      toast.success('Request rejected');
      setRejectModalOpen(false);
      setActionNote('');
      setRejectionReason('');
      await fetchRequest();
      await fetchAuditTrail();
    } catch (error) {
      console.error(error);
      toast.error('Failed to reject request');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleAddNote = async () => {
    if (!request) return;
    const note = noteDraft.trim();
    if (!note) {
      toast.error('Please enter a note');
      return;
    }

    try {
      setAddingNote(true);
      await requestService.addRequestNote(request._id, note);
      setNoteDraft('');
      await fetchNotes();
      toast.success('Note added');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#90C434] border-t-transparent" />
      </div>
    );
  }

  if (!request) return null;

  const coveragePercentNumber = Number(coveragePercent);
  const approvedTenorWeeksNumber = Number(approvedTenorWeeks);
  const remainingAmountNumber = Number(request.remainingAmount || 0);
  const coveredAmountPreview =
    Number.isFinite(coveragePercentNumber) && coveragePercentNumber >= 0
      ? (coveragePercentNumber / 100) * remainingAmountNumber
      : 0;

  return (
    <div className="flex flex-col gap-6 pb-6">
      <button
        type="button"
        onClick={() => navigate(ROUTES.REQUESTS)}
        className="inline-flex w-fit items-center gap-1 py-2 text-[12px] text-[rgba(44,51,57,0.95)] hover:opacity-80"
      >
        <ArrowLeft className="h-3 w-3" />
        <span>Requests</span>
        <span className="opacity-40">/</span>
        <span className="text-[rgba(122,134,147,0.95)]">{request._id}</span>
      </button>

      <div className="rounded-2xl bg-white px-8 py-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[24px] font-semibold text-[#1b2559]">Request #{request._id.slice(-8)}</h1>
            <p className="mt-1 text-sm text-[#667085] capitalize">
              {(request.requestType || 'N/A').replaceAll('_', ' ')}
            </p>
            <p className="mt-2 text-sm text-[#667085]">Retailer: {retailerName}</p>
            <p className="text-sm text-[#667085]">Farmer: {request.farmerName || 'N/A'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClasses(request.status)}`}>
              {request.status.replaceAll('_', ' ')}
            </span>
            {canMoveToReview ? (
              <Button onClick={handleMoveToReview} disabled={submittingAction}>
                Move to Review
              </Button>
            ) : null}
            {canApproveOrReject ? (
              <>
                <Button
                  variant="outline"
                  className="border-[#B42318] text-[#B42318] hover:bg-[#FEF3F2]"
                  onClick={() => {
                    setActionNote('');
                    setRejectionReason('');
                    setRejectModalOpen(true);
                  }}
                  disabled={submittingAction}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    setActionNote('');
                    setCoveragePercent('70');
                    setApprovedTenorWeeks(String(request.requestedTenorWeeks || 12));
                    setApproveModalOpen(true);
                  }}
                  disabled={submittingAction}
                >
                  Approve
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[#344054]">Farmer Profile</h2>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                style={{
                  backgroundColor: farmerPalette.bgColor,
                  color: farmerPalette.textColor,
                }}
              >
                {farmerCategory} • {farmerCreditScore.toFixed(1)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!farmerProfileId) {
                    toast.error('Farmer profile is not available');
                    return;
                  }
                  navigate(ROUTES.FARMER_DETAIL.replace(':id', farmerProfileId));
                }}
              >
                View
              </Button>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MiniAvatar name={farmerName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#344054]">{farmerName}</p>
              <p className="truncate text-xs text-[#667085]">{farmerEmail}</p>
              <p className="truncate text-xs text-[#667085]">{farmerPhone}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[#344054]">Retailer Profile</h2>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex rounded-full px-2 py-1 text-xs font-medium"
                style={{
                  backgroundColor: retailerPalette.bgColor,
                  color: retailerPalette.textColor,
                }}
              >
                {retailerCategory} • {retailerCreditScore.toFixed(1)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!retailerProfileId) {
                    toast.error('Retailer profile is not available');
                    return;
                  }
                  navigate(ROUTES.RETAILER_DETAIL.replace(':id', retailerProfileId));
                }}
              >
                View
              </Button>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MiniAvatar name={retailerName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#344054]">{retailerName}</p>
              <p className="truncate text-xs text-[#667085]">{request.retailer?.email || 'N/A'}</p>
              <p className="truncate text-xs text-[#667085]">{request.retailer?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
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

          {activeTab === 'information' ? (
            <RequestInformationSection request={request} retailerName={retailerName} />
          ) : null}

          {activeTab === 'products' ? (
            <RequestProductsSection request={request} />
          ) : null}

          {activeTab === 'payments' ? (
            <RequestPaymentsSection request={request} />
          ) : null}

          {activeTab === 'documents' ? (
            <RequestDocumentsSection request={request} />
          ) : null}

          {activeTab === 'audit' ? (
            <RequestAuditSection loading={auditLoading} entries={auditTrail} />
          ) : null}
        </div>

        <div className="rounded-2xl bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#344054]">Notes</h3>
            <span className="text-xs text-[#667085]">{adminNotes.length}</span>
          </div>
          <div className="mb-3 grid gap-2">
            <textarea
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              placeholder="Add an admin note..."
              className="min-h-[90px] w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#0A6054]"
            />
            <Button
              type="button"
              onClick={handleAddNote}
              disabled={addingNote}
              className="w-full"
            >
              {addingNote ? 'Saving...' : 'Add Note'}
            </Button>
          </div>
          <div className="space-y-2">
            {notesLoading ? (
              <div className="rounded-lg border border-[#EAECF0] px-3 py-6 text-center text-xs text-[#667085]">
                Loading notes...
              </div>
            ) : adminNotes.length ? (
              adminNotes.map((note) => (
                <div key={note._id} className="rounded-lg border border-[#EAECF0] bg-[#FCFCFD] px-3 py-2">
                  <p className="text-xs font-medium text-[#0A6054]">{getNoteAuthorLabel(note)}</p>
                  <p className="whitespace-pre-wrap text-sm text-[#344054]">{note.note}</p>
                  <p className="mt-1 text-[11px] text-[#667085]">{formatDate(note.createdAt)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-[#EAECF0] px-3 py-6 text-center text-xs text-[#667085]">
                No notes yet
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>Set coverage percent and approved tenor in weeks.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1">
              <label className="text-sm font-medium text-[#344054]">Coverage Percent</label>
              <Input value={coveragePercent} onChange={(e) => setCoveragePercent(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium text-[#344054]">Approved Tenor (Weeks)</label>
              <Input value={approvedTenorWeeks} onChange={(e) => setApprovedTenorWeeks(e.target.value)} />
            </div>
            <div className="rounded-lg border border-[#EAECF0] bg-[#F9FAFB] px-3 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">Coverage Breakdown</p>
              <p className="mt-1 text-sm text-[#344054]">
                {`${Number.isFinite(coveragePercentNumber) ? coveragePercentNumber : 0}% of ${formatCurrency(remainingAmountNumber)} = ${formatCurrency(coveredAmountPreview)} for ${Number.isFinite(approvedTenorWeeksNumber) ? approvedTenorWeeksNumber : 0} weeks`}
              </p>
            </div>
            <div className="grid gap-1 rounded-lg border border-[#EAECF0] p-3">
              <label className="text-sm font-medium text-[#344054]">Approval Note</label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Add context for this approval..."
                className="min-h-[90px] w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#344054] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#0A6054]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModalOpen(false)} disabled={submittingAction}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={submittingAction}>
              {submittingAction ? 'Approving...' : 'Approve & Send Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>Provide a rejection reason for this request.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1">
              <label className="text-sm font-medium text-[#344054]">Reason</label>
              <Input value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium text-[#344054]">Admin Note (Optional)</label>
              <Input value={actionNote} onChange={(e) => setActionNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)} disabled={submittingAction}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={submittingAction}>
              {submittingAction ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
