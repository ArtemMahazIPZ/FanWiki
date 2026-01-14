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
            article.ImageUrl,              
            article.Category.ToString(),   
            article.CreatedAt
        );
    }
    public async Task<List<ArticleDto>> GetAllArticlesAsync(string languageCode, CancellationToken ct)
    {
        var articles = await repository.GetAllAsync(ct);
        var dtos = new List<ArticleDto>();

        foreach (var article in articles)
        {
            var translation = article.Translations.FirstOrDefault(t => t.LanguageCode == languageCode) 
                              ?? article.Translations.FirstOrDefault();

            if (translation == null) continue;

            dtos.Add(new ArticleDto(
                article.Slug, 
                translation.Title, 
                translation.Content, 
                translation.LanguageCode,
                article.ImageUrl,
                article.Category.ToString(),
                article.CreatedAt
            ));
        }

        return dtos;
    }
    public async Task<Guid> CreateArticleAsync(CreateArticleDto dto, string? imagePath, CancellationToken ct)
    {
        var article = new Article
        {
            Slug = dto.Slug,
            IsPublished = true,
            ImageUrl = imagePath,   
            Category = dto.Category, 
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