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

    public SseEmitter stream(
            UUID sessionId,
            ChatMessageResponse savedUserMessage,
            List<CitationDto> citations,
            String systemPrompt,
            String userPrompt) {

        SseEmitter emitter = new SseEmitter(RagSettings.STREAM_TIMEOUT_MS);
        StringBuilder fullReply = new StringBuilder();

        try {
            emitter.send(SseEmitter.event()
                    .name("user_message")
                    .data(savedUserMessage));

            if (groqChatService != null && groqChatService.isAvailable()) {
                log.info("Streaming chat response using Groq Cloud AI (llama-3.3-70b)");
                new Thread(() -> {
                    try {
                        groqChatService.streamChat(systemPrompt, userPrompt, token -> appendToken(emitter, fullReply, token));
                        completeStream(emitter, sessionId, fullReply, citations);
                    } catch (Exception ex) {
                        log.error("Groq chat streaming error", ex);
                        emitter.completeWithError(ex);
                    }
                }).start();
            } else {
                log.info("Streaming chat response using Gemini Chat Model");
                ChatClient.builder(chatModel)
                        .build()
                        .prompt()
                        .system(systemPrompt)
                        .user(userPrompt)
                        .stream()
                        .content()
                        .doOnNext(token -> appendToken(emitter, fullReply, token))
                        .doOnError(err -> {
                            log.error("Chat stream error", err);
                            emitter.completeWithError(err);
                        })
                        .doOnComplete(() -> completeStream(
                                emitter, sessionId, fullReply, citations))
                        .subscribe();
            }
        } catch (Exception ex) {
            emitter.completeWithError(ex);
        }

        return emitter;
    }

    private void appendToken(SseEmitter emitter, StringBuilder fullReply, String token) {
        if (token == null) return;
        fullReply.append(token);
        try {
            emitter.send(SseEmitter.event()
                    .name("token")
                    .data(token));
        } catch (Exception ex) {
            log.error("Failed to send token event", ex);
        }
    }

    private void completeStream(
            SseEmitter emitter,
            UUID sessionId,
            StringBuilder fullReply,
            List<CitationDto> citations) {
        try {
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
        } catch (Exception ex) {
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