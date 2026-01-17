using FanWiki.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace FanWiki.Infrastructure.Services;

public class DebugEmailSender(ILogger<DebugEmailSender> logger) : IEmailSender
{
    public Task SendEmailAsync(string email, string subject, string message)
    {
        logger.LogInformation("---------------- EMAIL MOCK ----------------");
        logger.LogInformation("To: {Email}", email);
        logger.LogInformation("Subject: {Subject}", subject);
        logger.LogInformation("Body: {Message}", message);
        logger.LogInformation("--------------------------------------------");
        
        return Task.CompletedTask;
    }
}