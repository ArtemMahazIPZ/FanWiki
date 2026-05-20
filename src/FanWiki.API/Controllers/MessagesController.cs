using System.Security.Claims;
using FanWiki.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FanWiki.Domain.Entities;

namespace FanWiki.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController(AppDbContext db, UserManager<ApplicationUser> userManager) : ControllerBase
{
    // GET /api/Messages/conversations — returns list of users I've talked to, with last message
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var myId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var msgs = await db.PrivateMessages
            .Where(m => m.SenderId == myId || m.RecipientId == myId)
            .Include(m => m.Sender)
            .Include(m => m.Recipient)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

        var conversations = msgs
            .GroupBy(m => m.SenderId == myId ? m.RecipientId : m.SenderId)
            .Select(g =>
            {
                var last = g.First();
                var otherId = last.SenderId == myId ? last.RecipientId : last.SenderId;
                var other = last.SenderId == myId ? last.Recipient : last.Sender;
                return new
                {
                    UserId = otherId,
                    Nickname = other?.Nickname ?? otherId,
                    AvatarUrl = other?.AvatarUrl,
                    LastMessage = last.Content,
                    LastAt = last.CreatedAt,
                    UnreadCount = g.Count(m => m.RecipientId == myId && !m.IsRead)
                };
            })
            .OrderByDescending(c => c.LastAt)
            .ToList();

        return Ok(conversations);
    }

    // GET /api/Messages/{userId} — full history with that user
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetHistory(string userId)
    {
        var myId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var messages = await db.PrivateMessages
            .Where(m =>
                (m.SenderId == myId && m.RecipientId == userId) ||
                (m.SenderId == userId && m.RecipientId == myId))
            .Include(m => m.Sender)
            .Include(m => m.Recipient)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new
            {
                m.Id, m.SenderId, m.RecipientId, m.Content, m.CreatedAt, m.IsRead,
                SenderNickname = m.Sender!.Nickname,
                SenderAvatar = m.Sender.AvatarUrl
            })
            .ToListAsync();

        // Mark incoming as read
        var unread = await db.PrivateMessages
            .Where(m => m.SenderId == userId && m.RecipientId == myId && !m.IsRead)
            .ToListAsync();
        foreach (var m in unread) m.IsRead = true;
        await db.SaveChangesAsync();

        return Ok(messages);
    }

    // GET /api/Messages/users — returns all users except me (for starting new chats)
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var myId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var users = await userManager.Users
            .Where(u => u.Id != myId)
            .Select(u => new { u.Id, u.Nickname, u.AvatarUrl })
            .ToListAsync();
        return Ok(users);
    }
}
