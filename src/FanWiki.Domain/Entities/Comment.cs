using FanWiki.Domain.Common;

namespace FanWiki.Domain.Entities;

public class Comment : BaseEntity 
{
    public required string Content { get; set; }
    
    
    public bool IsDeleted { get; set; } = false; 

    public required string UserId { get; set; } 
    public ApplicationUser? User { get; set; }

    public Guid ArticleId { get; set; }

    public Guid? ParentId { get; set; }
    public Comment? Parent { get; set; }
    public ICollection<Comment> Replies { get; set; } = [];

    public ICollection<CommentReaction> Reactions { get; set; } = [];
}