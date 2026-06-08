using FanWiki.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace FanWiki.Infrastructure.Services;

public class SmtpEmailSender(ILogger<SmtpEmailSender> logger) : IEmailSender
{
    private readonly string? _host     = Environment.GetEnvironmentVariable("SMTP_HOST");
    private readonly string? _user     = Environment.GetEnvironmentVariable("SMTP_USER");
    private readonly string? _pass     = Environment.GetEnvironmentVariable("SMTP_PASS");
    private readonly int     _port     = int.TryParse(Environment.GetEnvironmentVariable("SMTP_PORT"), out var p) ? p : 587;

    public async Task SendEmailAsync(string email, string subject, string htmlBody)
    {
        if (string.IsNullOrWhiteSpace(_host) ||
            string.IsNullOrWhiteSpace(_user) ||
            string.IsNullOrWhiteSpace(_pass))
        {
            logger.LogWarning("SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT.");
            logger.LogInformation("---------------- EMAIL (no SMTP) ----------------");
            logger.LogInformation("To: {Email}", email);
            logger.LogInformation("Subject: {Subject}", subject);
            logger.LogInformation("Body: {Body}", htmlBody);
            logger.LogInformation("-------------------------------------------------");
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("FanWiki", _user));
        message.To.Add(MailboxAddress.Parse(email));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = WrapInTemplate(subject, htmlBody) };

        using var client = new SmtpClient();
        await client.ConnectAsync(_host, _port, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_user, _pass);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    private static string WrapInTemplate(string subject, string content) => $"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{HtmlEncode(subject)}</title>
        </head>
        <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0"
                       style="background:#1e293b;border-radius:12px;overflow:hidden;
                              border:1px solid #334155;max-width:560px;width:100%;">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#064e3b,#1e293b);
                               padding:32px 40px;text-align:center;">
                      <span style="font-size:26px;font-weight:700;color:#34d399;
                                   letter-spacing:1px;text-transform:uppercase;">
                        Fan<span style="color:#fff;">Wiki</span>
                      </span>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;color:#cbd5e1;font-size:15px;line-height:1.7;">
                      {content}
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#0f172a;padding:20px 40px;
                               text-align:center;font-size:12px;color:#475569;
                               border-top:1px solid #334155;">
                      This email was sent automatically. Please do not reply.<br/>
                      &copy; {DateTime.UtcNow.Year} FanWiki
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """;

    private static string HtmlEncode(string value) =>
        System.Net.WebUtility.HtmlEncode(value);
}
