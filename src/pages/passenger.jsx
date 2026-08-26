import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Car, User, Plane, Navigation, Star, Phone, Send, Home, List, LogOut } from "lucide-react";
import { Btn, Card, Field, inputCls, TopBar, BottomNav, MockMap, StatusBadge, LangSwitch } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  ensurePassengerRow, listOnlineDriversByTariff, createOrder, listMyPassengerOrders,
  getOrder, updateOrderStatus, submitReview, getDriverLocation, subscribeToOrder,
  subscribeToDriverLocation, getSettings, createCommissionForOrder,
} from "../lib/api.js";

const TARIFFS = [
  { id: "economy", carType: "sedan", maxPax: 3, color: "#7C8A78" },
  { id: "standard", carType: "suv", maxPax: 4, color: "#2E6B5E" },
  { id: "comfort", carType: "van", maxPax: 6, color: "#B08A2E" },
];
const MAKKAH_CENTER = { lat: 21.4225, lng: 39.8262 };
const jitter = (v, r = 0.02) => v + (Math.random() - 0.5) * r;

export function Landing({ lang, setLang, t }) {
  const nav = useNavigate();
  const { session } = useAuth();
  return (
    <div className="min-h-screen bg-[#FAF8F2] flex flex-col">
      <div className="flex justify-end p-4"><LangSwitch lang={lang} setLang={setLang} /></div>
      <div className="flex-1 flex flex-col justify-center px-6 pb-16">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#1F5E52] flex items-center justify-center mb-6">
          <Plane className="text-white" size={28} />
        </div>
        <h1 className="text-[26px] font-bold text-center text-[#221F17] leading-tight mb-2">{t.routeName}</h1>
        <p className="text-center text-[#6B6656] text-[15px] mb-10">{t.tagline}</p>
        <div className="space-y-3 max-w-sm mx-auto w-full">
          <Btn onClick={() => nav(user ? "/book" : "/book")}><Car size={18} />{t.bookRide}</Btn>
          <Btn variant="secondary" onClick={() => nav("/driver/register")}><User size={18} />{t.becomeDriver}</Btn>
        </div>
      </div>
    </div>
  );
}

