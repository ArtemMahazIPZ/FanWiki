using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FanWiki.Application.DTOs;
using FanWiki.Application.Services;
using FanWiki.Domain.Entities;
using FanWiki.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace FanWiki.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController(
    UserManager<ApplicationUser> userManager,
    IImageService imageService,
    AppDbContext db) : ControllerBase
{
    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null) return NotFound("User not found");

        return Ok(new
        {
            user.Id,
            user.Email,
            user.UserName,
            Nickname = user.Nickname,
            AvatarUrl = user.AvatarUrl,
            Roles = await userManager.GetRolesAsync(user)
        });
    }

    [HttpPost("avatar")]
    [Authorize]
    public async Task<IActionResult> UploadAvatar(IFormFile file, CancellationToken ct = default)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null) return NotFound("User not found");

        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        using var stream = file.OpenReadStream();
        var url = await imageService.UploadImageAsync(stream, file.FileName, "avatars", ct);

        if (url == null)
            return StatusCode(500, "Failed to upload avatar");

        user.AvatarUrl = url;

        var result = await userManager.UpdateAsync(user);

        if (!result.Succeeded)
            return StatusCode(500, "Failed to update user profile");

        var roles = await userManager.GetRolesAsync(user);
        var newToken = GenerateJwtToken(user, roles);

        return Ok(new { avatarUrl = user.AvatarUrl, token = newToken });
    }

    [HttpPut("details")]
    [Authorize]
    public async Task<IActionResult> UpdateDetails([FromBody] UpdateProfileDto dto)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null) return NotFound("User not found");

        user.Nickname = dto.Nickname;

        var result = await userManager.UpdateAsync(user);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        var roles = await userManager.GetRolesAsync(user);
        var newToken = GenerateJwtToken(user, roles);

        return Ok(new { message = "Profile updated", nickname = user.Nickname, token = newToken });
    }

    [HttpDelete("me")]
    [Authorize]
    public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountDto dto)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null) return NotFound("User not found");

        if (!await userManager.CheckPasswordAsync(user, dto.Password))
            return BadRequest("Incorrect password");

        // Remove reactions the user gave to other comments
        var userReactions = await db.CommentReactions
            .Where(r => r.UserId == user.Id)
            .ToListAsync();
        db.CommentReactions.RemoveRange(userReactions);
        await db.SaveChangesAsync();

        // Collect IDs of the user's own comments
        var userCommentIds = await db.Comments
            .Where(c => c.UserId == user.Id)
            .Select(c => c.Id)
            .ToListAsync();

        // Remove reactions on the user's comments
        var onUserComments = await db.CommentReactions
            .Where(r => userCommentIds.Contains(r.CommentId))
            .ToListAsync();
        db.CommentReactions.RemoveRange(onUserComments);
        await db.SaveChangesAsync();

        // Detach replies by other users so they become top-level
        var orphanedReplies = await db.Comments
            .Where(c => c.ParentId.HasValue && userCommentIds.Contains(c.ParentId.Value))
            .ToListAsync();
        foreach (var reply in orphanedReplies) reply.ParentId = null;
        await db.SaveChangesAsync();

        // Delete the user's own comments
        var userComments = await db.Comments
            .Where(c => c.UserId == user.Id)
            .ToListAsync();
        db.Comments.RemoveRange(userComments);
        await db.SaveChangesAsync();

        // Finally delete the account
        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return StatusCode(500, result.Errors);

        return Ok(new { message = "Account deleted successfully" });
    }

    private string GenerateJwtToken(ApplicationUser user, IList<string> roles)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Name, user.UserName!),
            new("nickname", user.Nickname ?? ""),
            new("avatarUrl", user.AvatarUrl ?? "")
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("SuperSecretKey1234567890_MakeItLonger_MustBe32Chars"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            expires: DateTime.Now.AddDays(7),
            claims: claims,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
