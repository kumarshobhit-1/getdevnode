package getdevnode.backend.config;

import com.google.genai.Client;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration(proxyBeanMethods = false)
public class GoogleGenAiConfig {

    @Value("${spring.ai.google.genai.api-keys:${GEMINI_API_KEYS:${GEMINI_API_KEY:${GENAI_API_KEY:dummy_gemini_key}}}}")
    private String rawKeys;

    @Value("${spring.ai.google.genai.chat.options.model:gemini-3.6-flash}")
    private String chatModelName;

    @Bean
    public ApiKeyRotator geminiApiKeyRotator() {
        return new ApiKeyRotator("Gemini-Chat", rawKeys, null);
    }

    @Bean
    public Client googleGenAiClient(ApiKeyRotator geminiApiKeyRotator) {
        String key = geminiApiKeyRotator.getCurrentKey();
        return Client.builder().apiKey(key).build();
    }

    @Bean
    @Primary
    public GoogleGenAiChatModel chatModel(Client googleGenAiClient) {
        return GoogleGenAiChatModel.builder()
                .genAiClient(googleGenAiClient)
                .options(org.springframework.ai.google.genai.GoogleGenAiChatOptions.builder()
                        .model(chatModelName)
                        .build())
                .build();
    }
}
