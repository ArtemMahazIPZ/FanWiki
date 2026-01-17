using FanWiki.Application.Interfaces; 
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;

namespace FanWiki.Infrastructure.Services;

public class EmailService : IEmailSender 
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string email, string subject, string message)
    {
        var smtpServer = _configuration["EmailSettings:SmtpServer"];
        var port = int.Parse(_configuration["EmailSettings:Port"] ?? "587");
        var senderEmail = _configuration["EmailSettings:SenderEmail"];
        var password = _configuration["EmailSettings:Password"];

        if (string.IsNullOrEmpty(smtpServer) || string.IsNullOrEmpty(password))
        {
            Console.WriteLine($"[EMAIL MOCK] To: {email}, Subject: {subject}, Body: {message}");
            return;
        }

        var client = new SmtpClient(smtpServer, port)
        {
            Credentials = new NetworkCredential(senderEmail, password),
            EnableSsl = true
        };

        var mailMessage = new MailMessage(senderEmail!, email, subject, message)
        {
            IsBodyHtml = true
        };

        await client.SendMailAsync(mailMessage);
    }
}