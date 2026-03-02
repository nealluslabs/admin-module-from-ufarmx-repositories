import { Button } from '@/components/ui/button';
import { type RequestDetail } from '@/services/request.service';

interface RequestDocumentsSectionProps {
  request: RequestDetail;
}

export function RequestDocumentsSection({ request }: RequestDocumentsSectionProps) {
  const openDocument = (url: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="rounded-2xl bg-white p-6">
      <h3 className="mb-4 text-base font-semibold text-[#344054]">Documents</h3>
      <div className="grid gap-3 rounded-xl border border-[#EAECF0] p-4">
        <div className="flex items-center justify-between rounded-lg border border-[#EAECF0] px-4 py-3">
          <div>
            <p className="text-sm font-medium text-[#344054]">Farmer Letter Image</p>
            <p className="text-xs text-[#667085]">{request.farmerLetterImageUrl ? 'Available' : 'Not available'}</p>
          </div>
          <Button
            variant="outline"
            disabled={!request.farmerLetterImageUrl}
            onClick={() => request.farmerLetterImageUrl && openDocument(request.farmerLetterImageUrl)}
          >
            View
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-[#EAECF0] px-4 py-3">
          <div>
            <p className="text-sm font-medium text-[#344054]">Invoice</p>
            <p className="text-xs text-[#667085]">{request.invoice ? 'Available' : 'Not available'}</p>
          </div>
          <Button
            variant="outline"
            disabled={!request.invoice}
            onClick={() => request.invoice && openDocument(request.invoice)}
          >
            View
          </Button>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-[#EAECF0] px-4 py-3">
          <div>
            <p className="text-sm font-medium text-[#344054]">Offer Letter</p>
            <p className="text-xs text-[#667085]">{request.offerLetterUrl ? 'Available' : 'Not available'}</p>
          </div>
          <Button
            variant="outline"
            disabled={!request.offerLetterUrl}
            onClick={() => request.offerLetterUrl && openDocument(request.offerLetterUrl)}
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
}
