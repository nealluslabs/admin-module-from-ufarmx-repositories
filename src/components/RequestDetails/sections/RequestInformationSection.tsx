import { type RequestDetail } from '@/services/request.service';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#EAECF0] py-3 last:border-b-0">
      <span className="text-sm text-[#667085]">{label}</span>
      <span className="text-right text-sm font-medium text-[#344054]">{value || 'N/A'}</span>
    </div>
  );
}

const formatCurrency = (value?: number) => {
  const amount = Number(value || 0);
  return `₦ ${amount.toLocaleString()}`;
};

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

interface RequestInformationSectionProps {
  request: RequestDetail;
  retailerName: string;
}

export function RequestInformationSection({ request, retailerName }: RequestInformationSectionProps) {
  const productTotalFromLines = (request.products || []).reduce((sum, item) => {
    return sum + toNumber(item.price) * toNumber(item.quantity);
  }, 0);

  const productPrice = toNumber(request.financingDetails?.productPrice) || productTotalFromLines;
  const totalAmount =
    toNumber(request.financingDetails?.totalAmount) ||
    toNumber(request.totalAmount) ||
    (toNumber(request.remainingAmount) + toNumber(request.downPaymentAmount)) ||
    productPrice;
  const interest = toNumber(request.financingDetails?.interest) || Math.max(totalAmount - productPrice, 0);

  return (
    <div className="rounded-2xl bg-white p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-[#EAECF0] p-4">
          <h3 className="mb-2 text-base font-semibold text-[#344054]">Request Information</h3>
          <InfoRow label="Request Type" value={(request.requestType || 'N/A').replaceAll('_', ' ')} />
          <InfoRow label="Farmer Name" value={request.farmerName || 'N/A'} />
          <InfoRow label="Farmer Phone" value={request.farmerPhone || 'N/A'} />
          <InfoRow label="Retailer" value={retailerName} />
          <InfoRow label="Created At" value={formatDate(request.createdAt)} />
          <InfoRow label="Updated At" value={formatDate(request.updatedAt)} />
        </div>
        <div className="rounded-xl border border-[#EAECF0] p-4">
          <h3 className="mb-2 text-base font-semibold text-[#344054]">Finance Summary</h3>
          <InfoRow label="Product Price" value={formatCurrency(productPrice)} />
          <InfoRow label="Interest" value={formatCurrency(interest)} />
          <InfoRow label="Total Amount" value={formatCurrency(totalAmount)} />
          <InfoRow label="Down Payment" value={formatCurrency(request.downPaymentAmount)} />
          <InfoRow label="Remaining Amount" value={formatCurrency(request.remainingAmount)} />
          <InfoRow label="Requested Tenor" value={request.requestedTenorWeeks ? `${request.requestedTenorWeeks} weeks` : 'N/A'} />
          <InfoRow label="Approved Tenor" value={request.approvedTenorWeeks ? `${request.approvedTenorWeeks} weeks` : 'N/A'} />
          <InfoRow label="Coverage Percent" value={request.coveragePercent !== undefined ? `${request.coveragePercent}%` : 'N/A'} />
        </div>
      </div>
      <div className="mt-6 grid gap-4 rounded-xl border border-[#EAECF0] p-4">
        <h3 className="text-base font-semibold text-[#344054]">Context</h3>
        <InfoRow label="Retailer Note" value={request.note || 'N/A'} />
        <InfoRow label="Rejection Reason" value={request.rejectionReason || 'N/A'} />
      </div>
    </div>
  );
}
