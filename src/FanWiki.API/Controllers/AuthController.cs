using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FanWiki.Application.DTOs;
using FanWiki.Application.Interfaces;
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
    IEmailSender emailSender
    ) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var existingUser = await userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
        {
            return BadRequest(new { description = "User with this email already exists." });
        }

        var user = new ApplicationUser
        {
            UserName = dto.Username,
            Email = dto.Email,
            Nickname = dto.Nickname,
            AvatarUrl = dto.AvatarUrl
        };

        var result = await userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        await userManager.AddToRoleAsync(user, "User");

        var code = new Random().Next(100000, 999999).ToString();

      
        await userManager.AddClaimAsync(user, new Claim("EmailVerificationCode", code));

        await emailSender.SendEmailAsync(
            dto.Email,
            "Код підтвердження FanWiki",
            $"""
            <p style="font-size:16px;color:#94a3b8;margin:0 0 24px;">
              Дякуємо за реєстрацію на <strong style="color:#34d399;">FanWiki</strong>!
            </p>
            <p style="color:#cbd5e1;margin:0 0 16px;">
              Ваш одноразовий код підтвердження:
            </p>
            <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;
                        padding:20px;text-align:center;margin:0 0 24px;">
              <span style="font-size:36px;font-weight:700;letter-spacing:10px;
                           color:#34d399;font-family:monospace;">{code}</span>
            </div>
            <p style="font-size:13px;color:#64748b;margin:0;">
              Код дійсний протягом поточної сесії. Не передавайте його нікому.
            </p>
            """
        );

        return Ok(new { message = "Registration successful. Please check your email for the verification code." });
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail(VerifyEmailDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);
        if (user == null) return BadRequest("User not found");

        if (user.EmailConfirmed) return Ok(new { message = "Email is already confirmed" });

        var claims = await userManager.GetClaimsAsync(user);
        var storedCode = claims.FirstOrDefault(c => c.Type == "EmailVerificationCode")?.Value;

        if (storedCode != dto.Code)
        {
            return BadRequest("Invalid verification code");
        }

        user.EmailConfirmed = true;
        await userManager.UpdateAsync(user);

        await userManager.RemoveClaimAsync(user, claims.First(c => c.Type == "EmailVerificationCode"));

        return Ok(new { message = "Email confirmed successfully! You can now login." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await userManager.FindByNameAsync(dto.Username);
        if (user == null) return Unauthorized("Invalid username");

        if (!user.EmailConfirmed)
        {
             return Unauthorized("Please confirm your email address before logging in.");
        }

        var result = await signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!result.Succeeded) return Unauthorized("Invalid password");

        var roles = await userManager.GetRolesAsync(user);
        var token = GenerateJwtToken(user, roles);

        return Ok(new AuthResponseDto
        {
            Token = token,
            Username = user.UserName!,
            Role = roles.FirstOrDefault() ?? "User"
        });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);
        
        if (user == null) 
            return Ok(new { message = "If your email exists in our system, we have sent a reset code." });

        var token = await userManager.GeneratePasswordResetTokenAsync(user);

        await emailSender.SendEmailAsync(
            dto.Email,
            "Password Reset — FanWiki",
            $"""
            <p style="font-size:16px;color:#94a3b8;margin:0 0 24px;">
              We received a request to reset the password for your
              <strong style="color:#34d399;">FanWiki</strong> account.
            </p>
            <p style="color:#cbd5e1;margin:0 0 16px;">
              Copy the token below and paste it into the reset-password form:
            </p>
            <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;
                        padding:20px;word-break:break-all;margin:0 0 24px;">
              <code style="font-size:13px;color:#34d399;font-family:monospace;
                           line-height:1.6;">{System.Net.WebUtility.HtmlEncode(token)}</code>
            </div>
            <p style="font-size:13px;color:#64748b;margin:0;">
              If you did not request a password reset, please ignore this email.
              Your password will remain unchanged.
            </p>
            """
        );

        return Ok(new { message = "If your email exists in our system, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);
        if (user == null) return BadRequest("Invalid request");

        var result = await userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);

        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

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