using FanWiki.Application.Services;
using FanWiki.Domain.Entities;
using FanWiki.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace FanWiki.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController(AppDbContext db, ITranslationService translationService) : ControllerBase
{
    private static string StripHtml(string html)
    {
        if (string.IsNullOrWhiteSpace(html)) return string.Empty;
        return Regex.Replace(html, "<[^>]+>", " ").Trim();
    }

    [HttpPost("batch-translate")]
    public async Task<IActionResult> BatchTranslate(CancellationToken ct)
    {
        var articles = await db.Articles
            .Include(a => a.Translations)
            .Where(a => !a.Translations.Any(t => t.LanguageCode == "en"))
            .ToListAsync(ct);

        if (articles.Count == 0)
            return Ok(new { message = "All articles already have English translations.", translated = 0, failed = 0, errors = Array.Empty<string>() });

        int translated = 0;
        int failed = 0;
        var errors = new List<string>();

        foreach (var article in articles)
        {
            var source = article.Translations.FirstOrDefault(t => t.LanguageCode == "uk")
                      ?? article.Translations.FirstOrDefault(t => !t.LanguageCode.StartsWith("en"));

            if (source is null) { failed++; continue; }

            try
            {
                var plainContent = StripHtml(source.Content);

                var titleEn = await translationService.TranslateAsync(source.Title, "UK", "EN", ct);
                var contentEn = await translationService.TranslateAsync(plainContent, "UK", "EN", ct);
                string? quoteEn = null;
                if (!string.IsNullOrWhiteSpace(source.Quote))
                    quoteEn = await translationService.TranslateAsync(source.Quote, "UK", "EN", ct);

                db.ArticleTranslations.Add(new ArticleTranslation
                {
                    Id = Guid.NewGuid(),
                    ArticleId = article.Id,
                    LanguageCode = "en",
                    Title = titleEn,
                    Content = contentEn,
                    Quote = quoteEn,
                    Metadata = source.Metadata
                });

                translated++;
            }
            catch (Exception ex)
            {
                failed++;
                errors.Add($"{article.Slug}: {ex.Message}");
            }
        }

        await db.SaveChangesAsync(ct);

        return Ok(new
        {
            message = $"Batch translation complete. Translated: {translated}, Failed: {failed}.",
            translated,
            failed,
            errors
        });
    }
}
