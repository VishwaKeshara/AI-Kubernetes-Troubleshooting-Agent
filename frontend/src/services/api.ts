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

export function getInvestigationErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return "Investigation timed out. The cluster may be large or the backend is unreachable.";
    }

    if (!error.response) {
      return "Unable to reach the backend API. Check that the server is running.";
    }

    const detail = error.response.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }

    return `Investigation failed with status ${error.response.status}.`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Investigation failed unexpectedly.";
}

export async function runInvestigation(
  investigationId: string,
): Promise<InvestigationResult> {
  const response = await apiClient.post<InvestigationResult>("/investigate", {
    investigation_id: investigationId,
  });
  return response.data;
}
