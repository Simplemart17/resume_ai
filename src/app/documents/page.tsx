import { DocumentsHub } from '@/components/DocumentsHub';

export const metadata = {
  title: 'Your documents',
};

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-bench">
      <DocumentsHub />
    </div>
  );
}
