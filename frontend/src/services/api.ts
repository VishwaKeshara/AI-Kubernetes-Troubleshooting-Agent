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
  context?: string,
): Promise<InvestigationResult> {
  const response = await apiClient.post<InvestigationResult>("/investigate", {
    investigation_id: investigationId,
    context: context || undefined,
  });
  return response.data;
}

export async function fetchContexts(): Promise<string[]> {
  try {
    const response = await apiClient.get<{ contexts: string[] }>("/contexts");
    return response.data.contexts;
  } catch (error) {
    console.error("Failed to fetch contexts", error);
    return [];
  }
}
