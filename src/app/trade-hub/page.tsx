'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function TradeHubRedirectPage() {
  useEffect(() => {
    redirect('/marketplace?tab=trade-leads');
  }, []);

  return null;
}
