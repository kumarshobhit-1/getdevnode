package getdevnode.backend.services.ai;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import getdevnode.backend.config.ApiKeyRotator;
import getdevnode.backend.dto.ChatMessageResponse;
import getdevnode.backend.dto.CitationDto;
import getdevnode.backend.entity.ChatMessage;
import getdevnode.backend.entity.MessageRole;
import getdevnode.backend.repository.ChatMessageRepository;
import lombok.extern.slf4j.Slf4j;

// Generation step: call Gemini / Groq via Spring AI and stream tokens to the browser over SSE.
@Component
@Slf4j
public class ChatStreamHandler {

    private final ChatModel defaultChatModel;
    private final GroqChatService groqChatService;
    private final ChatMessageRepository chatMessageRepository;
    private final CitationMapper citationMapper;
    private final ApiKeyRotator geminiApiKeyRotator;
    private final String geminiModelName;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule())
            .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    public ChatStreamHandler(
            ChatModel chatModel,
            GroqChatService groqChatService,
            ChatMessageRepository chatMessageRepository,
            CitationMapper citationMapper,
            ApiKeyRotator geminiApiKeyRotator,
            @Value("${spring.ai.google.genai.chat.options.model:gemini-3.6-flash}") String geminiModelName) {
        this.defaultChatModel = chatModel;
        this.groqChatService = groqChatService;
        this.chatMessageRepository = chatMessageRepository;
        this.citationMapper = citationMapper;
        this.geminiApiKeyRotator = geminiApiKeyRotator;
        this.geminiModelName = geminiModelName;
    }

    public SseEmitter stream(
            UUID sessionId,
            ChatMessageResponse savedUserMessage,
            List<CitationDto> citations,
            String systemPrompt,
            String userPrompt) {

        SseEmitter emitter = new SseEmitter(RagSettings.STREAM_TIMEOUT_MS);
        StringBuilder fullReply = new StringBuilder();

        emitter.onTimeout(() -> {
            log.warn("SSE stream timed out for session {}", sessionId);
            emitter.complete();
        });

        emitter.onError((ex) -> {
            log.warn("SSE stream error for session {}: {}", sessionId, ex.getMessage());
            emitter.complete();
        });

        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("user_message")
                        .data(objectMapper.writeValueAsString(savedUserMessage)));

                if (groqChatService != null && groqChatService.isAvailable()) {
                    log.info("Streaming chat response using Groq Cloud AI ({})", groqChatService.getModelName());
                    try {
                        groqChatService.streamChat(systemPrompt, userPrompt, token -> appendToken(emitter, fullReply, token));
                        if (fullReply.length() > 0) {
                            completeStream(emitter, sessionId, fullReply, citations);
                            return;
                        }
                        log.warn("Groq returned empty response. Falling back to Gemini Chat Model...");
                    } catch (Exception ex) {
                        log.error("Groq chat streaming error. Falling back to Gemini Chat Model...", ex);
                    }
                }

                log.info("Streaming chat response using Gemini Chat Model ({})", geminiModelName);
                streamWithGemini(emitter, sessionId, fullReply, citations, systemPrompt, userPrompt);
            } catch (Exception ex) {
                log.error("Error executing SSE stream task", ex);
                sendErrorAndComplete(emitter, "Chat streaming error: " + ex.getMessage());
            }
        });

        return emitter;
    }

    private void streamWithGemini(
            SseEmitter emitter,
            UUID sessionId,
            StringBuilder fullReply,
            List<CitationDto> citations,
            String systemPrompt,
            String userPrompt) {

        int maxAttempts = Math.max(3, geminiApiKeyRotator != null ? geminiApiKeyRotator.getKeyCount() * 2 : 1);

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                String activeKey = geminiApiKeyRotator != null ? geminiApiKeyRotator.getCurrentKey() : null;
                ChatModel activeModel;
                if (activeKey != null && !activeKey.equals("dummy_key_placeholder")) {
                    com.google.genai.Client client = com.google.genai.Client.builder().apiKey(activeKey).build();
                    activeModel = GoogleGenAiChatModel.builder()
                            .genAiClient(client)
                            .options(GoogleGenAiChatOptions.builder()
                                    .model(geminiModelName)
                                    .build())
                            .build();
                } else {
                    activeModel = defaultChatModel;
                }

                CountDownLatch latch = new CountDownLatch(1);
                AtomicReference<Throwable> errorRef = new AtomicReference<>();

                ChatClient.builder(activeModel)
                        .build()
                        .prompt()
                        .system(systemPrompt)
                        .user(userPrompt)
                        .stream()
                        .content()
                        .doOnNext(token -> appendToken(emitter, fullReply, token))
                        .doOnError(err -> {
                            errorRef.set(err);
                            latch.countDown();
                        })
                        .doOnComplete(() -> {
                            latch.countDown();
                        })
                        .subscribe(
                                v -> {},
                                err -> {
                                    errorRef.set(err);
                                    latch.countDown();
                                }
                        );

                latch.await();

                if (errorRef.get() == null && fullReply.length() > 0) {
                    completeStream(emitter, sessionId, fullReply, citations);
                    return;
                }

                if (errorRef.get() != null) {
                    Throwable err = errorRef.get();
                    String msg = err.getMessage() != null ? err.getMessage() : err.toString();
                    log.warn("[Gemini] API Key attempt {}/{} failed: {}. Rotating to next key...", attempt, maxAttempts, msg);
                    if (geminiApiKeyRotator != null && geminiApiKeyRotator.getKeyCount() > 1) {
                        geminiApiKeyRotator.rotateNext();
                    }
                    if (attempt == maxAttempts) {
                        log.error("[Gemini] All {} Gemini API key attempts failed: {}", maxAttempts, msg);
                        sendErrorAndComplete(emitter, "Gemini AI generation failed: " + msg);
                        return;
                    }
                    try {
                        Thread.sleep(500);
                    } catch (InterruptedException ignored) {
                        Thread.currentThread().interrupt();
                    }
                }
            } catch (Exception ex) {
                log.error("[Gemini] Exception during Gemini stream attempt {}/{}", attempt, maxAttempts, ex);
                if (geminiApiKeyRotator != null && geminiApiKeyRotator.getKeyCount() > 1) {
                    geminiApiKeyRotator.rotateNext();
                }
                if (attempt == maxAttempts) {
                    sendErrorAndComplete(emitter, "Gemini AI generation failed: " + ex.getMessage());
                    return;
                }
            }
        }
    }

    private final AtomicInteger tokenCount = new AtomicInteger(0);

    private void appendToken(SseEmitter emitter, StringBuilder fullReply, String token) {
        if (token == null) return;
        fullReply.append(token);
        int currentCount = tokenCount.incrementAndGet();
        try {
            emitter.send(SseEmitter.event()
                    .name("token")
                    .data(objectMapper.writeValueAsString(token)));
            if (currentCount % 20 == 0 || currentCount == 1) {
                log.info("[ChatStreamHandler] Streamed {} tokens so far...", currentCount);
            }
        } catch (Exception ex) {
            log.error("Failed to send token event (token #{})", currentCount, ex);
        }
    }

    private void completeStream(
            SseEmitter emitter,
            UUID sessionId,
            StringBuilder fullReply,
            List<CitationDto> citations) {
        try {
            log.info("[ChatStreamHandler] Stream completed successfully. Total reply length: {}, Total tokens: {}", fullReply.length(), tokenCount.get());
            ChatMessage assistant = chatMessageRepository.save(ChatMessage.builder()
                    .sessionId(sessionId)
                    .role(MessageRole.ASSISTANT)
                    .content(fullReply.toString())
                    .citations(citationMapper.toJson(citations))
                    .build());

            emitter.send(SseEmitter.event()
                    .name("assistant_message")
                    .data(objectMapper.writeValueAsString(toMessageResponse(assistant))));
            emitter.send(SseEmitter.event().name("done").data("[DONE]"));
            emitter.complete();
            log.info("[ChatStreamHandler] Sent assistant_message and [DONE] events to SSE emitter for session: {}", sessionId);
        } catch (Exception ex) {
            log.error("Failed to complete stream for session: {}", sessionId, ex);
            sendErrorAndComplete(emitter, "Failed to complete message stream: " + ex.getMessage());
        }
    }

    private void sendErrorAndComplete(SseEmitter emitter, String errorMessage) {
        try {
            emitter.send(SseEmitter.event()
                    .name("error")
                    .data(objectMapper.writeValueAsString(errorMessage)));
        } catch (Exception ignored) {
        }
        try {
            emitter.complete();
        } catch (Exception ignored) {
        }
    }

    private ChatMessageResponse toMessageResponse(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getRole(),
                message.getContent(),
                citationMapper.fromJson(message.getCitations()),
                message.getCreatedAt());
    }
}