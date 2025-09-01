import Head from 'next/head';
import { useSession, signIn } from 'next-auth/react';
import ExportOptions from '~/components/dashboard/ExportOptions';

export default function ExportPage() {
  const { status } = useSession();

  if (status === 'unauthenticated') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4">You must sign in to export your data.</p>
          <button
            className="rounded bg-indigo-600 px-4 py-2 text-white"
            onClick={() => void signIn()}
          >
            Sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Export · DBT Diary Card</title>
      </Head>
      <main className="mx-auto max-w-5xl p-6">
        <div className="no-print">
          <h1 className="mb-4 text-3xl font-bold">Export</h1>
          <p className="mb-4 text-sm text-gray-600">
            Use Export CSV for spreadsheets or your browser’s Print to PDF for a shareable summary.
          </p>
        </div>
        <div className="print-area">
          <ExportOptions />
        </div>
      </main>
    </>
  );
}
