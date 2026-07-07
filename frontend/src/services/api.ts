import axios from "axios";

import type { InvestigationResult } from "@/types";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 180000,
});

export async function runInvestigation(
  investigationId: string,
): Promise<InvestigationResult> {
  const response = await apiClient.post<InvestigationResult>("/investigate", {
    investigation_id: investigationId,
  });
  return response.data;
}
