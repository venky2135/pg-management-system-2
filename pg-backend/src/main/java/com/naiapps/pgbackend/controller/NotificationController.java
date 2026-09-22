package com.naiapps.pgbackend.controller;

import com.naiapps.pgbackend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final EmailService emailService;

    @PostMapping("/test-email")
    public ResponseEntity<?> sendTestEmail(@RequestBody Map<String, String> request) {
        String to = request.get("to");
        String subject = request.get("subject");
        String text = request.get("text");

        if (to == null || subject == null || text == null) {
            return ResponseEntity.badRequest().body("Missing 'to', 'subject', or 'text' fields");
        }

        emailService.sendSimpleEmail(to, subject, text);
        return ResponseEntity.ok("Email sent successfully to " + to);
    }
}
