package com.naiapps.pgbackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            message.setFrom("noreply@pgbackend.com");

            mailSender.send(message);
            log.info("✅ Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("❌ Error sending email to {}: {}", to, e.getMessage());

        }
    }

    public void sendPGCreationEmail(String to, String ownerName, String pgName) {
        String subject = "PG Created Successfully - " + pgName;
        String text = "Dear " + ownerName + ",\n\n" +
                "Your PG '" + pgName + "' has been successfully registered in our system.\n" +
                "You can now manage your PG, add floors, rooms, and students.\n\n" +
                "Best Regards,\nPG Management Team";
        sendSimpleEmail(to, subject, text);
    }

    public void sendStudentWelcomeEmail(String to, String studentName, String pgName, String roomNumber) {
        String subject = "Welcome to " + (pgName != null ? pgName : "PG Management System");
        String text = "Dear " + studentName + ",\n\n" +
                "Welcome! You have been successfully added to our system.\n";

        if (pgName != null) {
            text += "PG Name: " + pgName + "\n";
        }
        if (roomNumber != null) {
            text += "Room Number: " + roomNumber + "\n";
        }

        text += "\nWe hope you have a comfortable stay.\n\n" +
                "Best Regards,\nPG Management Team";

        sendSimpleEmail(to, subject, text);
    }

    public void sendPaymentLinkEmail(String to, String studentName, Double amount, String paymentLink, String purpose) {
        String subject = "Payment Request - " + purpose;
        String text = "Dear " + studentName + ",\n\n" +
                "A payment request has been generated for you.\n" +
                "Amount: ₹" + amount + "\n" +
                "Purpose: " + purpose + "\n\n" +
                "Please click the link below to make the payment:\n" +
                paymentLink + "\n\n" +
                "If you have any questions, please contact the administration.\n\n" +
                "Best Regards,\nPG Management Team";

        sendSimpleEmail(to, subject, text);
    }
}
