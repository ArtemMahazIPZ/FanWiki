using Microsoft.Extensions.Logging;

namespace FanWiki.Infrastructure.Services;

public interface IEmailSender
{
    Task SendEmailAsync(string email, string subject, string message);
}

public class DebugEmailSender(ILogger<DebugEmailSender> logger) : IEmailSender
{
    public Task SendEmailAsync(string email, string subject, string message)
    {
        logger.LogWarning($"--- EMAIL TO {email} ---\nSubject: {subject}\nMessage: {message}\n-----------------------");
        return Task.CompletedTask;
    }
}