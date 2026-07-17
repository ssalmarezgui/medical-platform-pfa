package com.pfa.medical_backend.services;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    // Stockage temporaire d'OTP pour chaque login

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
        String code = String.format("%06d", new Random().nextInt(999999));
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);
        otpStorage.put(loginU, new OtpDetails(code, expiry));
        return code;
    }

    public boolean validateOtp(String loginU, String codeSaisi){
        OtpDetails details = otpStorage.get(loginU);

        if (details == null) return false;

        if (details.expiryTime.isBefore(LocalDateTime.now())){
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
