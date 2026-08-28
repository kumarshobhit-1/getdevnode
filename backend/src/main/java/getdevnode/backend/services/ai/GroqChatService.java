package getdevnode.backend.services.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import getdevnode.backend.config.ApiKeyRotator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

@Service
@Slf4j
public class GroqChatService {

    private final ApiKeyRotator groqKeyRotator;
    private final String modelName;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GroqChatService(
            @Value("${app.groq.api-keys:${GROQ_API_KEYS:${GROQ_API_KEY:}}}") String rawKeys,
            @Value("${app.groq.model:llama-3.3-70b-versatile}") String modelName) {
        this.groqKeyRotator = new ApiKeyRotator("Groq-Chat", rawKeys, null);
        this.modelName = modelName;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public boolean isAvailable() {
        String key = groqKeyRotator.getCurrentKey();
        return StringUtils.hasText(key) && !key.equals("dummy_key_placeholder");
    }

    public void streamChat(String systemPrompt, String userPrompt, Consumer<String> onTokenConsumer) throws Exception {
        int maxAttempts = Math.max(3, groqKeyRotator.getKeyCount() * 2);

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            String activeKey = groqKeyRotator.getCurrentKey();
            try {
                boolean success = executeStreamRequest(activeKey, systemPrompt, userPrompt, onTokenConsumer);
                if (success) {
                    return;
                }
            } catch (Exception ex) {
                String msg = ex.getMessage() != null ? ex.getMessage() : "";
                log.warn("[Groq] API Key attempt {}/{} failed: {}. Rotating to next key...", attempt, maxAttempts, msg);
                if (groqKeyRotator.getKeyCount() > 1) {
                    groqKeyRotator.rotateNext();
                }
                if (attempt == maxAttempts) {
                    log.error("[Groq] All {} Groq API key attempts failed: {}", maxAttempts, msg);
                    throw ex;
                }
                try {
                    Thread.sleep(500);
                } catch (InterruptedException ignored) {
                    Thread.currentThread().interrupt();
                }
            }
        }
    }

    private boolean executeStreamRequest(
            String apiKey,
            String systemPrompt,
            String userPrompt,
            Consumer<String> onTokenConsumer) throws Exception {

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", modelName);
        payload.put("stream", true);

        List<Map<String, String>> messages = new ArrayList<>();
        if (StringUtils.hasText(systemPrompt)) {
            messages.add(Map.of("role", "system", "content", systemPrompt));
        }
        messages.add(Map.of("role", "user", "content", userPrompt != null ? userPrompt : ""));
        payload.put("messages", messages);

        String jsonBody = objectMapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.groq.com/openai/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<java.io.InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());

        if (response.statusCode() == 429) {
            throw new RuntimeException("429 Groq Rate Limit Exceeded");
        }

        if (response.statusCode() != 200) {
            byte[] errBytes = response.body().readAllBytes();
            throw new RuntimeException("Groq API returned HTTP " + response.statusCode() + ": " + new String(errBytes));
        }

        try (var reader = new java.io.BufferedReader(new java.io.InputStreamReader(response.body()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.startsWith("data: ")) {
                    String data = line.substring(6).trim();
                    if ("[DONE]".equals(data)) {
                        break;
                    }
                    try {
                        JsonNode root = objectMapper.readTree(data);
                        JsonNode choices = root.path("choices");
                        if (choices.isArray() && !choices.isEmpty()) {
                            JsonNode delta = choices.get(0).path("delta");
                            JsonNode contentNode = delta.path("content");
                            if (!contentNode.isMissingNode() && !contentNode.isNull()) {
                                String content = contentNode.asText();
                                if (!content.isEmpty()) {
                                    onTokenConsumer.accept(content);
                                }
                            }
                        }
                    } catch (Exception ignored) {
                    }
                }
            }
        }

        return true;
    }
}
