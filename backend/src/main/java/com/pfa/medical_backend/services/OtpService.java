package com.pfa.medical_backend.services;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.security.SecureRandom;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final Random random = new SecureRandom();

    private final Map<String, OtpDetails> otpStorage = new ConcurrentHashMap<>();

    private static class OtpDetails{
        String code;
        LocalDateTime expiryTime;

        OtpDetails(String code, LocalDateTime expiryTime){
            this.code = code;
            this.expiryTime = expiryTime;
        }
    }

    public String generateOtp(String loginU){
        String code = String.format("%06d", random.nextInt(999999));
        LocalDateTime expiry = LocalDateTime.now(ZoneId.of("Africa/Tunis")).plusMinutes(5);
        otpStorage.put(loginU, new OtpDetails(code, expiry));
        return code;
    }

    public boolean validateOtp(String loginU, String codeSaisi){
        OtpDetails details = otpStorage.get(loginU);

        if (details == null) return false;
        if (details.expiryTime.isBefore(LocalDateTime.now(ZoneId.of("Africa/Tunis")))){
            otpStorage.remove(loginU);
            return false;
        }

        boolean isValid = details.code.equals(codeSaisi);
        if (isValid){
            otpStorage.remove(loginU);
        }
        return isValid;
    }
}