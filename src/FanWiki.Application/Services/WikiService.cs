using FanWiki.Application.DTOs;
using FanWiki.Domain.Entities;
using FanWiki.Domain.Enums; 
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
            article.Id,             
            article.Slug, 
            translation.Title, 
            translation.Content,
            translation.Quote, 
            translation.LanguageCode,
            article.ImageUrl,              
            article.Category.ToString(),   
            article.CreatedAt,
            article.Metadata 
        );
    }

    public async Task<ArticleDto?> GetArticleByIdAsync(Guid id, string languageCode, CancellationToken ct)
    {
        var article = await repository.GetByIdAsync(id, ct);
        if (article is null) return null;

        var translation = article.Translations.FirstOrDefault(t => t.LanguageCode == languageCode) 
                          ?? article.Translations.FirstOrDefault();

        if (translation is null) return null;

        return new ArticleDto(
            article.Id,            
            article.Slug, 
            translation.Title, 
            translation.Content,
            translation.Quote, 
            translation.LanguageCode,
            article.ImageUrl,              
            article.Category.ToString(),   
            article.CreatedAt,
            article.Metadata
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
                article.Id,         
                article.Slug, 
                translation.Title, 
                translation.Content, 
                translation.Quote, 
                translation.LanguageCode,
                article.ImageUrl,
                article.Category.ToString(),
                article.CreatedAt,
                article.Metadata 
            ));
        }

        return dtos;
    }

    public async Task<Guid> CreateArticleAsync(CreateArticleDto dto, string? imagePath, CancellationToken ct)
    {
        if (!Enum.TryParse<ArticleCategory>(dto.Category, true, out var categoryEnum))
        {
            categoryEnum = ArticleCategory.Character; 
        }

        var article = new Article
        {
            Slug = dto.Slug,
            IsPublished = true,
            ImageUrl = imagePath,   
            Category = categoryEnum,
            Metadata = dto.Metadata, 
            Translations =
            [
                new ArticleTranslation
                {
                    LanguageCode = dto.LanguageCode,
                    Title = dto.Title,
                    Content = dto.Content,
                    Quote = dto.Quote 
                }
            ]
        };

        await repository.AddAsync(article, ct);
        await repository.SaveChangesAsync(ct);
        return article.Id;
    } 

    public async Task UpdateArticleAsync(Guid id, CreateArticleDto dto, string? imagePath, CancellationToken ct)
    {
        var article = await repository.GetByIdAsync(id, ct);

        if (article == null) throw new Exception("Article not found");

        article.Slug = dto.Slug;
        article.Metadata = dto.Metadata; 

        if (Enum.TryParse<ArticleCategory>(dto.Category, true, out var categoryEnum))
        {
            article.Category = categoryEnum;
        }
        
        if (!string.IsNullOrEmpty(imagePath))
        {
            article.ImageUrl = imagePath;
        }

        var translation = article.Translations.FirstOrDefault(t => t.LanguageCode == dto.LanguageCode);

        if (translation != null)
        {
            translation.Title = dto.Title;
            translation.Content = dto.Content;
            translation.Quote = dto.Quote;
        }
        else
        {
             // Якщо перекладу немає - створюємо НОВИЙ
             var newTranslation = new ArticleTranslation
             {
                 Id = Guid.NewGuid(), 
                 ArticleId = article.Id, 
                 LanguageCode = dto.LanguageCode,
                 Title = dto.Title,
                 Content = dto.Content,
                 Quote = dto.Quote 
             };
             
             await repository.AddTranslationAsync(newTranslation, ct);
             
             article.Translations.Add(newTranslation);
        }

        await repository.SaveChangesAsync(ct);
    }

    public async Task DeleteArticleAsync(Guid id, CancellationToken ct)
    {
        var article = await repository.GetByIdAsync(id, ct);

        if (article != null)
        {
            await repository.DeleteAsync(article, ct);
            await repository.SaveChangesAsync(ct);
        }
    }
}