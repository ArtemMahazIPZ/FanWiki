using FanWiki.Application.DTOs;
using FanWiki.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace FanWiki.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WikiController(IWikiService wikiService) : ControllerBase
{
    [HttpGet("{slug}")]
    public async Task<IActionResult> Get(string slug, [FromQuery] string lang = "en", CancellationToken ct = default)
    {
        var article = await wikiService.GetArticleAsync(slug, lang, ct);
        
        if (article is null)
            return NotFound(new { message = $"Article '{slug}' not found." });

        return Ok(article);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateArticleDto dto, CancellationToken ct = default)
    {
        var id = await wikiService.CreateArticleAsync(dto, ct);
        return CreatedAtAction(nameof(Get), new { slug = dto.Slug }, new { id });
    }
}