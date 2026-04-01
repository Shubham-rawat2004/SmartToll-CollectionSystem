import api from "./api";

export async function registerVehicle(payload) {
  const { data } = await api.post("/vehicles", payload);
  return data;
}
