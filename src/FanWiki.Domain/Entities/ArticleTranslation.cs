using FanWiki.Domain.Common;

namespace FanWiki.Domain.Entities;

public class ArticleTranslation : BaseEntity
{
    public Guid ArticleId { get; set; }
    public Article? Article { get; set; }

    public required string LanguageCode { get; set; }
    public required string Title { get; set; }
    public required string Content { get; set; }
    
    public string? Quote { get; set; }
}