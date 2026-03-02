import { type RequestDetail } from '@/services/request.service';

const formatCurrency = (value?: number) => {
  const amount = Number(value || 0);
  return `₦ ${amount.toLocaleString()}`;
};

const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

interface RequestPaymentsSectionProps {
  request: RequestDetail;
}

export function RequestPaymentsSection({ request }: RequestPaymentsSectionProps) {
  return (
    <div className="rounded-2xl bg-white p-6">
      <h3 className="mb-4 text-base font-semibold text-[#344054]">Payment Schedule</h3>
      <div className="overflow-x-auto rounded-xl border border-[#EAECF0]">
        <div className="grid grid-cols-[0.6fr_1fr_1fr_1fr_1fr] border-b border-[#EAECF0] bg-[#F9FAFB] px-4 py-3 text-sm font-medium text-[#667085]">
          <p>#</p>
          <p>Due Date</p>
          <p>Amount</p>
          <p>Paid</p>
          <p>Status</p>
        </div>
        {request.paymentSchedule?.length ? (
          request.paymentSchedule.map((payment) => (
            <div key={payment.paymentNumber} className="grid grid-cols-[0.6fr_1fr_1fr_1fr_1fr] border-b border-[#EAECF0] px-4 py-3 text-sm text-[#344054] last:border-b-0">
              <p>{payment.paymentNumber}</p>
              <p>{formatDate(payment.dueDate)}</p>
              <p>{formatCurrency(payment.amount)}</p>
              <p>{formatCurrency(payment.paidAmount)}</p>
              <p className="capitalize">{payment.status}</p>
            </div>
          ))
        ) : (
          <div className="px-4 py-10 text-center text-sm text-[#667085]">No payment schedule found</div>
        )}
      </div>
    </div>
  );
}
