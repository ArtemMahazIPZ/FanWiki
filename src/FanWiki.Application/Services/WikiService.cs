using FanWiki.Application.DTOs;
using FanWiki.Domain.Entities;
using FanWiki.Domain.Interfaces;

namespace FanWiki.Application.Services;

public class WikiService(IArticleRepository repository) : IWikiService
{
    public async Task<ArticleDto?> GetArticleAsync(string slug, string languageCode, CancellationToken ct)
    {
        var article = await repository.GetBySlugAsync(slug, ct);
        if (article is null) return null;

        var translation = article.Translations.FirstOrDefault(t => t.LanguageCode == languageCode) 
                          ?? article.Translations.FirstOrDefault();

        if (translation is null) return null;

        return new ArticleDto(
            article.Slug, 
            translation.Title, 
            translation.Content, 
            translation.LanguageCode,
            article.CreatedAt
        );
    }

    public async Task<Guid> CreateArticleAsync(CreateArticleDto dto, CancellationToken ct)
    {
        var article = new Article
        {
            Slug = dto.Slug,
            IsPublished = true,
            Translations =
            [
                new ArticleTranslation
                {
                    LanguageCode = dto.LanguageCode,
                    Title = dto.Title,
                    Content = dto.Content
                }
            ]
        };

        await repository.AddAsync(article, ct);
        await repository.SaveChangesAsync(ct);
        return article.Id;
    }
}