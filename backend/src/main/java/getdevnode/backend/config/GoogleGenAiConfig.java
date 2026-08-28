package getdevnode.backend.config;

import com.google.genai.Client;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration(proxyBeanMethods = false)
public class GoogleGenAiConfig {

    @Value("${spring.ai.google.genai.api-keys:${GEMINI_API_KEYS:${GEMINI_API_KEY:${GENAI_API_KEY:dummy_gemini_key}}}}")
    private String rawKeys;

    @Bean
    public Client googleGenAiClient() {
        String defaultFallback = "dummy_gemini_key";
        String effectiveKey = defaultFallback;

        if (StringUtils.hasText(rawKeys)) {
            String[] split = rawKeys.split(",");
            if (split.length > 0 && StringUtils.hasText(split[0])) {
                effectiveKey = split[0].trim();
            }
        }
        return Client.builder().apiKey(effectiveKey).build();
    }
}
