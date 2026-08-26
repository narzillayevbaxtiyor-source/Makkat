import { supabase } from "./supabase";

/* ============== PROFILES ============== */
export async function getMyProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function ensureProfile({ role, fullName, phone }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data: existing } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (existing) return existing;
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      role,
      full_name: fullName || user.user_metadata?.full_name || "",
      phone: phone || user.user_metadata?.phone || "",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ============== PASSENGERS ============== */
export async function ensurePassengerRow() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data: existing } = await supabase.from("passengers").select("*").eq("id", user.id).maybeSingle();
  if (existing) return existing;
  const { data, error } = await supabase.from("passengers").insert({ id: user.id }).select().single();
  if (error) throw error;
  return data;
}

/* ============== DRIVERS ============== */
export async function listOnlineDriversByTariff(tariff) {
  const { data, error } = await supabase
    .from("drivers")
    .select("*, vehicles(*)")
    .eq("tariff", tariff)
    .eq("online", true)
    .eq("status", "active");
  if (error) throw error;
  return data;
}

export async function listAllDrivers() {
  const { data, error } = await supabase.from("drivers").select("*, vehicles(*)").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getMyDriver() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from("drivers").select("*, vehicles(*)").eq("id", user.id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function registerDriver({ phone, carMake, carYear, plate, carType, tariff, telegram }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  await ensureProfile({ role: "driver", phone });
  await supabase.from("profiles").update({ role: "driver", phone }).eq("id", user.id);

  const { data: driver, error: driverErr } = await supabase
    .from("drivers")
    .insert({
      id: user.id,
      tariff,
      telegram_username: telegram,
      agreed_route: true,
      agreed_commission: true,
      status: "active",
      online: false,
    })
    .select()
    .single();
  if (driverErr) throw driverErr;

  const { error: vehicleErr } = await supabase.from("vehicles").insert({
    driver_id: user.id,
    make_model: carMake,
    year: Number(carYear),
    plate_number: plate,
    car_type: carType,
  });
  if (vehicleErr) throw vehicleErr;

  return driver;
}

export async function setDriverOnline(driverId, online) {
  const { error } = await supabase.from("drivers").update({ online }).eq("id", driverId);
  if (error) throw error;
}

export async function setDriverBlockStatus(driverId, status) {
  const updates = { status };
  if (status === "blocked") updates.online = false;
  const { error } = await supabase.from("drivers").update(updates).eq("id", driverId);
  if (error) throw error;
}

export async function upsertDriverLocation(driverId, lat, lng) {
  const { error } = await supabase
    .from("driver_locations")
    .upsert({ driver_id: driverId, lat, lng, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function getDriverLocation(driverId) {
  const { data, error } = await supabase.from("driver_locations").select("*").eq("driver_id", driverId).maybeSingle();
  if (error) throw error;
  return data;
}

/* ============== ORDERS ============== */
export async function createOrder({ driverId, pickupAddress, pickupLat, pickupLng, tariff, price }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const profile = await getMyProfile();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      passenger_id: user.id,
      driver_id: driverId,
      passenger_name: profile?.full_name || "",
      passenger_phone: profile?.phone || "",
      pickup_address: pickupAddress,
      pickup_lat: pickupLat,
      pickup_lng: pickupLng,
      tariff,
      price,
      status: "assigned",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listMyPassengerOrders() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("orders")
    .select("*, drivers(*, vehicles(*))")
    .eq("passenger_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listMyDriverOrders(driverId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getOrder(orderId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, drivers(*, vehicles(*))")
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId, status) {
  const updates = { status };
  if (status === "driver_coming") updates.accepted_at = new Date().toISOString();
  if (status === "completed") updates.completed_at = new Date().toISOString();
  const { data, error } = await supabase.from("orders").update(updates).eq("id", orderId).select().single();
  if (error) throw error;
  return data;
}

export async function listAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*, drivers(*, vehicles(*))")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

/* ============== COMMISSIONS (cash-only flow) ============== */
export async function createCommissionForOrder(order, percent) {
  const amount = +(order.price * (percent / 100)).toFixed(2);
  const { data, error } = await supabase
    .from("commissions")
    .insert({ order_id: order.id, driver_id: order.driver_id, amount, percent, status: "pending" })
    .select()
    .single();
  if (error) throw error;
  const { error: balErr } = await supabase.rpc("increment_commission_balance", {
    p_driver_id: order.driver_id,
    p_amount: amount,
  });
  if (balErr) console.error(balErr);
  return data;
}

export async function listMyCommissions(driverId) {
  const { data, error } = await supabase
    .from("commissions")
    .select("*, orders(*)")
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listAllCommissions() {
  const { data, error } = await supabase
    .from("commissions")
    .select("*, orders(*), drivers(*, profiles(full_name))")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function requestCashPayment(commissionId) {
  const { error } = await supabase.from("commissions").update({ status: "cash_requested" }).eq("id", commissionId);
  if (error) throw error;
}

export async function markCommissionPaid(commission) {
  const { error } = await supabase.from("commissions").update({ status: "paid" }).eq("id", commission.id);
  if (error) throw error;
  const { error: balErr } = await supabase.rpc("increment_commission_balance", {
    p_driver_id: commission.driver_id,
    p_amount: -commission.amount,
  });
  if (balErr) console.error(balErr);
}

/* ============== REVIEWS ============== */
export async function submitReview({ orderId, driverId, rating }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("reviews").insert({
    order_id: orderId, passenger_id: user.id, driver_id: driverId, rating,
  });
  if (error) throw error;
}

/* ============== SETTINGS ============== */
export async function getSettings() {
  const { data, error } = await supabase.from("app_settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return data;
}

export async function updateSettings({ commissionPercent, telegramPaymentLink }) {
  const { error } = await supabase
    .from("app_settings")
    .update({ commission_percent: commissionPercent, telegram_payment_link: telegramPaymentLink })
    .eq("id", 1);
  if (error) throw error;
}

/* ============== REALTIME SUBSCRIPTIONS ============== */
export function subscribeToOrder(orderId, onChange) {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` }, onChange)
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeToDriverOrders(driverId, onChange) {
  const channel = supabase
    .channel(`driver-orders-${driverId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `driver_id=eq.${driverId}` }, onChange)
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeToDriverLocation(driverId, onChange) {
  const channel = supabase
    .channel(`driver-loc-${driverId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "driver_locations", filter: `driver_id=eq.${driverId}` }, onChange)
    .subscribe();
  return () => supabase.removeChannel(channel);
}
