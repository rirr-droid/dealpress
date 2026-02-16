import { Suspense } from 'react';
import ApprovalSuccessContent from './ApprovalSuccessContent';

export const dynamic = 'force-dynamic';

export default function ApprovalSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApprovalSuccessContent />
    </Suspense>
  );
}
