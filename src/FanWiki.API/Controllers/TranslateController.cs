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
}
