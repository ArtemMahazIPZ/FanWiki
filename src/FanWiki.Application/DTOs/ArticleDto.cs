namespace FanWiki.Application.DTOs;

public record ArticleDto(
    string Slug,
    string Title,
    string Content,
    string LanguageCode,
    DateTime CreatedAt
);

public record CreateArticleDto(
    string Slug,
    string Title,
    string Content,
    string LanguageCode
);