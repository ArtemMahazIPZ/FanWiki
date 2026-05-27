using FanWiki.Application.DTOs;
using FanWiki.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FanWiki.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class TranslateController(ITranslationService translationService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Translate([FromBody] TranslateRequestDto dto, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.Text))
            return BadRequest(new { message = "Text cannot be empty." });

        try
        {
            var translated = await translationService.TranslateAsync(dto.Text, dto.SourceLang, dto.TargetLang, ct);
            return Ok(new TranslateResponseDto(translated));
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(502, new { message = $"Translation service error: {ex.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Translation failed: {ex.Message}" });
        }
    }

    [HttpPost("batch")]
    public async Task<IActionResult> TranslateBatch([FromBody] TranslateBatchRequestDto dto, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.Title) && string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest(new { message = "Title and Content cannot both be empty." });

        try
        {
            var sl = dto.SourceLang;
            var tl = dto.TargetLang;

            // Translate fields sequentially to avoid hammering the rate limit
            var title        = await TranslateOrEmpty(dto.Title, sl, tl, ct);
            var quote        = await TranslateOrNull(dto.Quote, sl, tl, ct);
            var content      = await TranslateOrEmpty(dto.Content, sl, tl, ct);
            var voiceActor   = await TranslateOrNull(dto.VoiceActor, sl, tl, ct);
            var birthPlace   = await TranslateOrNull(dto.BirthPlace, sl, tl, ct);
            var birthDate    = await TranslateOrNull(dto.BirthDate, sl, tl, ct);
            var causeOfDeath = await TranslateOrNull(dto.CauseOfDeath, sl, tl, ct);
            var family       = await TranslateArray(dto.FamilyNames, sl, tl, ct);
            var allies       = await TranslateArray(dto.AlliesNames, sl, tl, ct);
            var enemies      = await TranslateArray(dto.EnemiesNames, sl, tl, ct);
            var alsoKnownAs  = await TranslateArray(dto.AlsoKnownAs, sl, tl, ct);

            return Ok(new TranslateBatchResponseDto(
                title,
                quote ?? string.Empty,
                content,
                voiceActor,
                birthPlace,
                birthDate,
                causeOfDeath,
                family,
                allies,
                enemies,
                alsoKnownAs
            ));
        }
        catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
        {
            return StatusCode(429, new { message = "Translation service is rate-limited. Please wait a moment and try again." });
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(502, new { message = $"Translation service error: {ex.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Batch translation failed: {ex.Message}" });
        }
    }

    private async Task<string> TranslateOrEmpty(string? text, string sl, string tl, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;
        return await translationService.TranslateAsync(text, sl, tl, ct);
    }

    private async Task<string?> TranslateOrNull(string? text, string sl, string tl, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(text)) return null;
        return await translationService.TranslateAsync(text, sl, tl, ct);
    }

    private async Task<string[]> TranslateArray(string[]? items, string sl, string tl, CancellationToken ct)
    {
        if (items is null || items.Length == 0) return [];
        var results = new string[items.Length];
        for (var i = 0; i < items.Length; i++)
            results[i] = await translationService.TranslateAsync(items[i], sl, tl, ct);
        return results;
    }
}
