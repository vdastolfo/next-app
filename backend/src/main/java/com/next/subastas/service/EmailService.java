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
        send(to, "Tu código de verificación - Next Subastas", buildCodeHtml(code));
    }

    public void sendRegistrationReceived(String to, String nombre) throws Exception {
        send(to, "Solicitud de registro recibida - Next Subastas", buildReceivedHtml(nombre));
    }

    public void sendCompletionCode(String to, String nombre, String code) throws Exception {
        send(to, "Completá tu registro - Next Subastas", buildCompletionHtml(nombre, code));
    }

    public void sendPasswordResetCode(String to, String nombre, String code) throws Exception {
        send(to, "Restablecer contraseña - Next Subastas", buildPasswordResetHtml(nombre, code));
    }

    public void sendWinnerNotification(String to, String nombre, String lote,
                                       String producto, String importe,
                                       String comision, String envio, String total) throws Exception {
        send(to, "¡Ganaste el lote! - Next Subastas",
                buildWinnerHtml(nombre, lote, producto, importe, comision, envio, total));
    }

    private String buildWinnerHtml(String nombre, String lote, String producto,
                                   String importe, String comision, String envio, String total) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#1a1a2e;border-radius:12px;">
              <h1 style="color:#e8b86d;font-size:24px;margin-bottom:4px;">Next Subastas</h1>
              <p style="color:#00e676;font-size:20px;font-weight:bold;margin-bottom:4px;">¡Felicitaciones, %s!</p>
              <p style="color:#ccc;font-size:15px;margin-bottom:24px;">Ganaste la subasta del siguiente lote:</p>
              <div style="background:#16213e;border-radius:8px;padding:20px;margin-bottom:24px;">
                <p style="color:#e8b86d;font-size:12px;letter-spacing:2px;margin:0 0 4px;">%s</p>
                <p style="color:#fff;font-size:18px;font-weight:bold;margin:0;">%s</p>
              </div>
              <table style="width:100%%;border-collapse:collapse;margin-bottom:24px;">
                <tr><td style="color:#aaa;padding:8px 0;border-bottom:1px solid #333;">Tu puja</td>
                    <td style="color:#fff;text-align:right;padding:8px 0;border-bottom:1px solid #333;">$%s</td></tr>
                <tr><td style="color:#aaa;padding:8px 0;border-bottom:1px solid #333;">Comisión del comprador (10%%)</td>
                    <td style="color:#fff;text-align:right;padding:8px 0;border-bottom:1px solid #333;">$%s</td></tr>
                <tr><td style="color:#aaa;padding:8px 0;border-bottom:1px solid #333;">Envío estimado</td>
                    <td style="color:#fff;text-align:right;padding:8px 0;border-bottom:1px solid #333;">$%s</td></tr>
                <tr><td style="color:#00e676;font-weight:bold;padding:12px 0;">TOTAL A PAGAR</td>
                    <td style="color:#00e676;font-weight:bold;text-align:right;padding:12px 0;">$%s</td></tr>
              </table>
              <p style="color:#888;font-size:13px;">El pago se procesará con el medio de pago registrado en tu cuenta. Recibirás el artículo en la dirección declarada.</p>
            </div>
            """.formatted(nombre, lote, producto, importe, comision, envio, total);
    }

    private void send(String to, String subject, String html) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
    }

    private String buildCodeHtml(String code) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#1a1a2e;border-radius:12px;">
              <h1 style="color:#e8b86d;font-size:24px;margin-bottom:8px;">Next Subastas</h1>
              <p style="color:#ccc;font-size:15px;margin-bottom:24px;">Usá el siguiente código para verificar tu cuenta:</p>
              <div style="background:#16213e;border-radius:8px;padding:24px;text-align:center;letter-spacing:12px;">
                <span style="color:#e8b86d;font-size:40px;font-weight:bold;">%s</span>
              </div>
              <p style="color:#888;font-size:13px;margin-top:24px;">El código expira en 15 minutos.</p>
            </div>
            """.formatted(code);
    }

    private String buildReceivedHtml(String nombre) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#1a1a2e;border-radius:12px;">
              <h1 style="color:#e8b86d;font-size:24px;margin-bottom:8px;">Next Subastas</h1>
              <p style="color:#ccc;font-size:18px;margin-bottom:16px;">Hola, %s</p>
              <p style="color:#ccc;font-size:15px;">Recibimos tu solicitud de registro. Nuestro equipo verificará tus datos y te notificará cuando tu cuenta esté lista para completar.</p>
              <p style="color:#888;font-size:13px;margin-top:24px;">Si no realizaste esta solicitud, podés ignorar este correo.</p>
            </div>
            """.formatted(nombre);
    }

    private String buildPasswordResetHtml(String nombre, String code) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#1a1a2e;border-radius:12px;">
              <h1 style="color:#e8b86d;font-size:24px;margin-bottom:8px;">Next Subastas</h1>
              <p style="color:#ccc;font-size:18px;margin-bottom:16px;">Hola, %s</p>
              <p style="color:#ccc;font-size:15px;margin-bottom:24px;">Recibimos una solicitud para restablecer tu contraseña. Usá este código:</p>
              <div style="background:#16213e;border-radius:8px;padding:24px;text-align:center;letter-spacing:12px;">
                <span style="color:#e8b86d;font-size:40px;font-weight:bold;">%s</span>
              </div>
              <p style="color:#888;font-size:13px;margin-top:24px;">El código expira en 15 minutos. Si no solicitaste este cambio, ignorá este correo.</p>
            </div>
            """.formatted(nombre, code);
    }

    private String buildCompletionHtml(String nombre, String code) {
        return """
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#1a1a2e;border-radius:12px;">
              <h1 style="color:#e8b86d;font-size:24px;margin-bottom:8px;">Next Subastas</h1>
              <p style="color:#ccc;font-size:18px;margin-bottom:16px;">Hola, %s</p>
              <p style="color:#ccc;font-size:15px;margin-bottom:24px;">Tu cuenta fue verificada. Ingresá a la app y usá este código para completar tu registro y crear tu contraseña:</p>
              <div style="background:#16213e;border-radius:8px;padding:24px;text-align:center;letter-spacing:12px;">
                <span style="color:#00e676;font-size:40px;font-weight:bold;">%s</span>
              </div>
              <p style="color:#888;font-size:13px;margin-top:24px;">El código expira en 24 horas.</p>
            </div>
            """.formatted(nombre, code);
    }
}
