using Microsoft.AspNetCore.Http;

namespace FanWiki.Application.DTOs;

public record ArticleDto(
    Guid Id,
    string Slug,
    string Title,
    string Content,
    string? Quote,
    string LanguageCode,
    string? ImageUrl,
    string Category,
    DateTime CreatedAt,
    string? Metadata,
    string? Alignment,
    string? GameName
);

public class CreateArticleDto
{
    public required string Slug { get; set; }
    public required string Title { get; set; }
    public string? Quote { get; set; } 
    public required string Content { get; set; }
    public required string LanguageCode { get; set; }
    
    public string Category { get; set; } = "Character";
    public string? Alignment { get; set; }
    public string? GameName { get; set; }

    public IFormFile? Image { get; set; }
    public string? Metadata { get; set; }
    public string? TitleEn { get; set; }
    public string? ContentEn { get; set; }
    public string? QuoteEn { get; set; }
    public string? MetadataEn { get; set; }
}