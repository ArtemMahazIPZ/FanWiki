using Microsoft.AspNetCore.Identity;

namespace FanWiki.Domain.Entities;
public class ApplicationUser : IdentityUser
{
    public string? Nickname { get; set; }
    public string? AvatarUrl { get; set; }
    
    public DateTime? BanExpiresAt { get; set; } 
}