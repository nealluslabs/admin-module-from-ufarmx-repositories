import { type RequestDetail } from '@/services/request.service';

const formatCurrency = (value?: number) => {
  const amount = Number(value || 0);
  return `₦ ${amount.toLocaleString()}`;
};

interface RequestProductsSectionProps {
  request: RequestDetail;
}

export function RequestProductsSection({ request }: RequestProductsSectionProps) {
  return (
    <div className="rounded-2xl bg-white p-6">
      <h3 className="mb-4 text-base font-semibold text-[#344054]">Products</h3>
      <div className="overflow-x-auto rounded-xl border border-[#EAECF0]">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] border-b border-[#EAECF0] bg-[#F9FAFB] px-4 py-3 text-sm font-medium text-[#667085]">
          <p>Name</p>
          <p>Quantity</p>
          <p>Price</p>
          <p>Total</p>
        </div>
        {request.products?.length ? (
          request.products.map((product, index) => {
            const quantity = Number(product.quantity || 0);
            const price = Number(product.price || 0);
            return (
              <div key={`${product.name || 'item'}-${index}`} className="grid grid-cols-[2fr_1fr_1fr_1fr] border-b border-[#EAECF0] px-4 py-3 text-sm text-[#344054] last:border-b-0">
                <p>{product.name || `Item ${index + 1}`}</p>
                <p>{quantity || 'N/A'}</p>
                <p>{formatCurrency(price)}</p>
                <p>{formatCurrency(quantity * price)}</p>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-10 text-center text-sm text-[#667085]">No products found</div>
        )}
      </div>
    </div>
  );
}
