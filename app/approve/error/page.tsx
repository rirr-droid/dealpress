import { Suspense } from 'react';
import ApprovalErrorContent from './ApprovalErrorContent';

export const dynamic = 'force-dynamic';

export default function ApprovalErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApprovalErrorContent />
    </Suspense>
  );
}
