package getdevnode.backend.config;

import com.google.genai.Client;
import com.google.genai.types.ContentEmbedding;
import com.google.genai.types.EmbedContentConfig;
import com.google.genai.types.EmbedContentResponse;
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
            float[] vector = embed(text);
            embeddings.add(new Embedding(vector, i));
        }

        return new EmbeddingResponse(embeddings);
    }

    @Override
    public float[] embed(Document document) {
        return embed(document.getText());
    }

    @Override
    public float[] embed(String text) {
        if (text == null || text.isBlank()) {
            return new float[dimensions];
        }
        EmbedContentConfig config = EmbedContentConfig.builder()
                .outputDimensionality(dimensions)
                .build();
        EmbedContentResponse response = client.models.embedContent(modelName, text, config);
        return extractVector(response);
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
