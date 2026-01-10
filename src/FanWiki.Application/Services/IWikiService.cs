using FanWiki.Application.DTOs;

namespace FanWiki.Application.Services;

public interface IWikiService
{
    Task<ArticleDto?> GetArticleAsync(string slug, string languageCode, CancellationToken ct);
    Task<Guid> CreateArticleAsync(CreateArticleDto dto, CancellationToken ct);
}