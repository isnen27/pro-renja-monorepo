/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayoutClient from "./components/layout/AdminLayoutClient";

// Lazy load pages for fast load (<15ms per page transition)
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TestPage = lazy(() => import("./pages/TestPage"));
const ModulePage = lazy(() => import("./pages/ModulePage"));

// Eselon 1
const PilihHistoriPage = lazy(() => import("./pages/eselon1/PilihHistoriPage"));
const IsianBab1Page = lazy(() => import("./pages/eselon1/IsianBab1Page"));
const IsianBab2Page = lazy(() => import("./pages/eselon1/IsianBab2Page"));
const MonitoringSubmitApprovePage = lazy(() => import("./pages/eselon1/MonitoringSubmitApprovePage"));

// Eselon 2
const PilihHistoriEselon2Page = lazy(() => import("./pages/eselon2/PilihHistoriEselon2Page"));
const IsianBab1Eselon2Page = lazy(() => import("./pages/eselon2/IsianBab1Eselon2Page"));
const IsianBab2Eselon2Page = lazy(() => import("./pages/eselon2/IsianBab2Eselon2Page"));
const IsianBab3Eselon2Page = lazy(() => import("./pages/eselon2/IsianBab3Eselon2Page"));
const IsianLampiranEselon2Page = lazy(() => import("./pages/eselon2/IsianLampiranEselon2Page"));
const MonitoringSubmitApproveEselon2Page = lazy(() => import("./pages/eselon2/MonitoringSubmitApproveEselon2Page"));

// KAK
const PilihHistoriKakPage = lazy(() => import("./pages/kak/PilihHistoriKakPage"));
const IsianKakPage = lazy(() => import("./pages/kak/IsianKakPage"));
const IsianKakPengadaanPage = lazy(() => import("./pages/kak/IsianKakPengadaanPage"));
const MonitoringSubmitApproveKakPage = lazy(() => import("./pages/kak/MonitoringSubmitApproveKakPage"));

// RAB (Rencana Anggaran Biaya)
const PilihHistoriRabPage = lazy(() => import("./pages/rab/PilihHistoriRabPage"));
const IsianRabPage = lazy(() => import("./pages/rab/IsianRabPage"));
const RevisiAnggaranPage = lazy(() => import("./pages/rab/RevisiAnggaranPage"));
const AutomaticAdjustmentPage = lazy(() => import("./pages/rab/AutomaticAdjustmentPage"));
const MatriksUsulanRevisiPage = lazy(() => import("./pages/rab/MatriksUsulanRevisiPage"));
const MonitoringBlokirPage = lazy(() => import("./pages/rab/MonitoringBlokirPage"));
const MonitoringRpdPage = lazy(() => import("./pages/rab/MonitoringRpdPage"));
const MonitoringSubmitApproveRabPage = lazy(() => import("./pages/rab/MonitoringSubmitApproveRabPage"));

// Minimal loading placeholder for fast transitions
function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[300px] text-slate-400 text-xs">
      <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent mr-2" />
      Memuat halaman...
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminLayoutClient>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            {/* Root redirects to /dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard utama */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Test Page dari template Next.js */}
            <Route path="/test" element={<TestPage />} />

            {/* Renja Eselon I - sub pages */}
            <Route path="/eselon1/pilih-histori" element={<PilihHistoriPage />} />
            <Route path="/eselon1/bab-1" element={<IsianBab1Page />} />
            <Route path="/eselon1/bab-2" element={<IsianBab2Page />} />
            <Route path="/eselon1/monitoring" element={<MonitoringSubmitApprovePage />} />

            {/* Renja Eselon II - sub pages */}
            <Route path="/eselon2/pilih-histori" element={<PilihHistoriEselon2Page />} />
            <Route path="/eselon2/bab-1" element={<IsianBab1Eselon2Page />} />
            <Route path="/eselon2/bab-1/*" element={<IsianBab1Eselon2Page />} />
            <Route path="/eselon2/bab-2" element={<IsianBab2Eselon2Page />} />
            <Route path="/eselon2/bab-3" element={<IsianBab3Eselon2Page />} />
            <Route path="/eselon2/lampiran" element={<IsianLampiranEselon2Page />} />
            <Route path="/eselon2/monitoring" element={<MonitoringSubmitApproveEselon2Page />} />

            {/* Kerangka Acuan Kerja (TOR) - sub pages */}
            <Route path="/kak/pilih-histori" element={<PilihHistoriKakPage />} />
            <Route path="/kak/isian" element={<IsianKakPage />} />
            <Route path="/kak/pengadaan" element={<IsianKakPengadaanPage />} />
            <Route path="/kak/monitoring" element={<MonitoringSubmitApproveKakPage />} />

            {/* Rencana Anggaran Biaya (RAB) - sub pages */}
            <Route path="/rab/pilih-histori" element={<PilihHistoriRabPage />} />
            <Route path="/rab/isian" element={<IsianRabPage />} />
            <Route path="/rab/input-rinci" element={<Navigate to="/rab/isian" replace />} />
            <Route path="/rab/revisi" element={<RevisiAnggaranPage />} />
            <Route path="/rab/automatic-adjustment" element={<AutomaticAdjustmentPage />} />
            <Route path="/rab/matriks-usulan-revisi" element={<MatriksUsulanRevisiPage />} />
            <Route path="/rab/monitoring-blokir" element={<MonitoringBlokirPage />} />
            <Route path="/rab/monitoring-rpd" element={<MonitoringRpdPage />} />
            <Route path="/rab/monitoring" element={<MonitoringSubmitApproveRabPage />} />

            {/* Seluruh sub-modul perencanaan, penganggaran, monev, referensi, dan administrasi */}
            <Route path="*" element={<ModulePage />} />
          </Routes>
        </Suspense>
      </AdminLayoutClient>
    </BrowserRouter>
  );
}
