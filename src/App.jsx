import React, { useState, useEffect, useCallback, useRef } from "react"; import { MapPin, Navigation, Car, Star, 
  Phone, Send, Clock, Check, X, User, Shield, ChevronRight, ChevronLeft, Globe, Wifi, WifiOff, DollarSign, 
  AlertTriangle, LogOut, Home, List, CreditCard, Plane, ToggleLeft, ToggleRight, Ban, Eye, Settings as 
  SettingsIcon, Users
} from "lucide-react";
/* ============================================================ I18N 
============================================================ */ const LANGS = { uz: "O'zbekcha", ru: "Русский", 
en: "English" }; const STR = {
  uz: { routeName: "Makkah → Jeddah Aeroporti", tagline: "Umra va Haj ziyoratchilari uchun ishonchli transfer", 
    bookRide: "Yo'l buyurtma qilish", becomeDriver: "Haydovchi bo'lish", home: "Bosh sahifa", myRides: 
    "Buyurtmalarim", profile: "Profil", orders: "Buyurtmalar", commission: "Komissiya", signInGoogle: "Google 
    orqali kirish", googleFailed: "Google orqali kirish ishlamadi. Iltimos ism va telefon raqamingizni 
    kiriting.", fullName: "To'liq ism", phone: "Telefon raqami", continue: "Davom etish", pickup: "Qayerdan olib 
    ketamiz?", pickupManual: "Manzilni qo'lda yozing", useMyLocation: "Joylashuvimni yuborish", locating: 
    "Joylashuv aniqlanmoqda...", pickupHint: "Faqat Makkah hududi", destination: "Boriladigan joy", destFixed: 
    "Jeddah Aeroporti (JED) — King Abdulaziz International Airport", chooseTariff: "Tarifni tanlang", economy: 
    "Economy", standard: "Standard", comfort: "Comfort", maxPax: "yo'lovchi", priceConfirm: "Narx tasdiqlanadi", 
    findDrivers: "Haydovchilarni ko'rish", noDrivers: "Hozircha online haydovchi yo'q. Birozdan so'ng qayta 
    urinib ko'ring.", selectDriver: "Tanlash", eta: "yetib kelish", online: "Online", offline: "Offline", 
    orderCreated: "Buyurtma yaratildi", searching: "Haydovchi javobini kutmoqda...", driverAssigned: "Haydovchi 
    tayinlandi", driverComing: "Haydovchi kelmoqda", arrived: "Haydovchi yetib keldi", tripStarted: "Safar 
    boshlandi", completed: "Safar yakunlandi", cancelled: "Bekor qilindi", cancelOrder: "Buyurtmani bekor 
    qilish", call: "Qo'ng'iroq", telegram: "Telegram", rateTrip: "Safarni baholang", submitReview: "Yuborish", 
    thanksReview: "Rahmat!", noRidesYet: "Hali buyurtmalar yo'q", back: "Orqaga", driverRegTitle: "Haydovchi 
    sifatida ro'yxatdan o'tish", carMakeModel: "Mashina rusumi", carYear: "Mashina yili", plateNumber: "Davlat 
    raqami", carType: "Mashina turi", sedan: "Sedan", suv: "SUV", van: "Van", minivan: "Minivan", other: 
    "Boshqa", tariffCategory: "Tarif toifasi", agreeRoute: "Men Makkah → Jeddah Aeroporti yo'nalishida ishlashga 
    roziman", commissionNotice: "Har bir yo'lovchi/buyurtma uchun 20% komissiya to'lanadi.", agreeCommission: 
    "Men har bir yo'lovchi/safar uchun 20% komissiya to'lashga roziman", register: "Ro'yxatdan o'tish", 
    mustAgree: "Davom etish uchun barcha shartlarga rozilik bildiring", driverActive: "Siz faol haydovchisiz. 
    Buyurtmalarni qabul qila olasiz.", goOnline: "Online bo'lish", goOffline: "Offline bo'lish", incomingOrders: 
    "Kelayotgan buyurtmalar", noIncoming: "Hozircha buyurtma yo'q", accept: "Qabul qilish", reject: "Rad etish", 
    updateStatus: "Statusni yangilash", nextStatus: "Keyingi bosqich", passengerInfo: "Yo'lovchi", estDistance: 
    "Taxminiy masofa", blockedNotice: "To'lanmagan komissiya sababli bloklangan", commissionBalance: "Komissiya 
    balansi", pay: "To'lash", payOnline: "Online to'lash", payCash: "Naqd to'lash (Telegram orqali)", 
    commissionPending: "Kutilmoqda", commissionPaid: "To'langan", commissionCash: "Naqd so'ralgan", 
    commissionOverdue: "Muddati o'tgan", openTelegram: "Telegramga o'tish", markPaid: "To'langan deb belgilash", 
    driverProfile: "Haydovchi profili", logout: "Chiqish", adminLogin: "Admin kirish", email: "Email", password: 
    "Parol", login: "Kirish", invalidLogin: "Login yoki parol noto'g'ri", dashboard: "Boshqaruv paneli", 
    totalDrivers: "Jami haydovchilar", activeDrivers: "Faol haydovchilar", blockedDrivers: "Bloklangan 
    haydovchilar", activeOrders: "Faol buyurtmalar", completedOrders: "Yakunlangan buyurtmalar", 
    pendingCommissions: "Kutilayotgan komissiyalar", paidCommissions: "To'langan komissiyalar", driversList: 
    "Haydovchilar ro'yxati", allOrders: "Barcha buyurtmalar", commissionMgmt: "Komissiyalarni boshqarish", 
    settings: "Sozlamalar", block: "Bloklash", unblock: "Blokdan chiqarish", details: "Batafsil", telegramLink: 
    "Telegram to'lov havolasi", commissionPercent: "Komissiya foizi", save: "Saqlash", saved: "Saqlandi", 
    notFound: "Sahifa topilmadi", unauthorized: "Ruxsat berilmagan", goHome: "Bosh sahifaga qaytish", 
    status_searching:"Haydovchi qidirilmoqda", status_assigned:"Haydovchi tayinlandi", 
    status_driver_coming:"Haydovchi kelmoqda", status_arrived:"Haydovchi yetib keldi", 
    status_trip_started:"Safar davom etmoqda", status_completed:"Safar yakunlandi", status_cancelled:"Bekor 
    qilindi", demoMode: "Demo rejim: xarita, to'lov va Google login simulyatsiya qilinmoqda.",
  },
  ru: { routeName: "Мекка → Аэропорт Джидда", tagline: "Надёжный трансфер для паломников Умры и Хаджа", 
    bookRide: "Заказать поездку", becomeDriver: "Стать водителем", home: "Главная", myRides: "Мои поездки", 
    profile: "Профиль", orders: "Заказы", commission: "Комиссия", signInGoogle: "Войти через Google", 
    googleFailed: "Вход через Google не удался. Введите имя и телефон.", fullName: "Полное имя", phone: "Номер 
    телефона", continue: "Продолжить", pickup: "Откуда забрать?", pickupManual: "Введите адрес вручную", 
    useMyLocation: "Отправить мою геолокацию", locating: "Определение местоположения...", pickupHint: "Только в 
    пределах Мекки", destination: "Пункт назначения", destFixed: "Аэропорт Джидда (JED) — King Abdulaziz 
    International Airport", chooseTariff: "Выберите тариф", economy: "Эконом", standard: "Стандарт", comfort: 
    "Комфорт", maxPax: "пассажиров", priceConfirm: "Цена будет подтверждена", findDrivers: "Показать водителей", 
    noDrivers: "Сейчас нет водителей онлайн. Попробуйте позже.", selectDriver: "Выбрать", eta: "прибытие", 
    online: "Онлайн", offline: "Офлайн", orderCreated: "Заказ создан", searching: "Ожидание ответа водителя...", 
    driverAssigned: "Водитель назначен", driverComing: "Водитель едет", arrived: "Водитель прибыл", tripStarted: 
    "Поездка началась", completed: "Поездка завершена", cancelled: "Отменено", cancelOrder: "Отменить заказ", 
    call: "Позвонить", telegram: "Telegram", rateTrip: "Оцените поездку", submitReview: "Отправить", 
    thanksReview: "Спасибо!", noRidesYet: "Пока нет заказов", back: "Назад", driverRegTitle: "Регистрация 
    водителя", carMakeModel: "Марка/модель авто", carYear: "Год авто", plateNumber: "Гос. номер", carType: "Тип 
    авто", sedan: "Седан", suv: "Внедорожник", van: "Фургон", minivan: "Минивэн", other: "Другое", 
    tariffCategory: "Категория тарифа", agreeRoute: "Я согласен работать на маршруте Мекка → Аэропорт Джидда", 
    commissionNotice: "За каждого пассажира/поездку взимается комиссия 20%.", agreeCommission: "Я согласен 
    платить 20% комиссии за каждого пассажира/поездку", register: "Зарегистрироваться", mustAgree: "Примите все 
    условия, чтобы продолжить", driverActive: "Вы активный водитель. Можете принимать заказы.", goOnline: "Выйти 
    онлайн", goOffline: "Уйти офлайн", incomingOrders: "Входящие заказы", noIncoming: "Пока нет заказов", 
    accept: "Принять", reject: "Отклонить", updateStatus: "Обновить статус", nextStatus: "Следующий этап", 
    passengerInfo: "Пассажир", estDistance: "Примерное расстояние", blockedNotice: "Заблокирован из-за 
    неоплаченной комиссии", commissionBalance: "Баланс комиссии", pay: "Оплатить", payOnline: "Оплатить онлайн", 
    payCash: "Наличными (через Telegram)", commissionPending: "Ожидание", commissionPaid: "Оплачено", 
    commissionCash: "Запрошена наличными", commissionOverdue: "Просрочено", openTelegram: "Открыть Telegram", 
    markPaid: "Отметить как оплачено", driverProfile: "Профиль водителя", logout: "Выйти", adminLogin: "Вход 
    администратора", email: "Email", password: "Пароль", login: "Войти", invalidLogin: "Неверный логин или 
    пароль", dashboard: "Панель управления", totalDrivers: "Всего водителей", activeDrivers: "Активные 
    водители", blockedDrivers: "Заблокированные", activeOrders: "Активные заказы", completedOrders: "Завершённые 
    заказы", pendingCommissions: "Ожидающие комиссии", paidCommissions: "Оплаченные комиссии", driversList: 
    "Список водителей", allOrders: "Все заказы", commissionMgmt: "Управление комиссиями", settings: "Настройки", 
    block: "Заблокировать", unblock: "Разблокировать", details: "Подробнее", telegramLink: "Ссылка Telegram для 
    оплаты", commissionPercent: "Процент комиссии", save: "Сохранить", saved: "Сохранено", notFound: "Страница 
    не найдена", unauthorized: "Доступ запрещён", goHome: "На главную", status_searching:"Поиск водителя", 
    status_assigned:"Водитель назначен", status_driver_coming:"Водитель едет", status_arrived:"Водитель прибыл", 
    status_trip_started:"Поездка идёт", status_completed:"Поездка завершена", status_cancelled:"Отменено", 
    demoMode: "Демо-режим: карта, оплата и Google-вход симулируются.",
  },
  en: { routeName: "Makkah → Jeddah Airport", tagline: "Trusted transfer for Umrah & Hajj pilgrims", bookRide: 
    "Book a ride", becomeDriver: "Become a driver", home: "Home", myRides: "My rides", profile: "Profile", 
    orders: "Orders", commission: "Commission", signInGoogle: "Sign in with Google", googleFailed: "Google 
    sign-in failed. Please enter your name and phone.", fullName: "Full name", phone: "Phone number", continue: 
    "Continue", pickup: "Where should we pick you up?", pickupManual: "Type address manually", useMyLocation: 
    "Use my location", locating: "Locating...", pickupHint: "Makkah area only", destination: "Destination", 
    destFixed: "Jeddah Airport (JED) — King Abdulaziz International Airport", chooseTariff: "Choose a tariff", 
    economy: "Economy", standard: "Standard", comfort: "Comfort", maxPax: "passengers", priceConfirm: "Price 
    will be confirmed", findDrivers: "Show drivers", noDrivers: "No drivers online right now. Try again 
    shortly.", selectDriver: "Select", eta: "ETA", online: "Online", offline: "Offline", orderCreated: "Order 
    created", searching: "Waiting for driver response...", driverAssigned: "Driver assigned", driverComing: 
    "Driver is coming", arrived: "Driver arrived", tripStarted: "Trip started", completed: "Trip completed", 
    cancelled: "Cancelled", cancelOrder: "Cancel order", call: "Call", telegram: "Telegram", rateTrip: "Rate 
    your trip", submitReview: "Submit", thanksReview: "Thank you!", noRidesYet: "No rides yet", back: "Back", 
    driverRegTitle: "Register as a driver", carMakeModel: "Car make/model", carYear: "Car year", plateNumber: 
    "Plate number", carType: "Car type", sedan: "Sedan", suv: "SUV", van: "Van", minivan: "Minivan", other: 
    "Other", tariffCategory: "Tariff category", agreeRoute: "I agree to work the Makkah → Jeddah Airport route", 
    commissionNotice: "A 20% commission is charged for each passenger/ride.", agreeCommission: "I agree to pay 
    20% commission for each passenger/ride", register: "Register", mustAgree: "Please agree to all terms to 
    continue", driverActive: "You're an active driver. You can accept orders now.", goOnline: "Go online", 
    goOffline: "Go offline", incomingOrders: "Incoming orders", noIncoming: "No orders yet", accept: "Accept", 
    reject: "Reject", updateStatus: "Update status", nextStatus: "Next stage", passengerInfo: "Passenger", 
    estDistance: "Est. distance", blockedNotice: "Blocked due to unpaid commission", commissionBalance: 
    "Commission balance", pay: "Pay", payOnline: "Pay online", payCash: "Pay cash (via Telegram)", 
    commissionPending: "Pending", commissionPaid: "Paid", commissionCash: "Cash requested", commissionOverdue: 
    "Overdue", openTelegram: "Open Telegram", markPaid: "Mark as paid", driverProfile: "Driver profile", logout: 
    "Log out", adminLogin: "Admin login", email: "Email", password: "Password", login: "Log in", invalidLogin: 
    "Invalid email or password", dashboard: "Dashboard", totalDrivers: "Total drivers", activeDrivers: "Active 
    drivers", blockedDrivers: "Blocked drivers", activeOrders: "Active orders", completedOrders: "Completed 
    orders", pendingCommissions: "Pending commissions", paidCommissions: "Paid commissions", driversList: 
    "Drivers list", allOrders: "All orders", commissionMgmt: "Commission management", settings: "Settings", 
    block: "Block", unblock: "Unblock", details: "Details", telegramLink: "Telegram payment link", 
    commissionPercent: "Commission percent", save: "Save", saved: "Saved", notFound: "Page not found", 
    unauthorized: "Unauthorized", goHome: "Go home", status_searching:"Searching for driver", 
    status_assigned:"Driver assigned", status_driver_coming:"Driver is coming", status_arrived:"Driver arrived", 
    status_trip_started:"Trip in progress", status_completed:"Trip completed", status_cancelled:"Cancelled", 
    demoMode: "Demo mode: map, payment, and Google login are simulated.",
  },
};
/* ============================================================ CONSTANTS / DEMO SEED 
============================================================ */ const TARIFFS = [
  { id: "economy", carType: "sedan", maxPax: 3, price: 60, color: "#7C8A78" }, { id: "standard", carType: "suv", 
  maxPax: 4, price: 90, color: "#2E6B5E" }, { id: "comfort", carType: "van", maxPax: 6, price: 130, color: 
  "#B08A2E" },
]; const ADMIN_SLUG = "hajj-taxi-secret_admin_login"; const ADMIN_EMAIL = "admin@demo.local"; const ADMIN_PASS = 
"admin123"; const MAKKAH_CENTER = { lat: 21.4225, lng: 39.8262 }; const STATUS_FLOW = ["assigned", 
"driver_coming", "arrived", "trip_started", "completed"]; const uid = () => Math.random().toString(36).slice(2, 
10); const jitter = (v, r = 0.02) => v + (Math.random() - 0.5) * r; const seedDrivers = () => ([
  { id: uid(), name: "Sardor Karimov", phone: "+998901112233", carMake: "Toyota Camry", carYear: 2021, plate: 
  "A123ABC", carType: "sedan", tariff: "economy", online: true, status: "active", rating: 4.8, lat: 
  jitter(MAKKAH_CENTER.lat), lng: jitter(MAKKAH_CENTER.lng), commissionBalance: 0, telegram: "sardor_driver" }, 
  { id: uid(), name: "Botir Yusupov", phone: "+998902223344", carMake: "Hyundai Sonata", carYear: 2022, plate: 
  "B456DEF", carType: "suv", tariff: "standard", online: true, status: "active", rating: 4.9, lat: 
  jitter(MAKKAH_CENTER.lat), lng: jitter(MAKKAH_CENTER.lng), commissionBalance: 0, telegram: "botir_driver" }, { 
  id: uid(), name: "Jasur Tashkentov", phone: "+998903334455", carMake: "Kia Carnival", carYear: 2023, plate: 
  "C789GHI", carType: "van", tariff: "comfort", online: false, status: "active", rating: 4.7, lat: 
  jitter(MAKKAH_CENTER.lat), lng: jitter(MAKKAH_CENTER.lng), commissionBalance: 0, telegram: "jasur_driver" },
]); const defaultSettings = { commissionPercent: 20, telegramLink: "https://t.me/taxi_payments" }; /* 
============================================================
   STORAGE HELPERS (window.storage) ============================================================ */ async 
