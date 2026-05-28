using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FanWiki.Application.DTOs;
using FanWiki.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace FanWiki.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    ILogger<AuthController> logger
    ) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        dto.Username = dto.Username.Trim();
        dto.Email    = dto.Email.Trim();
        dto.Nickname = dto.Nickname.Trim();

        var existingUser = await userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
            return BadRequest(new { description = "User with this email already exists." });

        var user = new ApplicationUser
        {
            UserName = dto.Username,
            Email    = dto.Email,
            Nickname = dto.Nickname,
            AvatarUrl = dto.AvatarUrl
        };

        var result = await userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        await userManager.AddToRoleAsync(user, "User");

        var code = new Random().Next(100000, 999999).ToString();
        await userManager.AddClaimAsync(user, new Claim("EmailVerificationCode", code));

        logger.LogInformation("══════════════════════════════════════════════════");
        logger.LogInformation("  EMAIL VERIFICATION CODE");
        logger.LogInformation("  User  : {Email}", dto.Email);
        logger.LogInformation("  Code  : {Code}", code);
        logger.LogInformation("══════════════════════════════════════════════════");

        return Ok(new { message = "Registration successful. Please check your email for the verification code." });
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail(VerifyEmailDto dto)
    {
        dto.Email = dto.Email.Trim();

        var user = await userManager.FindByEmailAsync(dto.Email);
        if (user == null) return BadRequest("User not found");

        if (user.EmailConfirmed) return Ok(new { message = "Email is already confirmed" });

        var claims = await userManager.GetClaimsAsync(user);
        var storedCode = claims.FirstOrDefault(c => c.Type == "EmailVerificationCode")?.Value;

        if (storedCode != dto.Code)
            return BadRequest("Invalid verification code");

        user.EmailConfirmed = true;
        await userManager.UpdateAsync(user);
        await userManager.RemoveClaimAsync(user, claims.First(c => c.Type == "EmailVerificationCode"));

        return Ok(new { message = "Email confirmed successfully! You can now login." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        dto.UsernameOrEmail = dto.UsernameOrEmail.Trim();

        var user = await userManager.FindByNameAsync(dto.UsernameOrEmail)
                   ?? await userManager.FindByEmailAsync(dto.UsernameOrEmail);
        if (user == null) return Unauthorized("Invalid username or email");

        if (!user.EmailConfirmed)
            return Unauthorized("Please confirm your email address before logging in.");

        var result = await signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!result.Succeeded) return Unauthorized("Invalid password");

        var roles = await userManager.GetRolesAsync(user);
        var token = GenerateJwtToken(user, roles);

        return Ok(new AuthResponseDto
        {
            Token    = token,
            Username = user.UserName!,
            Role     = roles.FirstOrDefault() ?? "User"
        });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        dto.Email = dto.Email.Trim();

        var user = await userManager.FindByEmailAsync(dto.Email);

        // Always return 200 so we don't reveal whether the email exists
        if (user == null)
            return Ok(new { message = "If your email exists in our system, we have sent a reset code." });

        // Replace any existing reset code
        var existingClaims = await userManager.GetClaimsAsync(user);
        var existing = existingClaims.FirstOrDefault(c => c.Type == "PasswordResetCode");
        if (existing != null)
            await userManager.RemoveClaimAsync(user, existing);

        var resetCode = new Random().Next(100000, 999999).ToString();
        await userManager.AddClaimAsync(user, new Claim("PasswordResetCode", resetCode));

        logger.LogInformation("══════════════════════════════════════════════════");
        logger.LogInformation("  PASSWORD RESET CODE");
        logger.LogInformation("  User  : {Email}", dto.Email);
        logger.LogInformation("  Code  : {Code}", resetCode);
        logger.LogInformation("══════════════════════════════════════════════════");

        return Ok(new { message = "If your email exists in our system, we have sent a reset code." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
    {
        dto.Email = dto.Email.Trim();

        var user = await userManager.FindByEmailAsync(dto.Email);
        if (user == null) return BadRequest("Invalid request");

        var claims = await userManager.GetClaimsAsync(user);
        var storedCode = claims.FirstOrDefault(c => c.Type == "PasswordResetCode")?.Value;

        if (storedCode == null || storedCode != dto.Code)
            return BadRequest("Invalid or expired reset code");

        // Consume the code so it cannot be reused
        await userManager.RemoveClaimAsync(user, claims.First(c => c.Type == "PasswordResetCode"));

        // Generate an internal token just to drive Identity's password-reset machinery
        var internalToken = await userManager.GeneratePasswordResetTokenAsync(user);
        var result = await userManager.ResetPasswordAsync(user, internalToken, dto.NewPassword);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { message = "Password reset successful. You can now login with your new password." });
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
            claims.Add(new Claim(ClaimTypes.Role, role));

        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("SuperSecretKey1234567890_MakeItLonger_MustBe32Chars"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            expires: DateTime.Now.AddDays(7),
            claims: claims,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
