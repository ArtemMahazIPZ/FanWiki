using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FanWiki.Application.DTOs;
using FanWiki.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace FanWiki.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController(
    UserManager<ApplicationUser> userManager, 
    IWebHostEnvironment env) : ControllerBase
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
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        var user = await userManager.GetUserAsync(User);
        if (user == null) return NotFound("User not found");

        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        var uploadsFolder = Path.Combine(env.WebRootPath, "images", "avatars");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        var fileExtension = Path.GetExtension(file.FileName);
        var uniqueFileName = $"{user.Id}_{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        user.AvatarUrl = $"/images/avatars/{uniqueFileName}";
        
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