function loadShared(key, fallback) {
  try { const r = await window.storage.get(key, true); return r ? JSON.parse(r.value) : fallback;
  } catch { return fallback; }
}
async function saveShared(key, value) { try { await window.storage.set(key, JSON.stringify(value), true); } 
  catch (e) { console.error(e); }
}
async function loadPersonal(key, fallback) { try { const r = await window.storage.get(key, false); return r ? 
    JSON.parse(r.value) : fallback;
  } catch { return fallback; }
}
async function savePersonal(key, value) { try { await window.storage.set(key, JSON.stringify(value), false); } 
  catch (e) { console.error(e); }
}
/* ============================================================ SMALL UI ATOMS 
============================================================ */ const Btn = ({ children, onClick, variant = 
"primary", className = "", disabled, type = "button" }) => {
  const base = "w-full py-3.5 rounded-2xl font-semibold text-[15px] transition active:scale-[0.98] 
  disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-2"; const variants = {
    primary: "bg-[#1F5E52] text-white shadow-sm hover:bg-[#184A41]", secondary: "bg-[#F1EEE6] text-[#1F5E52] 
    hover:bg-[#E7E2D4]", outline: "border border-[#D9D3C3] text-[#3A362C] hover:bg-[#F7F5EF]", danger: 
    "bg-[#B3432B] text-white hover:bg-[#96351F]", ghost: "text-[#6B6656] hover:bg-[#F1EEE6]",
  };
  return ( <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${variants[variant]} 
    ${className}`}>
      {children} </button> );
};
const Card = ({ children, className = "" }) => ( <div className={`bg-white rounded-2xl border border-[#EBE7DA] 
  p-4 ${className}`}>{children}</div>
); const Field = ({ label, children }) => ( <div className="mb-3"> <label className="block text-[13px] 
    font-medium text-[#6B6656] mb-1.5">{label}</label> {children}
  </div> ); const inputCls = "w-full px-3.5 py-3 rounded-xl border border-[#D9D3C3] bg-white text-[15px] 
focus:outline-none focus:ring-2 focus:ring-[#1F5E52]/30 focus:border-[#1F5E52]"; const StatusBadge = ({ status, 
t }) => {
  const colors = { active: "bg-[#E5F1EC] text-[#1F5E52]", offline: "bg-[#F1EEE6] text-[#6B6656]", blocked: 
    "bg-[#FBE9E4] text-[#B3432B]", pending: "bg-[#FBF3DE] text-[#8A6A0E]", paid: "bg-[#E5F1EC] text-[#1F5E52]", 
    cash_requested: "bg-[#EAE4F5] text-[#5B3E96]", overdue: "bg-[#FBE9E4] text-[#B3432B]",
  };
  return <span className={`text-[12px] font-semibold px-2 py-1 rounded-full ${colors[status] || "bg-gray-100 
  text-gray-600"}`}>{status}</span>;
};
/* Simple mock map: shows two dots on a stylized grid, no real tiles */ const MockMap = ({ driverPos, pickupPos, 
height = 180 }) => {
  const w = 100, h = 100; const toXY = (p) => ({ x: ((p.lng - (MAKKAH_CENTER.lng - 0.05)) / 0.1) * w, y: h - 
    ((p.lat - (MAKKAH_CENTER.lat - 0.05)) / 0.1) * h,
  });
  const dp = driverPos ? toXY(driverPos) : null; const pp = pickupPos ? toXY(pickupPos) : null; return ( <div 
    className="relative rounded-xl overflow-hidden border border-[#EBE7DA]" style={{ height }}>
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none"> <rect width="100" 
        height="100" fill="#EEF3EF" /> {Array.from({ length: 9 }).map((_, i) => (
          <line key={"v" + i} x1={i * 12.5} y1="0" x2={i * 12.5} y2="100" stroke="#DDE6E0" strokeWidth="0.4" /> 
        ))} {Array.from({ length: 9 }).map((_, i) => (
          <line key={"h" + i} x1="0" y1={i * 12.5} x2="100" y2={i * 12.5} stroke="#DDE6E0" strokeWidth="0.4" /> 
        ))} {pp && <circle cx={pp.x} cy={pp.y} r="2.4" fill="#1F5E52" stroke="white" strokeWidth="1" />} {dp && 
        <circle cx={dp.x} cy={dp.y} r="2.4" fill="#B08A2E" stroke="white" strokeWidth="1" />}
      </svg> <div className="absolute bottom-2 left-2 text-[10px] bg-white/90 px-2 py-1 rounded-lg 
      text-[#6B6656]">Demo map</div>
    </div> );
};
/* ============================================================ MAIN APP 
============================================================ */ export default function App() {
  const [lang, setLang] = useState("uz"); const t = STR[lang]; const [route, setRoute] = useState("landing"); // 
  landing, p-login, p-book, p-select, p-track, p-history, p-profile, d-register, d-dashboard, d-orders, 
  d-commission, d-profile, admin-login, admin-*, 404 const [showLangMenu, setShowLangMenu] = useState(false); 
  const [passenger, setPassenger] = useState(null); const [myDriverId, setMyDriverId] = useState(null); const 
  [adminAuthed, setAdminAuthed] = useState(false); const [drivers, setDrivers] = useState([]); const [orders, 
  setOrders] = useState([]); const [settings, setSettings] = useState(defaultSettings); const [booking, 
  setBooking] = useState({ pickupAddr: "", pickupLat: null, pickupLng: null, tariff: null }); const 
  [activeOrderId, setActiveOrderId] = useState(null); const pollRef = useRef(null); /* ---- initial load ---- */ 
  useEffect(() => {
    (async () => { let d = await loadShared("drivers", null); if (!d) { d = seedDrivers(); await 
      saveShared("drivers", d); } setDrivers(d); let o = await loadShared("orders", []); setOrders(o); let s = 
      await loadShared("settings", defaultSettings); setSettings(s); const p = await 
      loadPersonal("passenger-profile", null); if (p) setPassenger(p); const dId = await 
      loadPersonal("driver-id", null); if (dId) setMyDriverId(dId); const aOrder = await 
      loadPersonal("active-order", null); if (aOrder) setActiveOrderId(aOrder);
      // hidden admin route detection
      if (window.location.hash.includes(ADMIN_SLUG)) setRoute("admin-login");
    })();
  }, []);
  /* ---- poll shared data for realtime-ish sync ---- */ useEffect(() => { pollRef.current = setInterval(async 
    () => {
      const d = await loadShared("drivers", null); if (d) setDrivers(d); const o = await loadShared("orders", 
      []); setOrders(o); const s = await loadShared("settings", defaultSettings); setSettings(s);
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, []);
  const persistDrivers = async (next) => { setDrivers(next); await saveShared("drivers", next); }; const 
  persistOrders = async (next) => { setOrders(next); await saveShared("orders", next); }; const persistSettings 
  = async (next) => { setSettings(next); await saveShared("settings", next); }; const goto = (r) => { 
  setRoute(r); window.scrollTo(0, 0); }; /* ============ NAVBAR ============ */ const LangSwitch = () => (
    <div className="relative"> <button onClick={() => setShowLangMenu(v => !v)} className="flex items-center 
      gap-1 px-2.5 py-1.5 rounded-full bg-white/90 border border-[#D9D3C3] text-[13px] font-medium 
      text-[#3A362C]">
        <Globe size={14} /> {lang.toUpperCase()} </button> {showLangMenu && ( <div className="absolute right-0 
        mt-1 bg-white rounded-xl border border-[#EBE7DA] shadow-lg overflow-hidden z-30 min-w-[130px]">
          {Object.entries(LANGS).map(([code, label]) => ( <button key={code} onClick={() => { setLang(code); 
            setShowLangMenu(false); }}
              className={`block w-full text-left px-3.5 py-2.5 text-[14px] hover:bg-[#F7F5EF] ${lang === code ? 
              "text-[#1F5E52] font-semibold" : "text-[#3A362C]"}`}> {label}
            </button> ))} </div> )} </div> ); const TopBar = ({ title, onBack }) => ( <div className="flex 
    items-center justify-between px-4 py-3 sticky top-0 bg-[#FAF8F2]/95 backdrop-blur z-20 border-b 
    border-[#EBE7DA]">
      <div className="flex items-center gap-2 min-w-0"> {onBack && <button onClick={onBack} className="p-1.5 
        -ml-1.5 rounded-full hover:bg-[#F1EEE6]"><ChevronLeft size={20} /></button>} <span 
        className="font-semibold text-[16px] truncate text-[#221F17]">{title}</span>
      </div> <LangSwitch /> </div> ); const BottomNav = ({ active, items }) => ( <div className="fixed bottom-0 
    left-0 right-0 bg-white border-t border-[#EBE7DA] flex z-20">
      {items.map(it => ( <button key={it.key} onClick={it.onClick} className={`flex-1 flex flex-col items-center 
        gap-0.5 py-2.5 ${active === it.key ? "text-[#1F5E52]" : "text-[#9B9686]"}`}>
          {it.icon} <span className="text-[11px] font-medium">{it.label}</span> </button> ))} </div> ); /* 
  ============ LANDING ============ */ const Landing = () => (
    <div className="min-h-screen bg-[#FAF8F2] flex flex-col"> <div className="flex justify-end p-4"><LangSwitch 
      /></div> <div className="flex-1 flex flex-col justify-center px-6 pb-16">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#1F5E52] flex items-center justify-center mb-6"> 
          <Plane className="text-white" size={28} />
        </div> <h1 className="text-[26px] font-bold text-center text-[#221F17] leading-tight 
        mb-2">{t.routeName}</h1> <p className="text-center text-[#6B6656] text-[15px] mb-10">{t.tagline}</p> 
        <div className="space-y-3 max-w-sm mx-auto w-full">
          <Btn onClick={() => goto(passenger ? "p-book" : "p-login")}><Car size={18} />{t.bookRide}</Btn> <Btn 
          variant="secondary" onClick={() => goto(myDriverId ? "d-dashboard" : "d-register")}><User size={18} 
          />{t.becomeDriver}</Btn>
        </div> <p className="text-center text-[12px] text-[#9B9686] mt-8">{t.demoMode}</p> </div> </div> ); /* 
  ============ PASSENGER LOGIN ============ */ const PassengerLogin = () => {
    const [failed, setFailed] = useState(false); const [name, setName] = useState(""); const [phone, setPhone] = 
    useState(""); const fakeGoogle = () => setFailed(true); // simulated: always falls back to manual in demo 
    const submitManual = async () => {
      if (!name.trim() || !phone.trim()) return; const p = { name, phone, id: uid() }; setPassenger(p); await 
      savePersonal("passenger-profile", p); goto("p-book");
    };
    return ( <div className="min-h-screen bg-[#FAF8F2]"> <TopBar title={t.signInGoogle} onBack={() => 
        goto("landing")} /> <div className="p-5 max-w-sm mx-auto">
          {!failed ? ( <Btn onClick={fakeGoogle}><svg width="18" height="18" viewBox="0 0 48 48"><path 
            fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 
            12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 
            21-21c0-1.2-.1-2.4-.4-3.5z"/></svg>{t.signInGoogle}</Btn>
          ) : ( <Card className="mt-3"> <p className="text-[14px] text-[#B3432B] mb-3 flex gap-2 
              items-start"><AlertTriangle size={16} className="shrink-0 mt-0.5"/>{t.googleFailed}</p> <Field 
              label={t.fullName}><input className={inputCls} value={name} onChange={e => 
              setName(e.target.value)} /></Field> <Field label={t.phone}><input className={inputCls} 
              value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998" /></Field> <Btn 
              onClick={submitManual} disabled={!name.trim() || !phone.trim()}>{t.continue}</Btn>
            </Card> )} </div> </div> );
  };
  /* ============ BOOK RIDE ============ */ const BookRide = () => { const [addr, setAddr] = 
    useState(booking.pickupAddr); const [coords, setCoords] = useState(booking.pickupLat ? { lat: 
    booking.pickupLat, lng: booking.pickupLng } : null); const [locating, setLocating] = useState(false); const 
    [tariff, setTariff] = useState(booking.tariff); const useLocation = () => {
      setLocating(true); setTimeout(() => { // demo geolocation const c = { lat: jitter(MAKKAH_CENTER.lat, 
        0.03), lng: jitter(MAKKAH_CENTER.lng, 0.03) }; setCoords(c); setAddr(`${c.lat.toFixed(5)}, 
        ${c.lng.toFixed(5)} (Makkah)`); setLocating(false);
      }, 1200);
    };
    const canContinue = addr.trim() && tariff; const next = () => { setBooking({ pickupAddr: addr, pickupLat: 
      coords?.lat ?? jitter(MAKKAH_CENTER.lat), pickupLng: coords?.lng ?? jitter(MAKKAH_CENTER.lng), tariff }); 
      goto("p-select");
    };
    return ( <div className="min-h-screen bg-[#FAF8F2] pb-28"> <TopBar title={t.bookRide} onBack={() => 
        goto("landing")} /> <div className="p-4 max-w-sm mx-auto space-y-4">
          <Card> <Field label={t.pickup}> <input className={inputCls} placeholder={t.pickupManual} value={addr} 
              onChange={e => setAddr(e.target.value)} /> <p className="text-[11px] text-[#9B9686] 
              mt-1">{t.pickupHint}</p>
            </Field> <Btn variant="outline" onClick={useLocation} disabled={locating}> <Navigation size={16} 
              />{locating ? t.locating : t.useMyLocation}
            </Btn> </Card> <Card> <Field label={t.destination}> <div className="flex items-center gap-2 px-3.5 
              py-3 rounded-xl bg-[#F1EEE6] text-[#3A362C] text-[14px]">
                <Plane size={16} className="text-[#1F5E52] shrink-0" /> {t.destFixed} </div> </Field> </Card> 
          <div>
            <p className="text-[13px] font-medium text-[#6B6656] mb-2">{t.chooseTariff}</p> <div 
            className="space-y-2.5">
              {TARIFFS.map(tr => ( <button key={tr.id} onClick={() => setTariff(tr.id)} className={`w-full 
                  text-left p-3.5 rounded-2xl border-2 flex items-center justify-between transition ${tariff === 
                  tr.id ? "border-[#1F5E52] bg-[#E5F1EC]" : "border-[#EBE7DA] bg-white"}`}> <div className="flex 
                  items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 
                    tr.color + "22" }}>
                      <Car size={18} style={{ color: tr.color }} /> </div> <div> <p className="font-semibold 
                      text-[#221F17] text-[14px]">{t[tr.id]}</p> <p className="text-[12px] 
                      text-[#9B9686]">{t.carType}: {t[tr.carType]} · {tr.maxPax} {t.maxPax}</p>
                    </div> </div> <span className="text-[13px] font-semibold 
                  text-[#1F5E52]">{t.priceConfirm}</span>
                </button> ))} </div> </div> </div> <div className="fixed bottom-0 left-0 right-0 p-4 
        bg-[#FAF8F2] border-t border-[#EBE7DA]">
          <div className="max-w-sm mx-auto"><Btn onClick={next} 
          disabled={!canContinue}>{t.findDrivers}</Btn></div>
        </div> </div> );
  };
  /* ============ DRIVER SELECT ============ */ const DriverSelect = () => { const matching = drivers.filter(d 
    => d.online && d.status === "active" && d.tariff === booking.tariff); const chooseDriver = async (driver) => 
    {
      const tariffDef = TARIFFS.find(x => x.id === booking.tariff); const order = { id: uid(), passengerId: 
        passenger.id, passengerName: passenger.name, passengerPhone: passenger.phone, driverId: driver.id, 
        pickupAddr: booking.pickupAddr, pickupLat: booking.pickupLat, pickupLng: booking.pickupLng, destination: 
        "Jeddah Airport (JED)", tariff: booking.tariff, price: tariffDef.price, status: "assigned", createdAt: 
        Date.now(), acceptedAt: null, completedAt: null, commissionAmount: null, commissionStatus: null,
      };
      const next = [order, ...orders]; await persistOrders(next); setActiveOrderId(order.id); await 
      savePersonal("active-order", order.id); goto("p-track");
    };
    return ( <div className="min-h-screen bg-[#FAF8F2] pb-6"> <TopBar title={t.chooseTariff} onBack={() => 
        goto("p-book")} /> <div className="p-4 max-w-sm mx-auto space-y-3">
          {matching.length === 0 && ( <Card><p className="text-[14px] text-[#6B6656] text-center 
            py-4">{t.noDrivers}</p></Card>
          )} {matching.map(d => ( <Card key={d.id} className="flex items-center justify-between"> <div 
              className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-[#F1EEE6] flex items-center justify-center shrink-0"> 
                  <User size={20} className="text-[#6B6656]" />
                </div> <div className="min-w-0"> <p className="font-semibold text-[14px] text-[#221F17] 
                  truncate">{d.name}</p> <p className="text-[12px] text-[#9B9686] truncate">{d.carMake} 
                  {d.carYear} · {d.plate}</p> <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-0.5 text-[12px] text-[#B08A2E]"><Star size={12} 
                    fill="#B08A2E" />{d.rating}</span> <span className="text-[12px] text-[#1F5E52]">~{5 + 
                    Math.floor(Math.random()*10)} {t.eta==="ETA"?"min":"daq"}</span>
                  </div> </div> </div> <Btn variant="secondary" className="w-auto px-4 py-2 shrink-0" 
              onClick={() => chooseDriver(d)}>{t.selectDriver}</Btn>
            </Card> ))} </div> </div> );
  };
  /* ============ TRACKING ============ */ const Tracking = () => { const order = orders.find(o => o.id === 
    activeOrderId); const driver = order ? drivers.find(d => d.id === order.driverId) : null; const [rating, 
    setRating] = useState(0); const [reviewed, setReviewed] = useState(false); if (!order) return (
      <div className="min-h-screen bg-[#FAF8F2]"><TopBar title={t.myRides} onBack={() => goto("landing")} /> <p 
        className="text-center text-[#9B9686] mt-10">{t.noRidesYet}</p></div>
    ); const cancel = async () => { const next = orders.map(o => o.id === order.id ? { ...o, status: "cancelled" 
      } : o);
      await persistOrders(next); setActiveOrderId(null); await savePersonal("active-order", null); 
      goto("landing");
    };
    const statusIdx = STATUS_FLOW.indexOf(order.status); return ( <div className="min-h-screen bg-[#FAF8F2] 
      pb-8">
        <TopBar title={t.orderCreated} onBack={() => goto("landing")} /> <div className="p-4 max-w-sm mx-auto 
        space-y-4">
          <MockMap driverPos={driver ? { lat: driver.lat, lng: driver.lng } : null} pickupPos={{ lat: 
          order.pickupLat, lng: order.pickupLng }} /> <Card>
            <div className="flex items-center gap-2 mb-3"> <div className="w-2.5 h-2.5 rounded-full bg-[#1F5E52] 
              animate-pulse" /> <p className="font-semibold text-[15px] text-[#221F17]">{t["status_" + 
              order.status] || order.status}</p>
            </div> {order.status !== "cancelled" && order.status !== "completed" && ( <div className="flex 
              gap-1">
                {STATUS_FLOW.map((s, i) => ( <div key={s} className={`flex-1 h-1.5 rounded-full ${i <= statusIdx 
                  ? "bg-[#1F5E52]" : "bg-[#EBE7DA]"}`} />
                ))} </div> )} </Card> {driver && ( <Card> <p className="text-[13px] font-medium text-[#6B6656] 
              mb-2">{t.passengerInfo === "Passenger" ? "Driver" : "Haydovchi"}</p> <div className="flex 
              items-center justify-between">
                <div> <p className="font-semibold text-[14px] text-[#221F17]">{driver.name}</p> <p 
                  className="text-[12px] text-[#9B9686]">{driver.carMake} {driver.carYear} · {driver.plate}</p>
                </div> <div className="flex gap-2"> <a href={`tel:${driver.phone}`} className="w-10 h-10 
                  rounded-full bg-[#E5F1EC] flex items-center justify-center text-[#1F5E52]"><Phone size={16} 
                  /></a> <a href={`https://t.me/${driver.telegram}`} target="_blank" rel="noreferrer" 
                  className="w-10 h-10 rounded-full bg-[#E5F1EC] flex items-center justify-center 
                  text-[#1F5E52]"><Send size={16} /></a>
                </div> </div> </Card> )} {order.status === "completed" && !reviewed && ( <Card> <p 
              className="text-[14px] font-medium mb-2">{t.rateTrip}</p> <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(n => ( <button key={n} onClick={() => setRating(n)}><Star size={26} fill={n <= 
                  rating ? "#B08A2E" : "none"} stroke="#B08A2E" /></button>
                ))} </div> <Btn onClick={() => setReviewed(true)} disabled={!rating}>{t.submitReview}</Btn> 
            </Card>
          )} {reviewed && <p className="text-center text-[#1F5E52] font-medium">{t.thanksReview}</p>} 
          {["assigned", "driver_coming"].includes(order.status) && (
            <Btn variant="danger" onClick={cancel}>{t.cancelOrder}</Btn> )} </div> </div> );
  };
  /* ============ PASSENGER HISTORY / PROFILE ============ */ const PassengerHistory = () => { const mine = 
    orders.filter(o => o.passengerId === passenger?.id).sort((a,b) => b.createdAt - a.createdAt); return (
      <div className="min-h-screen bg-[#FAF8F2] pb-20"> <TopBar title={t.myRides} /> <div className="p-4 
        max-w-sm mx-auto space-y-2.5">
          {mine.length === 0 && <p className="text-center text-[#9B9686] mt-10">{t.noRidesYet}</p>} {mine.map(o 
          => (
            <Card key={o.id} className="flex items-center justify-between cursor-pointer" > <div onClick={() => 
              { setActiveOrderId(o.id); goto("p-track"); }} className="min-w-0">
                <p className="text-[14px] font-medium text-[#221F17]">{t[o.tariff]} · {o.price} SAR</p> <p 
                className="text-[12px] text-[#9B9686]">{new Date(o.createdAt).toLocaleString()}</p>
              </div> <StatusBadge status={o.status === "completed" ? "paid" : o.status === "cancelled" ? 
              "blocked" : "pending"} t={t} />
            </Card> ))} </div> <BottomNav active="rides" items={[ { key: "home", icon: <Home size={20}/>, label: 
          t.home, onClick: () => goto("landing") }, { key: "rides", icon: <List size={20}/>, label: t.myRides, 
          onClick: () => goto("p-history") }, { key: "profile", icon: <User size={20}/>, label: t.profile, 
          onClick: () => goto("p-profile") },
        ]}/> </div> );
  };
  const PassengerProfile = () => ( <div className="min-h-screen bg-[#FAF8F2] pb-20"> <TopBar title={t.profile} 
      /> <div className="p-4 max-w-sm mx-auto space-y-3">
        <Card> <p className="font-semibold text-[16px] text-[#221F17]">{passenger?.name}</p> <p 
          className="text-[13px] text-[#9B9686]">{passenger?.phone}</p>
        </Card> <Btn variant="outline" onClick={async () => { setPassenger(null); await 
        savePersonal("passenger-profile", null); goto("landing"); }}><LogOut size={16}/>{t.logout}</Btn>
      </div> <BottomNav active="profile" items={[ { key: "home", icon: <Home size={20}/>, label: t.home, 
        onClick: () => goto("landing") }, { key: "rides", icon: <List size={20}/>, label: t.myRides, onClick: () 
        => goto("p-history") }, { key: "profile", icon: <User size={20}/>, label: t.profile, onClick: () => 
        goto("p-profile") },
      ]}/> </div> ); /* ============ DRIVER REGISTRATION ============ */ const DriverRegister = () => { const 
    [f, setF] = useState({ name: "", phone: "", carMake: "", carYear: "", plate: "", carType: "sedan", tariff: 
    "economy", telegram: "" }); const [agreeRoute, setAgreeRoute] = useState(false); const [agreeCommission, 
    setAgreeCommission] = useState(false); const set = (k, v) => setF(prev => ({ ...prev, [k]: v })); const 
    canSubmit = f.name && f.phone && f.carMake && f.carYear && f.plate && agreeRoute && agreeCommission; const 
    submit = async () => {
      if (!canSubmit) return; const driver = { id: uid(), name: f.name, phone: f.phone, carMake: f.carMake, 
        carYear: f.carYear, plate: f.plate, carType: f.carType, tariff: f.tariff, online: false, status: 
        "active", rating: 5.0, lat: jitter(MAKKAH_CENTER.lat), lng: jitter(MAKKAH_CENTER.lng), 
        commissionBalance: 0, telegram: f.telegram || "driver_support",
      };
      const next = [...drivers, driver]; await persistDrivers(next); setMyDriverId(driver.id); await 
      savePersonal("driver-id", driver.id); goto("d-dashboard");
    };
    return ( <div className="min-h-screen bg-[#FAF8F2] pb-8"> <TopBar title={t.driverRegTitle} onBack={() => 
        goto("landing")} /> <div className="p-4 max-w-sm mx-auto">
          <Card> <Field label={t.fullName}><input className={inputCls} value={f.name} onChange={e => set("name", 
            e.target.value)} /></Field> <Field label={t.phone}><input className={inputCls} value={f.phone} 
            onChange={e => set("phone", e.target.value)} placeholder="+998" /></Field> <Field 
            label={t.carMakeModel}><input className={inputCls} value={f.carMake} onChange={e => set("carMake", 
            e.target.value)} /></Field> <Field label={t.carYear}><input className={inputCls} value={f.carYear} 
            onChange={e => set("carYear", e.target.value)} inputMode="numeric" /></Field> <Field 
            label={t.plateNumber}><input className={inputCls} value={f.plate} onChange={e => set("plate", 
            e.target.value)} /></Field> <Field label={t.carType}>
              <select className={inputCls} value={f.carType} onChange={e => set("carType", e.target.value)}> 
                {["sedan","suv","van","minivan","other"].map(ct => <option key={ct} 
                value={ct}>{t[ct]}</option>)}
              </select> </Field> <Field label={t.tariffCategory}> <select className={inputCls} value={f.tariff} 
              onChange={e => set("tariff", e.target.value)}>
                {TARIFFS.map(tr => <option key={tr.id} value={tr.id}>{t[tr.id]}</option>)} </select> </Field> 
            <Field label="Telegram username">
              <input className={inputCls} value={f.telegram} onChange={e => set("telegram", e.target.value)} 
              placeholder="username" />
            </Field> <div className="bg-[#FBF3DE] rounded-xl p-3 mb-3 text-[13px] text-[#8A6A0E] flex gap-2 
            items-start">
              <DollarSign size={16} className="shrink-0 mt-0.5" /> {t.commissionNotice} </div> <label 
            className="flex items-start gap-2.5 mb-2.5 text-[13px] text-[#3A362C]">
              <input type="checkbox" className="mt-0.5" checked={agreeRoute} onChange={e => 
              setAgreeRoute(e.target.checked)} /> {t.agreeRoute}
            </label> <label className="flex items-start gap-2.5 mb-4 text-[13px] text-[#3A362C]"> <input 
              type="checkbox" className="mt-0.5" checked={agreeCommission} onChange={e => 
              setAgreeCommission(e.target.checked)} /> {t.agreeCommission}
            </label> <Btn onClick={submit} disabled={!canSubmit}>{t.register}</Btn> {!canSubmit && (f.name || 
            f.phone) && <p className="text-[12px] text-[#B3432B] text-center mt-2">{t.mustAgree}</p>}
          </Card> </div> </div> );
  };
  /* ============ DRIVER DASHBOARD ============ */ const useMyDriver = () => drivers.find(d => d.id === 
  myDriverId); const DriverDashboard = () => {
    const me = useMyDriver(); if (!me) return null; const incoming = orders.filter(o => o.driverId === me.id && 
    o.status === "assigned"); const active = orders.filter(o => o.driverId === me.id && 
    !["assigned","completed","cancelled"].includes(o.status));
    const toggleOnline = async () => { if (me.status === "blocked") return; const next = drivers.map(d => d.id 
      === me.id ? { ...d, online: !d.online } : d); await persistDrivers(next);
    };
    const accept = async (order) => { const next = orders.map(o => o.id === order.id ? { ...o, status: 
      "driver_coming", acceptedAt: Date.now() } : o); await persistOrders(next);
    };
    const reject = async (order) => { const next = orders.map(o => o.id === order.id ? { ...o, status: 
      "cancelled" } : o); await persistOrders(next);
    };
    const advance = async (order) => { const idx = STATUS_FLOW.indexOf(order.status); const nextStatus = 
      STATUS_FLOW[idx + 1]; if (!nextStatus) return; let commissionAmount = order.commissionAmount, 
      commissionStatus = order.commissionStatus; if (nextStatus === "completed") {
        commissionAmount = +(order.price * (settings.commissionPercent / 100)).toFixed(2); commissionStatus = 
        "pending"; const nd = drivers.map(d => d.id === me.id ? { ...d, commissionBalance: +(d.commissionBalance 
        + commissionAmount).toFixed(2) } : d); await persistDrivers(nd);
      }
      const next = orders.map(o => o.id === order.id ? { ...o, status: nextStatus, completedAt: nextStatus === 
      "completed" ? Date.now() : o.completedAt, commissionAmount, commissionStatus } : o); await 
      persistOrders(next);
    };
    return ( <div className="min-h-screen bg-[#FAF8F2] pb-20"> <TopBar title={t.dashboard} /> <div 
        className="p-4 max-w-sm mx-auto space-y-4">
          {me.status === "blocked" && ( <div className="bg-[#FBE9E4] text-[#B3432B] text-[13px] rounded-xl p-3 
            flex gap-2 items-center"><Ban size={16}/>{t.blockedNotice}</div>
          )} <Card className="flex items-center justify-between"> <div> <p className="font-semibold text-[15px] 
              text-[#221F17]">{me.name}</p> <p className="text-[12px] text-[#9B9686]">{me.carMake} {me.carYear} 
              · {t[me.tariff]}</p>
            </div> <button onClick={toggleOnline} disabled={me.status === "blocked"} className="flex 
            items-center gap-1.5 disabled:opacity-40">
              {me.online ? <ToggleRight size={34} className="text-[#1F5E52]" /> : <ToggleLeft size={34} 
              className="text-[#9B9686]" />}
            </button> </Card> <div className="flex items-center gap-2 text-[13px]"> {me.online ? <Wifi size={15} 
            className="text-[#1F5E52]" /> : <WifiOff size={15} className="text-[#9B9686]" />} <span 
            className={me.online ? "text-[#1F5E52] font-medium" : "text-[#9B9686]"}>{me.online ? t.online : 
            t.offline}</span>
          </div> {active.length > 0 && ( <div> <p className="text-[13px] font-medium text-[#6B6656] 
              mb-2">Active</p> {active.map(o => (
                <Card key={o.id} className="mb-2.5"> <p className="text-[14px] font-medium text-[#221F17] 
                  mb-1">{o.pickupAddr}</p> <p className="text-[12px] text-[#9B9686] mb-2">{t.passengerInfo}: 
                  {o.passengerName} · {o.passengerPhone}</p> <p className="text-[13px] text-[#1F5E52] 
                  font-medium mb-2">{t["status_" + o.status]}</p> <div className="flex gap-2">
                    <a href={`tel:${o.passengerPhone}`} className="w-10 h-10 rounded-full bg-[#E5F1EC] flex 
                    items-center justify-center text-[#1F5E52]"><Phone size={16} /></a> <Btn className="flex-1" 
                    onClick={() => advance(o)}>{t.nextStatus} <ChevronRight size={16}/></Btn>
                  </div> </Card> ))} </div> )} <div> <p className="text-[13px] font-medium text-[#6B6656] 
            mb-2">{t.incomingOrders}</p> {incoming.length === 0 && <p className="text-[13px] 
            text-[#9B9686]">{t.noIncoming}</p>} {incoming.map(o => (
              <Card key={o.id} className="mb-2.5"> <p className="text-[14px] font-medium text-[#221F17] 
                mb-1">{o.pickupAddr}</p> <p className="text-[12px] text-[#9B9686] mb-1">{t.passengerInfo}: 
                {o.passengerName}</p> <p className="text-[12px] text-[#9B9686] mb-3">{t.estDistance}: ~{5 + 
                Math.floor(Math.random()*15)} km</p> <div className="flex gap-2">
                  <Btn variant="danger" className="flex-1" onClick={() => reject(o)}><X 
                  size={16}/>{t.reject}</Btn> <Btn className="flex-1" onClick={() => accept(o)}><Check 
                  size={16}/>{t.accept}</Btn>
                </div> </Card> ))} </div> </div> <BottomNav active="dashboard" items={[ { key: "dashboard", 
          icon: <Home size={20}/>, label: t.home, onClick: () => goto("d-dashboard") }, { key: "commission", 
          icon: <DollarSign size={20}/>, label: t.commission, onClick: () => goto("d-commission") }, { key: 
          "profile", icon: <User size={20}/>, label: t.profile, onClick: () => goto("d-profile") },
        ]}/> </div> );
  };
  const DriverCommission = () => { const me = useMyDriver(); if (!me) return null; const mine = orders.filter(o 
    => o.driverId === me.id && o.commissionStatus); const payOnline = async (order) => {
      const next = orders.map(o => o.id === order.id ? { ...o, commissionStatus: "paid" } : o); await 
      persistOrders(next); const nd = drivers.map(d => d.id === me.id ? { ...d, commissionBalance: 
      +(d.commissionBalance - order.commissionAmount).toFixed(2) } : d); await persistDrivers(nd);
    };
    const payCash = async (order) => { const next = orders.map(o => o.id === order.id ? { ...o, 
      commissionStatus: "cash_requested" } : o); await persistOrders(next); window.open(settings.telegramLink, 
      "_blank");
    };
    return ( <div className="min-h-screen bg-[#FAF8F2] pb-20"> <TopBar title={t.commission} /> <div 
        className="p-4 max-w-sm mx-auto space-y-3">
          <Card> <p className="text-[13px] text-[#6B6656]">{t.commissionBalance}</p> <p className="text-[24px] 
            font-bold text-[#221F17]">{me.commissionBalance.toFixed(2)} SAR</p>
          </Card> {mine.length === 0 && <p className="text-center text-[#9B9686] mt-6 text-[13px]">—</p>} 
          {mine.map(o => (
            <Card key={o.id}> <div className="flex items-center justify-between mb-2"> <p className="text-[14px] 
                font-medium text-[#221F17]">{o.commissionAmount} SAR</p> <StatusBadge 
                status={o.commissionStatus} t={t} />
              </div> <p className="text-[12px] text-[#9B9686] mb-2">{new 
              Date(o.completedAt).toLocaleString()}</p> {o.commissionStatus === "pending" && (
                <div className="flex gap-2"> <Btn variant="outline" className="flex-1" onClick={() => 
                  payCash(o)}><Send size={14}/>{t.payCash}</Btn> <Btn className="flex-1" onClick={() => 
                  payOnline(o)}><CreditCard size={14}/>{t.payOnline}</Btn>
                </div> )} {o.commissionStatus === "cash_requested" && ( <Btn variant="outline" onClick={() => 
                window.open(settings.telegramLink, "_blank")}><Send size={14}/>{t.openTelegram}</Btn>
              )} </Card> ))} </div> <BottomNav active="commission" items={[ { key: "dashboard", icon: <Home 
          size={20}/>, label: t.home, onClick: () => goto("d-dashboard") }, { key: "commission", icon: 
          <DollarSign size={20}/>, label: t.commission, onClick: () => goto("d-commission") }, { key: "profile", 
          icon: <User size={20}/>, label: t.profile, onClick: () => goto("d-profile") },
        ]}/> </div> );
  };
  const DriverProfile = () => { const me = useMyDriver(); if (!me) return null; return ( <div 
      className="min-h-screen bg-[#FAF8F2] pb-20">
        <TopBar title={t.driverProfile} /> <div className="p-4 max-w-sm mx-auto space-y-3"> <Card> <p 
            className="font-semibold text-[16px] text-[#221F17]">{me.name}</p> <p className="text-[13px] 
            text-[#9B9686] mb-2">{me.phone}</p> <p className="text-[13px] text-[#3A362C]">{me.carMake} 
            {me.carYear} · {me.plate}</p> <p className="text-[13px] text-[#3A362C]">{t[me.carType]} · 
            {t[me.tariff]}</p> <div className="mt-2"><StatusBadge status={me.status} t={t} /></div>
          </Card> <Btn variant="outline" onClick={async () => { setMyDriverId(null); await 
          savePersonal("driver-id", null); goto("landing"); }}><LogOut size={16}/>{t.logout}</Btn>
        </div> <BottomNav active="profile" items={[ { key: "dashboard", icon: <Home size={20}/>, label: t.home, 
          onClick: () => goto("d-dashboard") }, { key: "commission", icon: <DollarSign size={20}/>, label: 
          t.commission, onClick: () => goto("d-commission") }, { key: "profile", icon: <User size={20}/>, label: 
          t.profile, onClick: () => goto("d-profile") },
        ]}/> </div> );
  };
  /* ============ ADMIN ============ */ const AdminLogin = () => { const [email, setEmail] = useState(""); const 
    [pass, setPass] = useState(""); const [err, setErr] = useState(false); const submit = () => {
      if (email === ADMIN_EMAIL && pass === ADMIN_PASS) { setAdminAuthed(true); setErr(false); 
      goto("admin-dashboard"); } else setErr(true);
    };
    return ( <div className="min-h-screen bg-[#1B1B16] flex items-center justify-center px-6"> <div 
        className="w-full max-w-sm">
          <div className="flex justify-center mb-6"><Shield className="text-[#B08A2E]" size={32}/></div> <h1 
          className="text-white text-[19px] font-semibold text-center mb-6">{t.adminLogin}</h1> <div 
          className="bg-[#242420] rounded-2xl p-4">
            <Field label={t.email}><input className={inputCls} value={email} onChange={e => 
            setEmail(e.target.value)} /></Field> <Field label={t.password}><input type="password" 
            className={inputCls} value={pass} onChange={e => setPass(e.target.value)} /></Field> {err && <p 
            className="text-[#E88 ]text-[13px] text-[#E88686] mb-2">{t.invalidLogin}</p>} <Btn 
            onClick={submit}>{t.login}</Btn> <p className="text-[11px] text-[#8A8676] text-center mt-3">demo: 
            {ADMIN_EMAIL} / {ADMIN_PASS}</p>
          </div> </div> </div> );
  };
  const AdminShell = ({ title, children, active }) => ( <div className="min-h-screen bg-[#F5F4EE] pb-20"> <div 
      className="bg-[#1B1B16] text-white px-4 py-3.5 sticky top-0 z-20 flex items-center justify-between">
        <span className="font-semibold text-[15px]">{title}</span> <button onClick={() => { 
        setAdminAuthed(false); goto("landing"); window.location.hash=""; }} className="text-[12px] 
        text-[#B08A2E] flex items-center gap-1"><LogOut size={14}/>{t.logout}</button>
      </div> <div className="p-4 max-w-2xl mx-auto">{children}</div> <div className="fixed bottom-0 left-0 
      right-0 bg-[#1B1B16] flex z-20 overflow-x-auto">
        {[ { key: "admin-dashboard", icon: <Home size={18}/>, label: t.dashboard }, { key: "admin-drivers", 
          icon: <Users size={18}/>, label: t.driversList }, { key: "admin-orders", icon: <List size={18}/>, 
          label: t.allOrders }, { key: "admin-commissions", icon: <DollarSign size={18}/>, label: 
          t.commissionMgmt }, { key: "admin-settings", icon: <SettingsIcon size={18}/>, label: t.settings },
        ].map(it => ( <button key={it.key} onClick={() => goto(it.key)} className={`flex-1 flex flex-col 
          items-center gap-0.5 py-2.5 min-w-[70px] ${active === it.key ? "text-[#B08A2E]" : "text-[#8A8676]"}`}>
            {it.icon}<span className="text-[10px] font-medium">{it.label}</span> </button> ))} </div> </div> ); 
  const StatBox = ({ label, value }) => (
    <div className="bg-white rounded-2xl border border-[#EBE7DA] p-3.5"> <p className="text-[11px] 
      text-[#9B9686] mb-1">{label}</p> <p className="text-[20px] font-bold text-[#221F17]">{value}</p>
    </div> ); const AdminDashboard = () => { const stats = { total: drivers.length, active: drivers.filter(d => 
      d.online && d.status === "active").length, offline: drivers.filter(d => !d.online && d.status !== 
      "blocked").length, blocked: drivers.filter(d => d.status === "blocked").length, activeOrders: 
      orders.filter(o => !["completed","cancelled"].includes(o.status)).length, completedOrders: orders.filter(o 
      => o.status === "completed").length, pendingCommissions: orders.filter(o => o.commissionStatus === 
      "pending" || o.commissionStatus === "cash_requested").length, paidCommissions: orders.filter(o => 
      o.commissionStatus === "paid").length,
    };
    return ( <AdminShell title={t.dashboard} active="admin-dashboard"> <div className="grid grid-cols-2 gap-3"> 
          <StatBox label={t.totalDrivers} value={stats.total} /> <StatBox label={t.activeDrivers} 
          value={stats.active} /> <StatBox label={t.blockedDrivers} value={stats.blocked} /> <StatBox 
          label={t.activeOrders} value={stats.activeOrders} /> <StatBox label={t.completedOrders} 
          value={stats.completedOrders} /> <StatBox label={t.pendingCommissions} 
          value={stats.pendingCommissions} /> <StatBox label={t.paidCommissions} value={stats.paidCommissions} 
          />
        </div> </AdminShell> );
  };
  const AdminDrivers = () => { const toggleBlock = async (d) => { const next = drivers.map(x => x.id === d.id ? 
      { ...x, status: x.status === "blocked" ? "active" : "blocked", online: x.status === "blocked" ? x.online : 
      false } : x); await persistDrivers(next);
    };
    return ( <AdminShell title={t.driversList} active="admin-drivers"> <div className="space-y-2.5"> 
          {drivers.map(d => (
            <Card key={d.id}> <div className="flex items-center justify-between mb-2"> <div> <p 
                  className="font-semibold text-[14px] text-[#221F17]">{d.name}</p> <p className="text-[12px] 
                  text-[#9B9686]">{d.carMake} {d.carYear} · {d.plate} · {t[d.tariff]}</p> <p 
                  className="text-[12px] text-[#9B9686]">{d.phone}</p>
                </div> <StatusBadge status={d.status} t={t} /> </div> <p className="text-[12px] text-[#6B6656] 
              mb-2">{t.commissionBalance}: {d.commissionBalance.toFixed(2)} SAR</p> <Btn variant={d.status === 
              "blocked" ? "primary" : "danger"} onClick={() => toggleBlock(d)}>
                {d.status === "blocked" ? <><Check size={15}/>{t.unblock}</> : <><Ban size={15}/>{t.block}</>} 
              </Btn>
            </Card> ))} </div> </AdminShell> );
  };
  const AdminOrders = () => ( <AdminShell title={t.allOrders} active="admin-orders"> <div 
      className="space-y-2.5">
        {orders.length === 0 && <p className="text-center text-[#9B9686] text-[13px] mt-6">—</p>} 
        {orders.slice().sort((a,b)=>b.createdAt-a.createdAt).map(o => {
          const d = drivers.find(x => x.id === o.driverId); return ( <Card key={o.id}> <div className="flex 
              items-center justify-between mb-1">
                <p className="text-[14px] font-medium text-[#221F17]">{o.passengerName} → {d?.name || "—"}</p> 
                <StatusBadge status={o.status === "completed" ? "paid" : o.status === "cancelled" ? "blocked" : 
                "pending"} t={t} />
              </div> <p className="text-[12px] text-[#9B9686]">{o.pickupAddr} → {o.destination}</p> <p 
              className="text-[12px] text-[#9B9686]">{t[o.tariff]} · {o.price} SAR · {new 
              Date(o.createdAt).toLocaleString()}</p>
            </Card> );
        })}
      </div> </AdminShell> ); const AdminCommissions = () => { const withCommission = orders.filter(o => 
    o.commissionStatus); const markPaid = async (o) => {
      const next = orders.map(x => x.id === o.id ? { ...x, commissionStatus: "paid" } : x); await 
      persistOrders(next); const d = drivers.find(x => x.id === o.driverId); if (d) {
        const nd = drivers.map(x => x.id === d.id ? { ...x, commissionBalance: +(x.commissionBalance - 
        o.commissionAmount).toFixed(2) } : x); await persistDrivers(nd);
      }
    };
    return ( <AdminShell title={t.commissionMgmt} active="admin-commissions"> <div className="space-y-2.5"> 
          {withCommission.length === 0 && <p className="text-center text-[#9B9686] text-[13px] mt-6">—</p>} 
          {withCommission.map(o => {
            const d = drivers.find(x => x.id === o.driverId); return ( <Card key={o.id}> <div className="flex 
                items-center justify-between mb-1">
                  <p className="text-[14px] font-medium text-[#221F17]">{d?.name}</p> <StatusBadge 
                  status={o.commissionStatus} t={t} />
                </div> <p className="text-[12px] text-[#9B9686] mb-2">{o.commissionAmount} SAR · {new 
                Date(o.completedAt).toLocaleString()}</p> {o.commissionStatus !== "paid" && (
                  <div className="flex gap-2"> {d?.telegram && <a href={`https://t.me/${d.telegram}`} 
                    target="_blank" rel="noreferrer" className="flex-1"><Btn variant="outline"><Send 
                    size={14}/>Telegram</Btn></a>} <Btn className="flex-1" onClick={() => markPaid(o)}><Check 
                    size={14}/>{t.markPaid}</Btn>
                  </div> )} </Card> );
          })}
        </div> </AdminShell> );
  };
  const AdminSettings = () => { const [pct, setPct] = useState(settings.commissionPercent); const [link, 
    setLink] = useState(settings.telegramLink); const [saved, setSaved] = useState(false); const save = async () 
    => {
      await persistSettings({ commissionPercent: +pct, telegramLink: link }); setSaved(true); setTimeout(() => 
      setSaved(false), 1500);
    };
    return ( <AdminShell title={t.settings} active="admin-settings"> <Card> <Field 
          label={t.commissionPercent}><input type="number" className={inputCls} value={pct} onChange={e => 
          setPct(e.target.value)} /></Field> <Field label={t.telegramLink}><input className={inputCls} 
          value={link} onChange={e => setLink(e.target.value)} /></Field> <Btn onClick={save}>{saved ? t.saved : 
          t.save}</Btn>
        </Card> </AdminShell> );
  };
  /* ============ ROUTER ============ */ const requireAdmin = (Comp) => adminAuthed ? <Comp /> : <AdminLogin />; 
  const pages = {
    "landing": <Landing />, "p-login": <PassengerLogin />, "p-book": passenger ? <BookRide /> : <PassengerLogin 
    />, "p-select": passenger ? <DriverSelect /> : <PassengerLogin />, "p-track": passenger ? <Tracking /> : 
    <PassengerLogin />, "p-history": passenger ? <PassengerHistory /> : <PassengerLogin />, "p-profile": 
    passenger ? <PassengerProfile /> : <PassengerLogin />, "d-register": <DriverRegister />, "d-dashboard": 
    myDriverId ? <DriverDashboard /> : <DriverRegister />, "d-commission": myDriverId ? <DriverCommission /> : 
    <DriverRegister />, "d-profile": myDriverId ? <DriverProfile /> : <DriverRegister />, "admin-login": 
    <AdminLogin />, "admin-dashboard": requireAdmin(AdminDashboard), "admin-drivers": 
    requireAdmin(AdminDrivers), "admin-orders": requireAdmin(AdminOrders), "admin-commissions": 
    requireAdmin(AdminCommissions), "admin-settings": requireAdmin(AdminSettings),
  };
  return ( <div className="font-sans" style={{ fontFamily: "'Inter', system-ui, sans-serif" }} onClick={() => 
    showLangMenu && setShowLangMenu(false)}>
      {pages[route] || <Landing />} </div> );
}
