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
            translation.Metadata,
            article.Alignment?.ToString(),
            article.GameName
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
            translation.Metadata,
            article.Alignment?.ToString(),
            article.GameName
        );
    }

    public async Task<List<ArticleDto>> GetAllArticlesAsync(
        string languageCode,
        string? category,
        string? alignment,
        string sort,
        string? game,
        CancellationToken ct)
    {
        var articles = await repository.GetAllAsync(ct);
        
        if (!string.IsNullOrEmpty(category) && category != "All")
        {
            if (Enum.TryParse<ArticleCategory>(category, true, out var catEnum))
            {
                articles = articles.Where(a => a.Category == catEnum).ToList();
            }
        }

        if (!string.IsNullOrEmpty(alignment))
        {
            if (Enum.TryParse<CharacterAlignment>(alignment, true, out var alignEnum))
            {
                articles = articles.Where(a => a.Alignment == alignEnum).ToList();
            }
        }

        if (!string.IsNullOrEmpty(game))
        {
            articles = articles.Where(a =>
                !string.IsNullOrEmpty(a.GameName) &&
                a.GameName.Equals(game, StringComparison.OrdinalIgnoreCase)).ToList();
        }

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
                translation.Metadata,
                article.Alignment?.ToString(),
                article.GameName
            ));
        }

        if (sort == "za")
        {
            dtos = dtos.OrderByDescending(d => d.Title).ToList();
        }
        else
        {
            dtos = dtos.OrderBy(d => d.Title).ToList();
        }

        return dtos;
    }

    public async Task<Guid> CreateArticleAsync(CreateArticleDto dto, string? imagePath, CancellationToken ct)
    {
        if (!Enum.TryParse<ArticleCategory>(dto.Category, true, out var categoryEnum))
        {
            categoryEnum = ArticleCategory.Character; 
        }

        CharacterAlignment? alignmentEnum = null;
        if (!string.IsNullOrEmpty(dto.Alignment) && Enum.TryParse<CharacterAlignment>(dto.Alignment, true, out var parsedAlign))
        {
            alignmentEnum = parsedAlign;
        }

        var translations = new List<ArticleTranslation>
        {
            new ArticleTranslation
            {
                LanguageCode = dto.LanguageCode,
                Title = dto.Title,
                Content = dto.Content,
                Quote = dto.Quote,
                Metadata = dto.Metadata
            }
        };

        if (!string.IsNullOrWhiteSpace(dto.TitleEn) &&
            !string.IsNullOrWhiteSpace(dto.ContentEn) &&
            !dto.LanguageCode.Equals("en", StringComparison.OrdinalIgnoreCase))
        {
            translations.Add(new ArticleTranslation
            {
                LanguageCode = "en",
                Title = dto.TitleEn,
                Content = dto.ContentEn,
                Quote = dto.QuoteEn,
                Metadata = dto.MetadataEn ?? dto.Metadata
            });
        }

        var article = new Article
        {
            Slug = dto.Slug,
            IsPublished = true,
            ImageUrl = imagePath,
            Category = categoryEnum,
            Alignment = alignmentEnum,
            GameName = dto.GameName,
            Translations = translations
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
        article.GameName = dto.GameName;

        if (Enum.TryParse<ArticleCategory>(dto.Category, true, out var categoryEnum))
        {
            article.Category = categoryEnum;
        }
        
        if (!string.IsNullOrEmpty(dto.Alignment) && Enum.TryParse<CharacterAlignment>(dto.Alignment, true, out var alignEnum))
        {
            article.Alignment = alignEnum;
        }
        else if (string.IsNullOrEmpty(dto.Alignment)) 
        {
            article.Alignment = null; 
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
            translation.Metadata = dto.Metadata;
        }
        else
        {
             var newTranslation = new ArticleTranslation
             {
                 Id = Guid.NewGuid(),
                 ArticleId = article.Id,
                 LanguageCode = dto.LanguageCode,
                 Title = dto.Title,
                 Content = dto.Content,
                 Quote = dto.Quote,
                 Metadata = dto.Metadata
             };

             await repository.AddTranslationAsync(newTranslation, ct);
             article.Translations.Add(newTranslation);
        }

        if (!string.IsNullOrWhiteSpace(dto.TitleEn) &&
            !string.IsNullOrWhiteSpace(dto.ContentEn) &&
            !dto.LanguageCode.Equals("en", StringComparison.OrdinalIgnoreCase))
        {
            var enTranslation = article.Translations.FirstOrDefault(t => t.LanguageCode == "en");
            if (enTranslation != null)
            {
                enTranslation.Title = dto.TitleEn;
                enTranslation.Content = dto.ContentEn;
                enTranslation.Quote = dto.QuoteEn;
                enTranslation.Metadata = dto.MetadataEn ?? enTranslation.Metadata;
            }
            else
            {
                var newEn = new ArticleTranslation
                {
                    Id = Guid.NewGuid(),
                    ArticleId = article.Id,
                    LanguageCode = "en",
                    Title = dto.TitleEn,
                    Content = dto.ContentEn,
                    Quote = dto.QuoteEn,
                    Metadata = dto.MetadataEn ?? dto.Metadata
                };
                await repository.AddTranslationAsync(newEn, ct);
                article.Translations.Add(newEn);
            }
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