import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign, Home, User, LogOut, Ban, Check, X, ChevronRight,
  Wifi, WifiOff, ToggleLeft, ToggleRight, Phone, Send,
} from "lucide-react";
import { Btn, Card, Field, inputCls, TopBar, BottomNav, StatusBadge } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  registerDriver, getMyDriver, setDriverOnline, listMyDriverOrders,
  updateOrderStatus, upsertDriverLocation, subscribeToDriverOrders,
  listMyCommissions, requestCashPayment, createCommissionForOrder, getSettings,
} from "../lib/api.js";

const TARIFFS = ["economy", "standard", "comfort"];
const CAR_TYPES = ["sedan", "suv", "van", "minivan", "other"];
const FLOW = ["assigned", "driver_coming", "arrived", "trip_started", "completed"];

export function DriverRegister({ lang, setLang, t }) {
  const nav = useNavigate();
  const { session, signInWithGoogle } = useAuth();
  const [f, setF] = useState({ phone: "", carMake: "", carYear: "", plate: "", carType: "sedan", tariff: "economy", telegram: "" });
  const [agreeRoute, setAgreeRoute] = useState(false);
  const [agreeCommission, setAgreeCommission] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const canSubmit = f.phone && f.carMake && f.carYear && f.plate && agreeRoute && agreeCommission && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await registerDriver(f);
      nav("/driver/dashboard");
    } catch (e) {
      alert(e.message);
    } finally { setSubmitting(false); }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#FAF8F2] flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <p className="text-center text-[15px] text-[#3A362C] mb-4">{t.signInFirst}</p>
          <Btn onClick={() => signInWithGoogle()}>{t.signInGoogle}</Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F2] pb-8">
      <TopBar title={t.driverRegTitle} onBack={() => nav("/")} lang={lang} setLang={setLang} />
      <div className="p-4 max-w-sm mx-auto">
        <Card>
          <Field label={t.phone}><input className={inputCls} value={f.phone} onChange={e => set("phone", e.target.value)} placeholder="+998" /></Field>
          <Field label={t.carMakeModel}><input className={inputCls} value={f.carMake} onChange={e => set("carMake", e.target.value)} /></Field>
          <Field label={t.carYear}><input className={inputCls} value={f.carYear} onChange={e => set("carYear", e.target.value)} inputMode="numeric" /></Field>
          <Field label={t.plateNumber}><input className={inputCls} value={f.plate} onChange={e => set("plate", e.target.value)} /></Field>
          <Field label={t.carType}>
            <select className={inputCls} value={f.carType} onChange={e => set("carType", e.target.value)}>
              {CAR_TYPES.map(ct => <option key={ct} value={ct}>{t[ct]}</option>)}
            </select>
          </Field>
          <Field label={t.tariffCategory}>
            <select className={inputCls} value={f.tariff} onChange={e => set("tariff", e.target.value)}>
              {TARIFFS.map(tr => <option key={tr} value={tr}>{t[tr]}</option>)}
            </select>
          </Field>
          <Field label="Telegram username">
            <input className={inputCls} value={f.telegram} onChange={e => set("telegram", e.target.value)} placeholder="username" />
          </Field>

          <div className="bg-[#FBF3DE] rounded-xl p-3 mb-3 text-[13px] text-[#8A6A0E] flex gap-2 items-start">
            <DollarSign size={16} className="shrink-0 mt-0.5" /> {t.commissionNotice}
          </div>
          <label className="flex items-start gap-2.5 mb-2.5 text-[13px] text-[#3A362C]">
            <input type="checkbox" className="mt-0.5" checked={agreeRoute} onChange={e => setAgreeRoute(e.target.checked)} />
            {t.agreeRoute}
          </label>
          <label className="flex items-start gap-2.5 mb-4 text-[13px] text-[#3A362C]">
            <input type="checkbox" className="mt-0.5" checked={agreeCommission} onChange={e => setAgreeCommission(e.target.checked)} />
            {t.agreeCommission}
          </label>
          <Btn onClick={submit} disabled={!canSubmit}>{t.register}</Btn>
        </Card>
      </div>
    </div>
  );
}

