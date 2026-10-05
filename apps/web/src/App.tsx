/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayoutClient from "./components/layout/AdminLayoutClient";
import DashboardPage from "./pages/DashboardPage";
import TestPage from "./pages/TestPage";
import ModulePage from "./pages/ModulePage";
import PilihHistoriPage from "./pages/eselon1/PilihHistoriPage";
import IsianBab1Page from "./pages/eselon1/IsianBab1Page";
import IsianBab2Page from "./pages/eselon1/IsianBab2Page";
import MonitoringSubmitApprovePage from "./pages/eselon1/MonitoringSubmitApprovePage";

export default function App() {
  return (
    <BrowserRouter>
      <AdminLayoutClient>
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

          {/* Seluruh sub-modul perencanaan, penganggaran, monev, referensi, dan administrasi */}
          <Route path="*" element={<ModulePage />} />
        </Routes>
      </AdminLayoutClient>
    </BrowserRouter>
  );
}
