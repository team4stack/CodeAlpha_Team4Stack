'use client'

import React from 'react';
import { ContentPage } from '@/modules/landing/admin/pages';

export default function ContentPageRoute({ params }: { params: Promise<{ contentType: string }> }) {
  const resolvedParams = React.use(params);
  return <ContentPage contentType={resolvedParams.contentType} />;
}