export function Login({ t }) {
  const { signInWithGoogle } = useAuth();
  const [err, setErr] = useState(null);
  const go = async () => {
    const { error } = await signInWithGoogle();
    if (error) setErr(error.message);
  };
  return (
    <div className="min-h-screen bg-[#FAF8F2] flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <h1 className="text-[19px] font-semibold text-center mb-6 text-[#221F17]">{t.signInGoogle}</h1>
        <Btn onClick={go}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"/></svg>
          {t.signInGoogle}
        </Btn>
        {err && <p className="text-[13px] text-[#B3432B] mt-3 text-center">{err}</p>}
      </div>
    </div>
  );
}

export function BookRide({ lang, setLang, t }) {
  const nav = useNavigate();
  const { session } = useAuth();
  const [addr, setAddr] = useState("");
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [tariff, setTariff] = useState(null);

  useEffect(() => { if (session) ensurePassengerRow().catch(console.error); }, [session]);
  if (!session) { nav("/login"); return null; }

  const useMyLoc = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c); setAddr(`${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`); setLocating(false);
      },
      () => { setLocating(false); alert(t.locating + " — failed, enter address manually"); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const canContinue = addr.trim() && tariff;
  const next = () => {
    const c = coords || { lat: jitter(MAKKAH_CENTER.lat), lng: jitter(MAKKAH_CENTER.lng) };
    nav("/select-driver", { state: { pickupAddr: addr, lat: c.lat, lng: c.lng, tariff } });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] pb-28">
      <TopBar title={t.bookRide} onBack={() => nav("/")} lang={lang} setLang={setLang} />
      <div className="p-4 max-w-sm mx-auto space-y-4">
        <Card>
          <Field label={t.pickup}>
            <input className={inputCls} placeholder={t.pickupManual} value={addr} onChange={e => setAddr(e.target.value)} />
            <p className="text-[11px] text-[#9B9686] mt-1">{t.pickupHint}</p>
          </Field>
          <Btn variant="outline" onClick={useMyLoc} disabled={locating}>
            <Navigation size={16} />{locating ? t.locating : t.useMyLocation}
          </Btn>
        </Card>
        <Card>
          <Field label={t.destination}>
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-[#F1EEE6] text-[#3A362C] text-[14px]">
              <Plane size={16} className="text-[#1F5E52] shrink-0" /> {t.destFixed}
            </div>
          </Field>
        </Card>
        <div>
          <p className="text-[13px] font-medium text-[#6B6656] mb-2">{t.chooseTariff}</p>
          <div className="space-y-2.5">
            {TARIFFS.map(tr => (
              <button key={tr.id} onClick={() => setTariff(tr.id)}
                className={`w-full text-left p-3.5 rounded-2xl border-2 flex items-center justify-between transition ${tariff === tr.id ? "border-[#1F5E52] bg-[#E5F1EC]" : "border-[#EBE7DA] bg-white"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: tr.color + "22" }}>
                    <Car size={18} style={{ color: tr.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#221F17] text-[14px]">{t[tr.id]}</p>
                    <p className="text-[12px] text-[#9B9686]">{t.carType}: {t[tr.carType]} · {tr.maxPax} {t.maxPax}</p>
                  </div>
                </div>
                <span className="text-[13px] font-semibold text-[#1F5E52]">{t.priceConfirm}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FAF8F2] border-t border-[#EBE7DA]">
        <div className="max-w-sm mx-auto"><Btn onClick={next} disabled={!canContinue}>{t.findDrivers}</Btn></div>
      </div>
    </div>
  );
}

// Fixed reference prices per tariff — adjust freely, or replace with a
// real distance/time-based calculation once a Maps provider is wired in.
const TARIFF_PRICE = { economy: 60, standard: 90, comfort: 130 };

export function DriverSelect({ lang, setLang, t }) {
  const nav = useNavigate();
  const location = useLocation();
  const bookingState = location.state;
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingState) { nav("/book"); return; }
    listOnlineDriversByTariff(bookingState.tariff).then(setDrivers).finally(() => setLoading(false));
  }, []);

  if (!bookingState) return null;

  const choose = async (driver) => {
    const order = await createOrder({
      driverId: driver.id, pickupAddress: bookingState.pickupAddr,
      pickupLat: bookingState.lat, pickupLng: bookingState.lng,
      tariff: bookingState.tariff, price: TARIFF_PRICE[bookingState.tariff],
    });
    nav(`/track/${order.id}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] pb-6">
      <TopBar title={t.chooseTariff} onBack={() => nav("/book")} lang={lang} setLang={setLang} />
      <div className="p-4 max-w-sm mx-auto space-y-3">
        {loading && <p className="text-center text-[#9B9686] py-6">{t.loading}</p>}
        {!loading && drivers.length === 0 && <Card><p className="text-[14px] text-[#6B6656] text-center py-4">{t.noDrivers}</p></Card>}
        {drivers.map(d => (
          <Card key={d.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[#F1EEE6] flex items-center justify-center shrink-0"><User size={20} className="text-[#6B6656]" /></div>
              <div className="min-w-0">
                <p className="font-semibold text-[14px] text-[#221F17] truncate">{d.full_name || "Driver"}</p>
                <p className="text-[12px] text-[#9B9686] truncate">{d.vehicles?.[0]?.make_model} {d.vehicles?.[0]?.year} · {d.vehicles?.[0]?.plate_number}</p>
                <span className="flex items-center gap-0.5 text-[12px] text-[#B08A2E]"><Star size={12} fill="#B08A2E" />{d.rating}</span>
              </div>
            </div>
            <Btn variant="secondary" className="w-auto px-4 py-2 shrink-0" onClick={() => choose(d)}>{t.selectDriver}</Btn>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function Tracking({ lang, setLang, t }) {
  const { orderId } = useParams();
  const nav = useNavigate();
  const [order, setOrder] = useState(null);
  const [driverLoc, setDriverLoc] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewed, setReviewed] = useState(false);

  const load = () => getOrder(orderId).then(setOrder);
  useEffect(() => {
    load();
    const unsub = subscribeToOrder(orderId, load);
    return unsub;
  }, [orderId]);

  useEffect(() => {
    if (!order?.driver_id) return;
    getDriverLocation(order.driver_id).then(setDriverLoc);
    const unsub = subscribeToDriverLocation(order.driver_id, () => getDriverLocation(order.driver_id).then(setDriverLoc));
    return unsub;
  }, [order?.driver_id]);

  if (!order) return <div className="min-h-screen bg-[#FAF8F2]"><TopBar title="" onBack={() => nav("/")} lang={lang} setLang={setLang} /></div>;

  const cancel = async () => { await updateOrderStatus(order.id, "cancelled"); nav("/"); };
  const flow = ["assigned", "driver_coming", "arrived", "trip_started", "completed"];
  const idx = flow.indexOf(order.status);

  const rate = async (n) => {
    setRating(n);
    await submitReview({ orderId: order.id, driverId: order.driver_id, rating: n });
    setReviewed(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] pb-8">
      <TopBar title={t.myRides} onBack={() => nav("/")} lang={lang} setLang={setLang} />
      <div className="p-4 max-w-sm mx-auto space-y-4">
        <MockMap driverPos={driverLoc ? { lat: driverLoc.lat, lng: driverLoc.lng } : null} pickupPos={{ lat: order.pickup_lat, lng: order.pickup_lng }} />
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1F5E52] animate-pulse" />
            <p className="font-semibold text-[15px] text-[#221F17]">{t["status_" + order.status] || order.status}</p>
          </div>
          {!["cancelled", "completed"].includes(order.status) && (
            <div className="flex gap-1">{flow.map((s, i) => <div key={s} className={`flex-1 h-1.5 rounded-full ${i <= idx ? "bg-[#1F5E52]" : "bg-[#EBE7DA]"}`} />)}</div>
          )}
        </Card>
        {order.drivers && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[14px] text-[#221F17]">{order.drivers.full_name}</p>
                <p className="text-[12px] text-[#9B9686]">{order.drivers.vehicles?.[0]?.make_model} · {order.drivers.vehicles?.[0]?.plate_number}</p>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${order.drivers.phone || ""}`} className="w-10 h-10 rounded-full bg-[#E5F1EC] flex items-center justify-center text-[#1F5E52]"><Phone size={16} /></a>
                {order.drivers.telegram_username && <a href={`https://t.me/${order.drivers.telegram_username}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#E5F1EC] flex items-center justify-center text-[#1F5E52]"><Send size={16} /></a>}
              </div>
            </div>
          </Card>
        )}
        {order.status === "completed" && !reviewed && (
          <Card>
            <p className="text-[14px] font-medium mb-2">{t.rateTrip}</p>
            <div className="flex gap-1 mb-1">{[1,2,3,4,5].map(n => <button key={n} onClick={() => rate(n)}><Star size={26} fill={n <= rating ? "#B08A2E" : "none"} stroke="#B08A2E" /></button>)}</div>
          </Card>
        )}
        {reviewed && <p className="text-center text-[#1F5E52] font-medium">{t.thanksReview}</p>}
        {["assigned", "driver_coming"].includes(order.status) && <Btn variant="danger" onClick={cancel}>{t.cancelOrder}</Btn>}
      </div>
    </div>
  );
}

export function PassengerHistory({ lang, setLang, t }) {
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  useEffect(() => { listMyPassengerOrders().then(setOrders); }, []);
  return (
    <div className="min-h-screen bg-[#FAF8F2] pb-20">
      <TopBar title={t.myRides} lang={lang} setLang={setLang} />
      <div className="p-4 max-w-sm mx-auto space-y-2.5">
        {orders.length === 0 && <p className="text-center text-[#9B9686] mt-10">{t.noRidesYet}</p>}
        {orders.map(o => (
          <Card key={o.id} className="cursor-pointer" >
            <div onClick={() => nav(`/track/${o.id}`)} className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-[#221F17]">{t[o.tariff]} · {o.price} SAR</p>
                <p className="text-[12px] text-[#9B9686]">{new Date(o.created_at).toLocaleString()}</p>
              </div>
              <StatusBadge status={o.status === "completed" ? "paid" : o.status === "cancelled" ? "blocked" : "pending"} />
            </div>
          </Card>
        ))}
      </div>
      <BottomNav items={[
        { key: "home", icon: <Home size={20}/>, label: t.home, onClick: () => nav("/") },
        { key: "rides", icon: <List size={20}/>, label: t.myRides, active: true, onClick: () => nav("/history") },
        { key: "profile", icon: <User size={20}/>, label: t.profile, onClick: () => nav("/profile") },
      ]}/>
    </div>
  );
}

export function PassengerProfile({ lang, setLang, t }) {
  const nav = useNavigate();
  const { profile, signOut } = useAuth();
  return (
    <div className="min-h-screen bg-[#FAF8F2] pb-20">
      <TopBar title={t.profile} lang={lang} setLang={setLang} />
      <div className="p-4 max-w-sm mx-auto space-y-3">
        <Card>
          <p className="font-semibold text-[16px] text-[#221F17]">{profile?.full_name || "—"}</p>
          <p className="text-[13px] text-[#9B9686]">{profile?.phone || "—"}</p>
        </Card>
        <Btn variant="outline" onClick={async () => { await signOut(); nav("/"); }}><LogOut size={16}/>{t.logout}</Btn>
      </div>
      <BottomNav items={[
        { key: "home", icon: <Home size={20}/>, label: t.home, onClick: () => nav("/") },
        { key: "rides", icon: <List size={20}/>, label: t.myRides, onClick: () => nav("/history") },
        { key: "profile", icon: <User size={20}/>, label: t.profile, active: true, onClick: () => nav("/profile") },
      ]}/>
    </div>
  );
}
