import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { KpiCards } from '@/components/KpiCards';
import { TrendsAreaChart } from '@/components/charts/TrendsAreaChart';
import { CategoryDonut } from '@/components/charts/CategoryDonut';
import { MoMBarChart } from '@/components/charts/MoMBarChart';
import { TransactionsTable } from '@/components/TransactionsTable';
import { ImportDialog } from '@/components/ImportDialog';
import { RulesManagerDialog } from '@/components/RulesManagerDialog';

function DashboardPage() {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');

  const handleNavigate = (item: string) => {
    setActiveNav(item);
    if (item === 'upload') {
      setImportDialogOpen(true);
    } else if (item === 'rules') {
      setRulesDialogOpen(true);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeItem={activeNav} onNavigate={handleNavigate} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar onUploadClick={() => setImportDialogOpen(true)} />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {/* KPI Cards */}
            <div className="mb-8">
              <KpiCards />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <TrendsAreaChart />
              <CategoryDonut />
            </div>

            {/* Charts Row 2 */}
            <div className="mb-8">
              <MoMBarChart />
            </div>

            {/* Transactions Table */}
            <TransactionsTable onRulesClick={() => setRulesDialogOpen(true)} />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
      <RulesManagerDialog open={rulesDialogOpen} onOpenChange={setRulesDialogOpen} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
