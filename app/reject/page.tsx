import { Suspense } from 'react';
import RejectContent from './RejectContent';

export const dynamic = 'force-dynamic';

export default function RejectPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RejectContent />
    </Suspense>
  );
}
