using FanWiki.Domain.Enums;
using Microsoft.AspNetCore.Http; 

namespace FanWiki.Application.DTOs;

public record ArticleDto(
    Guid Id, 
    string Slug,
    string Title,
    string Content,
    string LanguageCode,
    string? ImageUrl,       
    string Category,        
    DateTime CreatedAt
);

public class CreateArticleDto
{
    public required string Slug { get; set; }
    public required string Title { get; set; }
    public required string Content { get; set; }
    public required string LanguageCode { get; set; }
    
    public string Category { get; set; } = "Character"; 
    
    public IFormFile? Image { get; set; } 
}