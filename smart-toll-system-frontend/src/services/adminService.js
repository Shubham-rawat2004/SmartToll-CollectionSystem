import api from "./api";

export async function addTollBooth(payload) {
  const { data } = await api.post("/admin/toll-booths", payload);
  return data;
}

export async function fetchAllTransactions() {
  const { data } = await api.get("/admin/transactions");
  return data;
}

export async function fetchAllVehicles() {
  const { data } = await api.get("/vehicles");
  return data;
}
