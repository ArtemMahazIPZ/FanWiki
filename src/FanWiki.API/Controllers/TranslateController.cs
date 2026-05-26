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
            var titleTask = translationService.TranslateAsync(dto.Title ?? string.Empty, dto.SourceLang, dto.TargetLang, ct);
            var quoteTask = !string.IsNullOrWhiteSpace(dto.Quote)
                ? translationService.TranslateAsync(dto.Quote, dto.SourceLang, dto.TargetLang, ct)
                : Task.FromResult(string.Empty);
            var contentTask = translationService.TranslateAsync(dto.Content ?? string.Empty, dto.SourceLang, dto.TargetLang, ct);

            await Task.WhenAll(titleTask, quoteTask, contentTask);

            return Ok(new TranslateBatchResponseDto(
                await titleTask,
                await quoteTask,
                await contentTask
            ));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Batch translation failed: {ex.Message}" });
        }
    }
}
