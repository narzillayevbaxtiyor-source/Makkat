import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { STR, getSavedLang, saveLang } from "./i18n.js";
import { ADMIN_SLUG } from "./config.js";

import { Landing, Login, BookRide, DriverSelect, Tracking, PassengerHistory, PassengerProfile } from "./pages/passenger.jsx";
import { DriverRegister, DriverDashboard, DriverCommission, DriverProfile } from "./pages/driver.jsx";
import { AdminLogin, AdminDashboard, AdminDrivers, AdminOrders, AdminCommissions, AdminSettings } from "./pages/admin.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  const [lang, setLangState] = useState(getSavedLang());
  const setLang = (l) => { setLangState(l); saveLang(l); };
  const t = STR[lang];

  return (
    <AuthProvider>
      <div style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <Routes>
          <Route path="/" element={<Landing lang={lang} setLang={setLang} t={t} />} />
          <Route path="/login" element={<Login t={t} />} />
          <Route path="/book" element={<BookRide lang={lang} setLang={setLang} t={t} />} />
          <Route path="/select-driver" element={<DriverSelect lang={lang} setLang={setLang} t={t} />} />
          <Route path="/track/:orderId" element={<Tracking lang={lang} setLang={setLang} t={t} />} />
          <Route path="/history" element={<PassengerHistory lang={lang} setLang={setLang} t={t} />} />
          <Route path="/profile" element={<PassengerProfile lang={lang} setLang={setLang} t={t} />} />

          <Route path="/driver/register" element={<DriverRegister lang={lang} setLang={setLang} t={t} />} />
          <Route path="/driver/dashboard" element={<DriverDashboard lang={lang} setLang={setLang} t={t} />} />
          <Route path="/driver/commission" element={<DriverCommission lang={lang} setLang={setLang} t={t} />} />
          <Route path="/driver/profile" element={<DriverProfile lang={lang} setLang={setLang} t={t} />} />

          <Route path={`/${ADMIN_SLUG}`} element={<AdminLogin t={t} />} />
          <Route path="/admin/dashboard" element={<AdminDashboard t={t} />} />
          <Route path="/admin/drivers" element={<AdminDrivers t={t} />} />
          <Route path="/admin/orders" element={<AdminOrders t={t} />} />
          <Route path="/admin/commissions" element={<AdminCommissions t={t} />} />
          <Route path="/admin/settings" element={<AdminSettings t={t} />} />

          <Route path="*" element={<NotFound t={t} />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
