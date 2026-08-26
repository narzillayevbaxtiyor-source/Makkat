import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Home, Users, List, DollarSign, Settings as SettingsIcon, LogOut, Ban, Check, Send } from "lucide-react";
import { Btn, Card, Field, inputCls, StatusBadge } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { ADMIN_SLUG } from "../config.js";
import {
  listAllDrivers, setDriverBlockStatus, listAllOrders, listAllCommissions,
  markCommissionPaid, getSettings, updateSettings,
} from "../lib/api.js";

export function AdminLogin({ t }) {
  const nav = useNavigate();
  const { signInWithPassword, signOut, profile, session } = useAuth();
  const [email, setEmail] = useState(""); const [pass, setPass] = useState(""); const [err, setErr] = useState(false);
  const [checking, setChecking] = useState(false);

  // Runs whenever the session/profile settle after a login attempt.
  useEffect(() => {
    if (!checking) return;
    if (session && profile) {
      if (profile.role === "admin") { nav("/admin/dashboard"); }
      else { signOut(); setErr(true); }
      setChecking(false);
    }
  }, [checking, session, profile]);

  const submit = async () => {
    setErr(false);
    const { error } = await signInWithPassword(email, pass);
    if (error) { setErr(true); return; }
    setChecking(true); // wait for AuthContext to load session + profile, handled above
  };

  return (
    <div className="min-h-screen bg-[#1B1B16] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6"><Shield className="text-[#B08A2E]" size={32}/></div>
        <h1 className="text-white text-[19px] font-semibold text-center mb-6">{t.adminLogin}</h1>
        <div className="bg-[#242420] rounded-2xl p-4">
          <Field label={t.email}><input className={inputCls} value={email} onChange={e => setEmail(e.target.value)} /></Field>
          <Field label={t.password}><input type="password" className={inputCls} value={pass} onChange={e => setPass(e.target.value)} /></Field>
          {err && <p className="text-[13px] text-[#E88686] mb-2">{t.invalidLogin}</p>}
          <Btn onClick={submit}>{t.login}</Btn>
        </div>
      </div>
    </div>
  );
}

function RequireAdmin({ t, children }) {
  const nav = useNavigate();
  const { session, profile } = useAuth();
  useEffect(() => {
    if (session === null) nav(`/${ADMIN_SLUG}`);
    if (profile && profile.role !== "admin") nav(`/${ADMIN_SLUG}`);
  }, [session, profile]);
  if (!session || !profile || profile.role !== "admin") return null;
  return children;
}

