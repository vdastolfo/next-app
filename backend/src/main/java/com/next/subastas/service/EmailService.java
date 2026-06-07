package com.next.subastas.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    public void sendVerificationCode(String to, String code) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject("Tu código de verificación - Next Subastas");
        helper.setText(buildEmailHtml(code), true);

        mailSender.send(message);
    }

    private String buildEmailHtml(String code) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#1a1a2e;border-radius:12px;">
              <h1 style="color:#e8b86d;font-size:24px;margin-bottom:8px;">Next Subastas</h1>
              <p style="color:#ccc;font-size:15px;margin-bottom:24px;">Usá el siguiente código para verificar tu cuenta:</p>
              <div style="background:#16213e;border-radius:8px;padding:24px;text-align:center;letter-spacing:12px;">
                <span style="color:#e8b86d;font-size:40px;font-weight:bold;">%s</span>
              </div>
              <p style="color:#888;font-size:13px;margin-top:24px;">El código expira en 15 minutos. Si no creaste una cuenta, ignorá este mail.</p>
            </div>
            """.formatted(code);
    }
}
