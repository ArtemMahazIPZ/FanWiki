using FanWiki.Domain.Common;

namespace FanWiki.Domain.Entities;

public class Notification : BaseEntity
{
    public required string UserId { get; set; }
    public ApplicationUser? User { get; set; }

    public required string Message { get; set; }
    public string Type { get; set; } = "info";
    public bool IsRead { get; set; } = false;
}
