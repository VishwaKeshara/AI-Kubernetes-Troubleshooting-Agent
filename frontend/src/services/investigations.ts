import { insforge } from "@/lib/insforge";
import type { Diagnosis, InvestigationHistoryItem, InvestigationResult } from "@/types";

function extractNamespace(result: InvestigationResult): string {
  const pods = result.investigation.pods as {
    problematic_pods?: Array<{ namespace?: string }>;
  };
  const firstPod = pods.problematic_pods?.[0];
  if (firstPod?.namespace) {
    return firstPod.namespace;
  }

  const events = result.investigation.events as {
    findings?: Array<{ namespace?: string }>;
  };
  const firstEvent = events.findings?.[0];
  if (firstEvent?.namespace) {
    return firstEvent.namespace;
  }

  return "default";
}

export async function saveInvestigationHistory(
  userId: string,
  result: InvestigationResult,
): Promise<InvestigationHistoryItem | null> {
  const diagnosis: Diagnosis = result.diagnosis;

  const { data, error } = await insforge.database
    .from("investigations")
    .insert([
      {
        user_id: userId,
        root_cause: diagnosis.root_cause,
        namespace: extractNamespace(result),
        confidence: diagnosis.confidence,
        status: result.status === "success" ? "completed" : "failed",
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to save investigation history");
  }

  return data as InvestigationHistoryItem;
}

export async function fetchInvestigationHistory(
  userId: string,
): Promise<InvestigationHistoryItem[]> {
  const { data, error } = await insforge.database
    .from("investigations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message ?? "Failed to load investigation history");
  }

  return (data ?? []) as InvestigationHistoryItem[];
}
