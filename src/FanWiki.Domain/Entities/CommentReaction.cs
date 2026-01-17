using FanWiki.Domain.Common;

namespace FanWiki.Domain.Entities;

public class CommentReaction : BaseEntity
{
    public Guid CommentId { get; set; }
    public Comment? Comment { get; set; }

    public required string UserId { get; set; } 
    public ApplicationUser? User { get; set; }

    public bool IsLike { get; set; } 
}