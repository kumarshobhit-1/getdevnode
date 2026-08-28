package getdevnode.backend.config;

import com.google.genai.Client;
import com.google.genai.types.ContentEmbedding;
import com.google.genai.types.EmbedContentConfig;
import com.google.genai.types.EmbedContentResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.AbstractEmbeddingModel;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class GoogleGenAiEmbeddingModel extends AbstractEmbeddingModel {

    private final Client client;
    private final String modelName;
    private final int dimensions;

    public GoogleGenAiEmbeddingModel(
            @Value("${spring.ai.google.genai.api-key:${GEMINI_API_KEY:${GENAI_API_KEY:AIzaSyD672P1BrDH5IzHWA_wo5F0uhTodCj4bT8}}}") String apiKey,
            @Value("${spring.ai.google.genai.embedding.text.model:gemini-embedding-001}") String modelName,
            @Value("${spring.ai.vectorstore.pgvector.dimensions:1536}") int dimensions) {
        this.client = Client.builder().apiKey(apiKey).build();
        this.modelName = modelName;
        this.dimensions = dimensions;
    }

    @Override
    public EmbeddingResponse call(EmbeddingRequest request) {
        List<String> instructions = request.getInstructions();
        List<Embedding> embeddings = new ArrayList<>();

        for (int i = 0; i < instructions.size(); i++) {
            String text = instructions.get(i);
            float[] vector = embedWithRetry(text);
            embeddings.add(new Embedding(vector, i));

            // Pace requests to stay within Gemini Free Tier Rate Limits (15 RPM)
            try {
                Thread.sleep(150);
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
            }
        }

        return new EmbeddingResponse(embeddings);
    }

    @Override
    public float[] embed(Document document) {
        return embedWithRetry(document.getText());
    }

    @Override
    public float[] embed(String text) {
        return embedWithRetry(text);
    }

    private float[] embedWithRetry(String text) {
        if (text == null || text.isBlank()) {
            return new float[dimensions];
        }

        EmbedContentConfig config = EmbedContentConfig.builder()
                .outputDimensionality(dimensions)
                .build();

        int maxRetries = 4;
        long waitTimeMs = 3000;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                EmbedContentResponse response = client.models.embedContent(modelName, text, config);
                return extractVector(response);
            } catch (Exception ex) {
                String errorMsg = ex.getMessage() != null ? ex.getMessage() : "";
                boolean isRateLimit = errorMsg.contains("429") || errorMsg.contains("Quota exceeded")
                        || errorMsg.contains("RESOURCE_EXHAUSTED") || errorMsg.contains("rate-limit")
                        || errorMsg.contains("quota");

                if (isRateLimit && attempt < maxRetries) {
                    log.warn("Gemini Embedding API rate limit hit (Attempt {}/{}). Waiting {}ms before retry...",
                            attempt, maxRetries, waitTimeMs);
                    try {
                        Thread.sleep(waitTimeMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                    waitTimeMs *= 2; // Exponential backoff: 3s, 6s, 12s
                } else {
                    log.error("Failed to generate embedding after {} attempts: {}", attempt, errorMsg);
                    throw new RuntimeException("Gemini API Error: " + (isRateLimit
                            ? "Free Tier Daily Quota Exceeded (1,000 requests/day). Please wait a while or use a paid Gemini API Key."
                            : errorMsg), ex);
                }
            }
        }

        return new float[dimensions];
    }

    private float[] extractVector(EmbedContentResponse response) {
        if (response != null && response.embeddings().isPresent()) {
            List<ContentEmbedding> embeddingList = response.embeddings().get();
            if (!embeddingList.isEmpty() && embeddingList.get(0).values().isPresent()) {
                List<Float> floats = embeddingList.get(0).values().get();
                float[] vector = new float[floats.size()];
                for (int i = 0; i < floats.size(); i++) {
                    vector[i] = floats.get(i);
                }
                return vector;
            }
        }
        return new float[dimensions];
    }
}
