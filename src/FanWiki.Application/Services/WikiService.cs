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
            article.Metadata,
            article.Alignment?.ToString() 
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
            article.Metadata,
            article.Alignment?.ToString() 
        );
    }

    public async Task<List<ArticleDto>> GetAllArticlesAsync(
        string languageCode, 
        string? category, 
        string? alignment, 
        string sort, 
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
                article.Metadata,
                article.Alignment?.ToString() 
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

        var article = new Article
        {
            Slug = dto.Slug,
            IsPublished = true,
            ImageUrl = imagePath,   
            Category = categoryEnum,
            Alignment = alignmentEnum, 
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