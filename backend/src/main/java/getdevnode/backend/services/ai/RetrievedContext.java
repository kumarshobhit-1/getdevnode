package getdevnode.backend.services.ai;

import java.util.List;

import getdevnode.backend.dto.CitationDto;

public record RetrievedContext(
        List<CitationDto> citations,
        String contextText) {
}