class ConfidenceEngine:
    """Adjust confidence based on how strongly the evidence supports the diagnosis."""

    def score(self, diagnosis: dict, investigation: dict) -> dict:
        llm_confidence = diagnosis.get("confidence", 50)
        evidence_score = self._evidence_score(investigation)
        alignment_score = self._alignment_score(diagnosis, investigation)

        final_confidence = round((llm_confidence * 0.5) + (evidence_score * 0.3) + (alignment_score * 0.2))
        final_confidence = max(0, min(100, final_confidence))

        reasoning = diagnosis.get("confidence_reasoning", "").strip()
        evidence_notes = self._evidence_notes(investigation)

        diagnosis["confidence"] = final_confidence
        diagnosis["confidence_reasoning"] = self._build_reasoning(
            final_confidence,
            reasoning,
            evidence_notes,
        )
        return diagnosis

    def _evidence_score(self, investigation: dict) -> int:
        score = 30

        problematic_pods = investigation.get("pods", {}).get("problematic_pods") or []
        log_entries = investigation.get("logs", {}).get("entries") or []
        event_findings = investigation.get("events", {}).get("findings") or []
        problematic_deployments = investigation.get("deployments", {}).get("problematic_deployments") or []
        network_issues = investigation.get("network", {}).get("issues") or []

        if problematic_pods:
            score += 15
        if log_entries:
            score += 15
        if event_findings:
            score += 10
        if problematic_deployments:
            score += 10
        if network_issues:
            score += 10

        signal_count = sum(
            1
            for count in (
                len(problematic_pods),
                len(log_entries),
                len(event_findings),
                len(problematic_deployments),
                len(network_issues),
            )
            if count > 0
        )
        if signal_count >= 3:
            score += 10

        return min(score, 100)

    def _alignment_score(self, diagnosis: dict, investigation: dict) -> int:
        score = 40
        combined_text = " ".join(
            [
                diagnosis.get("root_cause", ""),
                diagnosis.get("explanation", ""),
                diagnosis.get("fix", ""),
            ]
        ).lower()

        for pod in investigation.get("pods", {}).get("problematic_pods") or []:
            if pod.get("name", "").lower() in combined_text:
                score += 10
            if pod.get("status", "").lower() in combined_text:
                score += 10

        for entry in investigation.get("logs", {}).get("entries") or []:
            for line in entry.get("relevant_lines") or []:
                keywords = ("error", "exception", "failed", "missing", "connection")
                if any(keyword in line.lower() for keyword in keywords) and any(
                    keyword in combined_text for keyword in keywords
                ):
                    score += 10
                    break

        return min(score, 100)

    def _evidence_notes(self, investigation: dict) -> list[str]:
        notes: list[str] = []

        problematic_pods = investigation.get("pods", {}).get("problematic_pods") or []
        log_entries = investigation.get("logs", {}).get("entries") or []
        event_findings = investigation.get("events", {}).get("findings") or []

        if problematic_pods:
            notes.append(f"{len(problematic_pods)} problematic pod(s) detected")
        if log_entries:
            notes.append(f"logs collected from {len(log_entries)} pod(s)")
        if event_findings:
            notes.append(f"{len(event_findings)} relevant cluster event(s)")

        if not notes:
            notes.append("limited actionable evidence was collected")

        return notes

    def _build_reasoning(
        self,
        confidence: int,
        llm_reasoning: str,
        evidence_notes: list[str],
    ) -> str:
        level = "High" if confidence >= 75 else "Moderate" if confidence >= 50 else "Low"
        evidence_summary = "; ".join(evidence_notes)

        parts = [f"{level} confidence because: {evidence_summary}."]
        if llm_reasoning:
            parts.append(llm_reasoning)

        return " ".join(parts)
