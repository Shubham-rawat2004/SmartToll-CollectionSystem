import api from "./api";

export async function fetchUserDetails(userId) {
  const { data } = await api.get(`/users/${userId}`);
  return data;
}

export async function addMoneyToWallet(userId, amount) {
  const { data } = await api.patch(`/users/${userId}/wallet`, { amount });
  return data;
}

export async function fetchUserTransactions(userId) {
  const { data } = await api.get(`/users/${userId}/transactions`);
  return data;
}
