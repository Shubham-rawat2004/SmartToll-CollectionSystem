import api from "./api";

const INDIAN_PLATE_PATTERN = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;

export async function scanToll(payload) {
  const scanInput = payload.rfidTag?.trim().toUpperCase() || "";
  const isPlateNumber = INDIAN_PLATE_PATTERN.test(scanInput);
  const endpoint = isPlateNumber ? "/toll/scan/plate" : "/toll/scan";
  const requestBody = isPlateNumber
    ? {
        vehicleNumber: scanInput,
        tollBoothName: payload.tollBoothName,
        tollBoothId: payload.tollBoothId,
      }
    : {
        ...payload,
        rfidTag: scanInput,
      };

  const { data } = await api.post(endpoint, requestBody);
  return data;
}

export async function fetchAllTollBooths() {
  const { data } = await api.get("/toll-booths");
  return data;
}
