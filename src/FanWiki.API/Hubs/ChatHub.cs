using System.Security.Claims;
using FanWiki.Domain.Entities;
using FanWiki.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace FanWiki.API.Hubs;

[Authorize]
public class ChatHub(AppDbContext db) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId != null)
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        await base.OnConnectedAsync();
    }

    public async Task SendMessage(string recipientId, string content)
    {
        var senderId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (senderId == null || string.IsNullOrWhiteSpace(content)) return;

        var msg = new PrivateMessage
        {
            SenderId = senderId,
            RecipientId = recipientId,
            Content = content
        };
        db.PrivateMessages.Add(msg);
        await db.SaveChangesAsync();

        var payload = new { msg.Id, msg.SenderId, msg.RecipientId, msg.Content, msg.CreatedAt, msg.IsRead };

        await Clients.Group(recipientId).SendAsync("ReceiveMessage", payload);
        await Clients.Caller.SendAsync("MessageSent", payload);
    }
}
