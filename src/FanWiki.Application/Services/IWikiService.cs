using FanWiki.Application.DTOs;

namespace FanWiki.Application.Services;

public interface IWikiService
{
    Task<ArticleDto?> GetArticleAsync(string slug, string languageCode, CancellationToken ct);
    Task<ArticleDto?> GetArticleByIdAsync(Guid id, string languageCode, CancellationToken ct);
    
    Task<List<ArticleDto>> GetAllArticlesAsync(string languageCode, string? category, string? alignment, string sort, CancellationToken ct);
    
    Task<Guid> CreateArticleAsync(CreateArticleDto dto, string? imagePath, CancellationToken ct);
    Task UpdateArticleAsync(Guid id, CreateArticleDto dto, string? imagePath, CancellationToken ct);
    Task DeleteArticleAsync(Guid id, CancellationToken ct);
}