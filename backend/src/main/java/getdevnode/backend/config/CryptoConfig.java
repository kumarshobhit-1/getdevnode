package getdevnode.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.codec.Hex;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.encrypt.TextEncryptor;

@Configuration
public class CryptoConfig {

    @Bean
    @SuppressWarnings("deprecation")
    TextEncryptor tokenEncryptor(
            @Value("${app.token-encryptor-password:getdevnode-local-encrypt-key-chage-me}") String password,
            @Value("${app.token-encryptor-salt:8d9e0f1a2b3c4d5e}") String salt) {
        String hexSalt = isHex(salt) ? salt : new String(Hex.encode(salt.getBytes()));
        return Encryptors.text(password, hexSalt);
    }

    private static boolean isHex(String s) {
        return s != null && s.matches("^[0-9a-fA-F]+$") && (s.length() % 2 == 0);
    }
}