using System.Security.Claims;
using FanWiki.Domain.Entities;
using FanWiki.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FanWiki.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentsController(AppDbContext context, UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet("article/{articleId}")]
    public async Task<IActionResult> GetByArticle(Guid articleId)
    {
        var comments = await context.Comments
            .Where(c => c.ArticleId == articleId && c.ParentId == null) 
            .Include(c => c.User)
            .Include(c => c.Reactions)
            .Include(c => c.Replies)
                .ThenInclude(r => r.User)
            .Include(c => c.Replies)
                .ThenInclude(r => r.Reactions)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        var dtos = comments.Select(MapToDto).ToList();
        return Ok(dtos);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateCommentDto dto)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();
        
        if (user.BanExpiresAt > DateTime.UtcNow)
        {
            return StatusCode(403, new
            {
                message = "You are banned",
                banReason = user.BanReason,
                expiresAt = user.BanExpiresAt
            });
        }

        var comment = new Comment
        {
            ArticleId = dto.ArticleId,
            Content = dto.Content,
            UserId = user.Id,
            ParentId = dto.ParentId
        };

        context.Comments.Add(comment);
        await context.SaveChangesAsync();
        
        await context.Entry(comment).Reference(c => c.User).LoadAsync();

        return Ok(MapToDto(comment));
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id, [FromQuery] string? reason)
    {
        var comment = await context.Comments.FindAsync(id);
        if (comment == null) return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        if (comment.UserId != userId && !isAdmin)
            return Forbid();

        comment.IsDeleted = true;
        comment.Content = "[This comment has been deleted]";

        // If admin provides a reason, store it and create a notification for the comment author
        if (isAdmin && !string.IsNullOrWhiteSpace(reason) && comment.UserId != userId)
        {
            comment.DeletionReason = reason;
            context.Notifications.Add(new Notification
            {
                UserId = comment.UserId,
                Message = reason,
                Type = "comment_deleted"
            });
        }

        await context.SaveChangesAsync();
        return Ok();
    }

    [HttpPost("{id}/react")]
    [Authorize]
    public async Task<IActionResult> React(Guid id, [FromQuery] bool isLike)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var existing = await context.CommentReactions
            .FirstOrDefaultAsync(r => r.CommentId == id && r.UserId == userId);

        if (existing != null)
        {
            if (existing.IsLike == isLike) 
                context.CommentReactions.Remove(existing); 
            else 
                existing.IsLike = isLike; 
        }
        else
        {
            context.CommentReactions.Add(new CommentReaction
            {
                CommentId = id,
                UserId = userId!,
                IsLike = isLike
            });
        }

        await context.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("ban/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UnbanUser(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return NotFound();

        user.BanExpiresAt = null;
        user.BanReason = null;
        await userManager.UpdateAsync(user);

        return Ok(new { message = "User unbanned" });
    }

    [HttpPost("ban/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> BanUser(string userId, [FromQuery] int minutes, [FromQuery] string? reason)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return NotFound();

        user.BanExpiresAt = DateTime.UtcNow.AddMinutes(minutes);
        user.BanReason = reason;
        await userManager.UpdateAsync(user);

        return Ok(new { message = $"User banned until {user.BanExpiresAt}" });
    }

    private static object MapToDto(Comment c)
    {
        return new
        {
            c.Id,
            c.Content,
            c.CreatedAt,
            c.IsDeleted,
            User = new { c.User?.Nickname, c.User?.AvatarUrl, c.User?.Id, IsBanned = c.User?.BanExpiresAt > DateTime.UtcNow },
            Likes = c.Reactions.Count(r => r.IsLike),
            Dislikes = c.Reactions.Count(r => !r.IsLike),
            Replies = c.Replies.OrderBy(r => r.CreatedAt).Select(MapToDto).ToList()
        };
    }
}

public record CreateCommentDto(Guid ArticleId, string Content, Guid? ParentId);