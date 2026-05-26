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

            static async Task<string?> TranslateOrNull(ITranslationService svc, string? text, string sl, string tl, CancellationToken ct)
            {
                if (string.IsNullOrWhiteSpace(text)) return null;
                return await svc.TranslateAsync(text, sl, tl, ct);
            }

            static async Task<string[]> TranslateArray(ITranslationService svc, string[]? items, string sl, string tl, CancellationToken ct)
            {
                if (items is null || items.Length == 0) return [];
                return await Task.WhenAll(items.Select(n => svc.TranslateAsync(n, sl, tl, ct)));
            }

            var titleTask       = translationService.TranslateAsync(dto.Title ?? string.Empty, sl, tl, ct);
            var quoteTask       = TranslateOrNull(translationService, dto.Quote, sl, tl, ct);
            var contentTask     = translationService.TranslateAsync(dto.Content ?? string.Empty, sl, tl, ct);
            var voiceActorTask  = TranslateOrNull(translationService, dto.VoiceActor, sl, tl, ct);
            var birthPlaceTask  = TranslateOrNull(translationService, dto.BirthPlace, sl, tl, ct);
            var familyTask      = TranslateArray(translationService, dto.FamilyNames, sl, tl, ct);
            var alliesTask      = TranslateArray(translationService, dto.AlliesNames, sl, tl, ct);
            var enemiesTask     = TranslateArray(translationService, dto.EnemiesNames, sl, tl, ct);
            var alsoKnownAsTask = TranslateArray(translationService, dto.AlsoKnownAs, sl, tl, ct);

            await Task.WhenAll(titleTask, quoteTask, contentTask, voiceActorTask, birthPlaceTask,
                familyTask, alliesTask, enemiesTask, alsoKnownAsTask);

            return Ok(new TranslateBatchResponseDto(
                titleTask.Result,
                quoteTask.Result ?? string.Empty,
                contentTask.Result,
                voiceActorTask.Result,
                birthPlaceTask.Result,
                familyTask.Result,
                alliesTask.Result,
                enemiesTask.Result,
                alsoKnownAsTask.Result
            ));
        }
        catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
        {
            return StatusCode(429, new { message = "Translation service is rate-limited. Please wait a moment and try again." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Batch translation failed: {ex.Message}" });
        }
    }
}
