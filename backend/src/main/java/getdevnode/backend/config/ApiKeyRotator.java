package getdevnode.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
public class ApiKeyRotator {

    private final String name;
    private final List<String> keys = new ArrayList<>();
    private final AtomicInteger currentIndex = new AtomicInteger(0);

    public ApiKeyRotator(String name, String keysCsv, String defaultFallbackKey) {
        this.name = name;
        if (StringUtils.hasText(keysCsv)) {
            Arrays.stream(keysCsv.split(","))
                    .map(s -> s.trim())
                    .filter(StringUtils::hasText)
                    .forEach(keys::add);
        }
        if (keys.isEmpty() && StringUtils.hasText(defaultFallbackKey)) {
            keys.add(defaultFallbackKey.trim());
        }
        if (keys.isEmpty()) {
            keys.add("dummy_key_placeholder");
        }
        log.info("[{}] Loaded {} API keys into active pool", name, keys.size());
    }

    public String getCurrentKey() {
        int idx = Math.abs(currentIndex.get() % keys.size());
        return keys.get(idx);
    }

    public String rotateNext() {
        int nextIdx = Math.abs(currentIndex.incrementAndGet() % keys.size());
        String nextKey = keys.get(nextIdx);
        log.info("[{}] Rotated to API key #{} (Total keys: {})", name, nextIdx + 1, keys.size());
        return nextKey;
    }

    public int getKeyCount() {
        return keys.size();
    }
}
