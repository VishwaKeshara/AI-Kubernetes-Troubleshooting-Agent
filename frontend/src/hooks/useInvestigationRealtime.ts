import { insforge } from "@/lib/insforge";
import type { InvestigationProgressEvent } from "@/types";

export async function subscribeToInvestigationChannel(
  investigationId: string,
  onProgress: (event: InvestigationProgressEvent) => void,
): Promise<() => void> {
  const handler = (payload: unknown) => {
    const event = payload as InvestigationProgressEvent;
    if (event.step && event.label && event.status) {
      onProgress(event);
    }
  };

  insforge.realtime.on("investigation_progress", handler);
  await insforge.realtime.connect();

  const response = await insforge.realtime.subscribe(
    `investigation:${investigationId}`,
  );

  if (!response.ok) {
    console.error("Failed to subscribe to investigation channel", response.error);
  }

  return () => {
    insforge.realtime.off("investigation_progress", handler);
    insforge.realtime.unsubscribe(`investigation:${investigationId}`);
  };
}
