using FanWiki.Domain.Common;

namespace FanWiki.Domain.Entities;

public class PrivateMessage : BaseEntity
{
    public required string SenderId { get; set; }
    public ApplicationUser? Sender { get; set; }

    public required string RecipientId { get; set; }
    public ApplicationUser? Recipient { get; set; }

    public required string Content { get; set; }
    public bool IsRead { get; set; } = false;
}
