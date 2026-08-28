package getdevnode.backend.services.ai;

import java.util.List;
import java.util.UUID;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import getdevnode.backend.dto.ChatMessageResponse;
import getdevnode.backend.dto.CitationDto;
import getdevnode.backend.entity.ChatMessage;
import getdevnode.backend.entity.MessageRole;
import getdevnode.backend.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// Generation step: call Gemini via Spring AI and stream tokens to the browser over SSE.
@Component
@RequiredArgsConstructor
@Slf4j
public class ChatStreamHandler {

    private final ChatModel chatModel;
    private final GroqChatService groqChatService;
    private final ChatMessageRepository chatMessageRepository;
    private final CitationMapper citationMapper;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

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
                        .data(savedUserMessage));

                if (groqChatService != null && groqChatService.isAvailable()) {
                    log.info("Streaming chat response using Groq Cloud AI (llama-3.3-70b)");
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

                log.info("Streaming chat response using Gemini Chat Model");
                streamWithGemini(emitter, sessionId, fullReply, citations, systemPrompt, userPrompt);
            } catch (Exception ex) {
                log.error("Error executing SSE stream task", ex);
                emitter.completeWithError(ex);
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
        try {
            ChatClient.builder(chatModel)
                    .build()
                    .prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .stream()
                    .content()
                    .doOnNext(token -> appendToken(emitter, fullReply, token))
                    .doOnError(err -> {
                        log.error("Gemini Chat stream error", err);
                        emitter.completeWithError(err);
                    })
                    .doOnComplete(() -> completeStream(
                            emitter, sessionId, fullReply, citations))
                    .subscribe();
        } catch (Exception ex) {
            log.error("Failed to execute Gemini chat stream", ex);
            emitter.completeWithError(ex);
        }
    }

    private final java.util.concurrent.atomic.AtomicInteger tokenCount = new java.util.concurrent.atomic.AtomicInteger(0);

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
                    .data(toMessageResponse(assistant)));
            emitter.send(SseEmitter.event().name("done").data("[DONE]"));
            emitter.complete();
            log.info("[ChatStreamHandler] Sent assistant_message and [DONE] events to SSE emitter for session: {}", sessionId);
        } catch (Exception ex) {
            log.error("Failed to complete stream for session: {}", sessionId, ex);
            emitter.completeWithError(ex);
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