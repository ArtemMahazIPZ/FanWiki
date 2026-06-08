using FanWiki.Application.DTOs;
using FanWiki.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FanWiki.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WikiController(IWikiService wikiService, IImageService imageService) : ControllerBase
{
    [HttpGet("{slug}")]
    public async Task<IActionResult> Get(string slug, [FromQuery] string lang = "en", CancellationToken ct = default)
    {
        var article = await wikiService.GetArticleAsync(slug, lang, ct);
        if (article is null) return NotFound();
        return Ok(article);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? category,
        [FromQuery] string? alignment,
        [FromQuery] string sort = "az",
        [FromQuery] string lang = "en",
        [FromQuery] string? game = null,
        CancellationToken ct = default)
    {
        var articles = await wikiService.GetAllArticlesAsync(lang, category, alignment, sort, game, ct);
        return Ok(articles);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, [FromQuery] string lang = "en", CancellationToken ct = default)
    {
        var article = await wikiService.GetArticleByIdAsync(id, lang, ct);
        if (article is null) return NotFound();
        return Ok(article);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromForm] CreateArticleDto dto, CancellationToken ct = default)
    {
        try
        {
            string? imageUrl = await UploadToCloudinaryAsync(dto.Image, "images", ct);
            var id = await wikiService.CreateArticleAsync(dto, imageUrl, ct);
            return CreatedAtAction(nameof(Get), new { slug = dto.Slug }, new { id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromForm] CreateArticleDto dto, CancellationToken ct = default)
    {
        try
        {
            string? imageUrl = await UploadToCloudinaryAsync(dto.Image, "images", ct);
            await wikiService.UpdateArticleAsync(id, dto, imageUrl, ct);
            return Ok(new { message = "Article updated" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, stack = ex.ToString() });
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct = default)
    {
        try
        {
            await wikiService.DeleteArticleAsync(id, ct);
            return Ok(new { message = "Article deleted" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("upload-image")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadArticleImage(IFormFile file, CancellationToken ct = default)
    {
        if (file == null || file.Length == 0) return BadRequest("No file");

        using var stream = file.OpenReadStream();
        var url = await imageService.UploadImageAsync(stream, file.FileName, "articles", ct);

        if (url == null) return StatusCode(500, "Failed to upload image");

        return Ok(new { url });
    }

    private async Task<string?> UploadToCloudinaryAsync(IFormFile? image, string folder, CancellationToken ct)
    {
        if (image == null) return null;

        using var stream = image.OpenReadStream();
        return await imageService.UploadImageAsync(stream, image.FileName, folder, ct);
    }
}
