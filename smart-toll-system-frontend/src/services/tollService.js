import api from "./api";

export async function scanToll(payload) {
  const { data } = await api.post("/toll/scan", payload);
  return data;
}

export async function fetchAllTollBooths() {
  const { data } = await api.get("/toll-booths");
  return data;
}
