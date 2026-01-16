using FanWiki.Domain.Common;
using FanWiki.Domain.Enums;

namespace FanWiki.Domain.Entities;

public class Article : BaseEntity
{
    public required string Slug { get; set; }
    public bool IsPublished { get; set; } = false;
    
    public string? ImageUrl { get; set; } 
    public ArticleCategory Category { get; set; }
    public string? Metadata { get; set; }

    public ICollection<ArticleTranslation> Translations { get; set; } = [];
}