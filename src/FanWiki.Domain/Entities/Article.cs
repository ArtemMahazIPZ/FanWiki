using FanWiki.Domain.Common;

namespace FanWiki.Domain.Entities;

public class Article : BaseEntity
{
    public required string Slug { get; set; } 
    public bool IsPublished { get; set; } = false;
    
    public ICollection<ArticleTranslation> Translations { get; set; } = [];
}