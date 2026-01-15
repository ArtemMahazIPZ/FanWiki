using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FanWiki.Application.DTOs;
using FanWiki.Domain.Entities;
using FanWiki.Infrastructure.Services; // <-- Важливо: щоб бачити IEmailSender
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace FanWiki.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IEmailSender emailSender // <-- Додали новий сервіс в конструктор
    ) : ControllerBase
{
    // 1. РЕЄСТРАЦІЯ
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
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

        return Ok(new { message = "Registration successful" });
    }

    // 2. ВХІД
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await userManager.FindByNameAsync(dto.Username);
        if (user == null) return Unauthorized("Invalid username");

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

    // 3. ЗАБУВ ПАРОЛЬ (Генерація коду)
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);
        
        // Безпека: навіть якщо юзера немає, ми не кажемо про це прямо, 
        // щоб хакери не перевіряли базу email-адрес.
        if (user == null) 
            return Ok(new { message = "If your email exists in our system, we have sent a reset code." });

        // Генеруємо спец-код для скидання
        var token = await userManager.GeneratePasswordResetTokenAsync(user);

        // "Відправляємо" лист (дивись в консоль сервера!)
        await emailSender.SendEmailAsync(dto.Email, "Reset Password Token", $"Your reset code is: {token}");

        return Ok(new { message = "Check your email (console) for the reset code." });
    }

    // 4. СКИНУТИ ПАРОЛЬ (Встановлення нового)
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);
        if (user == null) return BadRequest("Invalid request");

        // Спроба змінити пароль за допомогою токена
        var result = await userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);

        if (!result.Succeeded)
        {
            // Повертаємо помилки (наприклад, "Невірний токен" або "Пароль надто простий")
            return BadRequest(result.Errors);
        }

        return Ok(new { message = "Password reset successful. You can now login with your new password." });
    }
    
    // --- Допоміжний метод генерації JWT ---
    private string GenerateJwtToken(ApplicationUser user, IList<string> roles)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Name, user.UserName!),
            new("nickname", user.Nickname ?? "")
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