export function DriverDashboard({ lang, setLang, t }) {
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(null);
  const watchIdRef = React.useRef(null);

  const reload = async () => {
    const d = await getMyDriver();
    setMe(d);
    if (d) setOrders(await listMyDriverOrders(d.id));
  };

  useEffect(() => { reload(); getSettings().then(setSettings); }, []);
  useEffect(() => {
    if (!me) return;
    const unsub = subscribeToDriverOrders(me.id, reload);
    return unsub;
  }, [me?.id]);

  useEffect(() => {
    if (!me?.online || !navigator.geolocation) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => upsertDriverLocation(me.id, pos.coords.latitude, pos.coords.longitude),
      console.error,
      { enableHighAccuracy: true }
    );
    return () => { if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current); };
  }, [me?.online, me?.id]);

  if (!me) return <div className="min-h-screen bg-[#FAF8F2] flex items-center justify-center"><Btn onClick={() => nav("/driver/register")} className="max-w-xs">{t.driverRegTitle}</Btn></div>;

  const toggleOnline = async () => {
    if (me.status === "blocked") return;
    await setDriverOnline(me.id, !me.online);
    reload();
  };

  const incoming = orders.filter(o => o.status === "assigned");
  const active = orders.filter(o => !["assigned", "completed", "cancelled"].includes(o.status));

  const accept = async (o) => { await updateOrderStatus(o.id, "driver_coming"); reload(); };
  const reject = async (o) => { await updateOrderStatus(o.id, "cancelled"); reload(); };
  const advance = async (o) => {
    const idx = FLOW.indexOf(o.status);
    const nextStatus = FLOW[idx + 1];
    if (!nextStatus) return;
    const updated = await updateOrderStatus(o.id, nextStatus);
    if (nextStatus === "completed" && settings) {
      await createCommissionForOrder(updated, settings.commission_percent);
    }
    reload();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] pb-20">
      <TopBar title={t.dashboard} lang={lang} setLang={setLang} />
      <div className="p-4 max-w-sm mx-auto space-y-4">
        {me.status === "blocked" && (
          <div className="bg-[#FBE9E4] text-[#B3432B] text-[13px] rounded-xl p-3 flex gap-2 items-center"><Ban size={16}/>{t.blockedNotice}</div>
        )}
        <Card className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-[15px] text-[#221F17]">{me.vehicles?.[0]?.make_model} {me.vehicles?.[0]?.year}</p>
            <p className="text-[12px] text-[#9B9686]">{t[me.tariff]} · {me.vehicles?.[0]?.plate_number}</p>
          </div>
          <button onClick={toggleOnline} disabled={me.status === "blocked"} className="disabled:opacity-40">
            {me.online ? <ToggleRight size={34} className="text-[#1F5E52]" /> : <ToggleLeft size={34} className="text-[#9B9686]" />}
          </button>
        </Card>
        <div className="flex items-center gap-2 text-[13px]">
          {me.online ? <Wifi size={15} className="text-[#1F5E52]" /> : <WifiOff size={15} className="text-[#9B9686]" />}
          <span className={me.online ? "text-[#1F5E52] font-medium" : "text-[#9B9686]"}>{me.online ? t.online : t.offline}</span>
        </div>

        {active.length > 0 && (
          <div>
            <p className="text-[13px] font-medium text-[#6B6656] mb-2">{t.activeOrders}</p>
            {active.map(o => (
              <Card key={o.id} className="mb-2.5">
                <p className="text-[14px] font-medium text-[#221F17] mb-1">{o.pickup_address}</p>
                <p className="text-[12px] text-[#9B9686] mb-2">{t.passengerInfo}: {o.passenger_name} · {o.passenger_phone}</p>
                <p className="text-[13px] text-[#1F5E52] font-medium mb-2">{t["status_" + o.status]}</p>
                <div className="flex gap-2">
                  <a href={`tel:${o.passenger_phone}`} className="w-10 h-10 rounded-full bg-[#E5F1EC] flex items-center justify-center text-[#1F5E52]"><Phone size={16} /></a>
                  <Btn className="flex-1" onClick={() => advance(o)}>{t.nextStatus} <ChevronRight size={16}/></Btn>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div>
          <p className="text-[13px] font-medium text-[#6B6656] mb-2">{t.incomingOrders}</p>
          {incoming.length === 0 && <p className="text-[13px] text-[#9B9686]">{t.noIncoming}</p>}
          {incoming.map(o => (
            <Card key={o.id} className="mb-2.5">
              <p className="text-[14px] font-medium text-[#221F17] mb-1">{o.pickup_address}</p>
              <p className="text-[12px] text-[#9B9686] mb-3">{t.passengerInfo}: {o.passenger_name}</p>
              <div className="flex gap-2">
                <Btn variant="danger" className="flex-1" onClick={() => reject(o)}><X size={16}/>{t.reject}</Btn>
                <Btn className="flex-1" onClick={() => accept(o)}><Check size={16}/>{t.accept}</Btn>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav items={[
        { key: "dashboard", icon: <Home size={20}/>, label: t.home, active: true, onClick: () => nav("/driver/dashboard") },
        { key: "commission", icon: <DollarSign size={20}/>, label: t.commission, onClick: () => nav("/driver/commission") },
        { key: "profile", icon: <User size={20}/>, label: t.profile, onClick: () => nav("/driver/profile") },
      ]}/>
    </div>
  );
}

export function DriverCommission({ lang, setLang, t }) {
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [rows, setRows] = useState([]);
  const [settings, setSettings] = useState(null);

  const reload = async () => {
    const d = await getMyDriver();
    setMe(d);
    if (d) setRows(await listMyCommissions(d.id));
  };
  useEffect(() => { reload(); getSettings().then(setSettings); }, []);

  if (!me) return null;

  const payCash = async (c) => {
    await requestCashPayment(c.id);
    if (settings?.telegram_payment_link) window.open(settings.telegram_payment_link, "_blank");
    reload();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] pb-20">
      <TopBar title={t.commission} lang={lang} setLang={setLang} />
      <div className="p-4 max-w-sm mx-auto space-y-3">
        <Card>
          <p className="text-[13px] text-[#6B6656]">{t.commissionBalance}</p>
          <p className="text-[24px] font-bold text-[#221F17]">{Number(me.commission_balance).toFixed(2)} SAR</p>
        </Card>
        {rows.length === 0 && <p className="text-center text-[#9B9686] mt-6 text-[13px]">—</p>}
        {rows.map(c => (
          <Card key={c.id}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[14px] font-medium text-[#221F17]">{c.amount} SAR</p>
              <StatusBadge status={c.status} />
            </div>
            <p className="text-[12px] text-[#9B9686] mb-2">{new Date(c.created_at).toLocaleString()}</p>
            {c.status === "pending" && <Btn variant="outline" onClick={() => payCash(c)}><Send size={14}/>{t.payCash}</Btn>}
            {c.status === "cash_requested" && settings?.telegram_payment_link && (
              <Btn variant="outline" onClick={() => window.open(settings.telegram_payment_link, "_blank")}><Send size={14}/>{t.openTelegram}</Btn>
            )}
          </Card>
        ))}
      </div>
      <BottomNav items={[
        { key: "dashboard", icon: <Home size={20}/>, label: t.home, onClick: () => nav("/driver/dashboard") },
        { key: "commission", icon: <DollarSign size={20}/>, label: t.commission, active: true, onClick: () => nav("/driver/commission") },
        { key: "profile", icon: <User size={20}/>, label: t.profile, onClick: () => nav("/driver/profile") },
      ]}/>
    </div>
  );
}

export function DriverProfile({ lang, setLang, t }) {
  const nav = useNavigate();
  const { signOut } = useAuth();
  const [me, setMe] = useState(null);
  useEffect(() => { getMyDriver().then(setMe); }, []);
  if (!me) return null;
  return (
    <div className="min-h-screen bg-[#FAF8F2] pb-20">
      <TopBar title={t.driverProfile} lang={lang} setLang={setLang} />
      <div className="p-4 max-w-sm mx-auto space-y-3">
        <Card>
          <p className="text-[13px] text-[#3A362C]">{me.vehicles?.[0]?.make_model} {me.vehicles?.[0]?.year} · {me.vehicles?.[0]?.plate_number}</p>
          <p className="text-[13px] text-[#3A362C]">{t[me.vehicles?.[0]?.car_type]} · {t[me.tariff]}</p>
          <div className="mt-2"><StatusBadge status={me.status} /></div>
        </Card>
        <Btn variant="outline" onClick={async () => { await signOut(); nav("/"); }}><LogOut size={16}/>{t.logout}</Btn>
      </div>
      <BottomNav items={[
        { key: "dashboard", icon: <Home size={20}/>, label: t.home, onClick: () => nav("/driver/dashboard") },
        { key: "commission", icon: <DollarSign size={20}/>, label: t.commission, onClick: () => nav("/driver/commission") },
        { key: "profile", icon: <User size={20}/>, label: t.profile, active: true, onClick: () => nav("/driver/profile") },
      ]}/>
    </div>
  );
}
