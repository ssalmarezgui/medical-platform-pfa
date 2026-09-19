package com.pfa.medical_backend.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class OtpServiceTest {

    private OtpService otpService;

    @BeforeEach
    void setUp() {
        otpService = new OtpService();
    }

    @Test
    void generateOtp_ShouldReturn6DigitsCode() {
        String code = otpService.generateOtp("user1");

        assertNotNull(code);
        assertEquals(6, code.length());
        assertTrue(code.matches("\\d{6}"));
    }

    @Test
    void validateOtp_Success() {
        String code = otpService.generateOtp("user1");

        boolean isValid = otpService.validateOtp("user1", code);

        assertTrue(isValid);
        // Doit être supprimé après validation réussie
        assertFalse(otpService.validateOtp("user1", code));
    }

    @Test
    void validateOtp_WrongCode_ShouldReturnFalse() {
        otpService.generateOtp("user1");

        boolean isValid = otpService.validateOtp("user1", "000000");

        assertFalse(isValid);
    }

    @Test
    void validateOtp_UnknownUser_ShouldReturnFalse() {
        boolean isValid = otpService.validateOtp("unknown", "123456");

        assertFalse(isValid);
    }
}