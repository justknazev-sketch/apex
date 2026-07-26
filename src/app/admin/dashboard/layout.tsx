import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect('/admin');
  }

  return (
    <>
      <div className="admin-layout-container">
        {children}
      </div>
    </>
  );
}