function AdminShell({ title, active, children }) {
  const nav = useNavigate();
  const { signOut } = useAuth();
  const items = [
    { key: "admin-dashboard", icon: <Home size={18}/>, label: "Dashboard", path: "/admin/dashboard" },
    { key: "admin-drivers", icon: <Users size={18}/>, label: "Drivers", path: "/admin/drivers" },
    { key: "admin-orders", icon: <List size={18}/>, label: "Orders", path: "/admin/orders" },
    { key: "admin-commissions", icon: <DollarSign size={18}/>, label: "Commissions", path: "/admin/commissions" },
    { key: "admin-settings", icon: <SettingsIcon size={18}/>, label: "Settings", path: "/admin/settings" },
  ];
  return (
    <div className="min-h-screen bg-[#F5F4EE] pb-20">
      <div className="bg-[#1B1B16] text-white px-4 py-3.5 sticky top-0 z-20 flex items-center justify-between">
        <span className="font-semibold text-[15px]">{title}</span>
        <button onClick={async () => { await signOut(); nav(`/${ADMIN_SLUG}`); }} className="text-[12px] text-[#B08A2E] flex items-center gap-1"><LogOut size={14}/>Log out</button>
      </div>
      <div className="p-4 max-w-2xl mx-auto">{children}</div>
      <div className="fixed bottom-0 left-0 right-0 bg-[#1B1B16] flex z-20 overflow-x-auto">
        {items.map(it => (
          <button key={it.key} onClick={() => nav(it.path)} className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 min-w-[70px] ${active === it.key ? "text-[#B08A2E]" : "text-[#8A8676]"}`}>
            {it.icon}<span className="text-[10px] font-medium">{it.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const StatBox = ({ label, value }) => (
  <div className="bg-white rounded-2xl border border-[#EBE7DA] p-3.5">
    <p className="text-[11px] text-[#9B9686] mb-1">{label}</p>
    <p className="text-[20px] font-bold text-[#221F17]">{value}</p>
  </div>
);

export function AdminDashboard({ t }) {
  const [drivers, setDrivers] = useState([]);
  const [orders, setOrders] = useState([]);
  useEffect(() => { listAllDrivers().then(setDrivers); listAllOrders().then(setOrders); }, []);
  const stats = {
    total: drivers.length,
    active: drivers.filter(d => d.online && d.status === "active").length,
    blocked: drivers.filter(d => d.status === "blocked").length,
    activeOrders: orders.filter(o => !["completed", "cancelled"].includes(o.status)).length,
    completedOrders: orders.filter(o => o.status === "completed").length,
  };
  return (
    <RequireAdmin t={t}>
      <AdminShell title={t.dashboard} active="admin-dashboard">
        <div className="grid grid-cols-2 gap-3">
          <StatBox label={t.totalDrivers} value={stats.total} />
          <StatBox label={t.activeDrivers} value={stats.active} />
          <StatBox label={t.blockedDrivers} value={stats.blocked} />
          <StatBox label={t.activeOrders} value={stats.activeOrders} />
          <StatBox label={t.completedOrders} value={stats.completedOrders} />
        </div>
      </AdminShell>
    </RequireAdmin>
  );
}

export function AdminDrivers({ t }) {
  const [drivers, setDrivers] = useState([]);
  const reload = () => listAllDrivers().then(setDrivers);
  useEffect(() => { reload(); }, []);
  const toggleBlock = async (d) => { await setDriverBlockStatus(d.id, d.status === "blocked" ? "active" : "blocked"); reload(); };
  return (
    <RequireAdmin t={t}>
      <AdminShell title={t.driversList} active="admin-drivers">
        <div className="space-y-2.5">
          {drivers.map(d => (
            <Card key={d.id}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-[14px] text-[#221F17]">{d.vehicles?.[0]?.make_model} {d.vehicles?.[0]?.year}</p>
                  <p className="text-[12px] text-[#9B9686]">{d.vehicles?.[0]?.plate_number} · {t[d.tariff]}</p>
                </div>
                <StatusBadge status={d.status} />
              </div>
              <p className="text-[12px] text-[#6B6656] mb-2">{t.commissionBalance}: {Number(d.commission_balance).toFixed(2)} SAR</p>
              <Btn variant={d.status === "blocked" ? "primary" : "danger"} onClick={() => toggleBlock(d)}>
                {d.status === "blocked" ? <><Check size={15}/>{t.unblock}</> : <><Ban size={15}/>{t.block}</>}
              </Btn>
            </Card>
          ))}
        </div>
      </AdminShell>
    </RequireAdmin>
  );
}

export function AdminOrders({ t }) {
  const [orders, setOrders] = useState([]);
  useEffect(() => { listAllOrders().then(setOrders); }, []);
  return (
    <RequireAdmin t={t}>
      <AdminShell title={t.allOrders} active="admin-orders">
        <div className="space-y-2.5">
          {orders.map(o => (
            <Card key={o.id}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[14px] font-medium text-[#221F17]">{o.passenger_name} → {o.drivers?.vehicles?.[0]?.plate_number || "—"}</p>
                <StatusBadge status={o.status === "completed" ? "paid" : o.status === "cancelled" ? "blocked" : "pending"} />
              </div>
              <p className="text-[12px] text-[#9B9686]">{o.pickup_address} → {o.destination}</p>
              <p className="text-[12px] text-[#9B9686]">{t[o.tariff]} · {o.price} SAR · {new Date(o.created_at).toLocaleString()}</p>
            </Card>
          ))}
        </div>
      </AdminShell>
    </RequireAdmin>
  );
}

export function AdminCommissions({ t }) {
  const [rows, setRows] = useState([]);
  const reload = () => listAllCommissions().then(setRows);
  useEffect(() => { reload(); }, []);
  const doMarkPaid = async (c) => { await markCommissionPaid(c); reload(); };
  return (
    <RequireAdmin t={t}>
      <AdminShell title={t.commissionMgmt} active="admin-commissions">
        <div className="space-y-2.5">
          {rows.map(c => (
            <Card key={c.id}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[14px] font-medium text-[#221F17]">{c.drivers?.vehicles?.[0]?.plate_number || c.driver_id}</p>
                <StatusBadge status={c.status} />
              </div>
              <p className="text-[12px] text-[#9B9686] mb-2">{c.amount} SAR · {new Date(c.created_at).toLocaleString()}</p>
              {c.status !== "paid" && (
                <div className="flex gap-2">
                  {c.drivers?.telegram_username && <a href={`https://t.me/${c.drivers.telegram_username}`} target="_blank" rel="noreferrer" className="flex-1"><Btn variant="outline"><Send size={14}/>Telegram</Btn></a>}
                  <Btn className="flex-1" onClick={() => doMarkPaid(c)}><Check size={14}/>{t.markPaid}</Btn>
                </div>
              )}
            </Card>
          ))}
        </div>
      </AdminShell>
    </RequireAdmin>
  );
}

export function AdminSettings({ t }) {
  const [pct, setPct] = useState(20);
  const [link, setLink] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => { getSettings().then(s => { setPct(s.commission_percent); setLink(s.telegram_payment_link || ""); }); }, []);
  const save = async () => {
    await updateSettings({ commissionPercent: +pct, telegramPaymentLink: link });
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  };
  return (
    <RequireAdmin t={t}>
      <AdminShell title={t.settings} active="admin-settings">
        <Card>
          <Field label={t.commissionPercent}><input type="number" className={inputCls} value={pct} onChange={e => setPct(e.target.value)} /></Field>
          <Field label={t.telegramLink}><input className={inputCls} value={link} onChange={e => setLink(e.target.value)} /></Field>
          <Btn onClick={save}>{saved ? t.saved : t.save}</Btn>
        </Card>
      </AdminShell>
    </RequireAdmin>
  );
}
