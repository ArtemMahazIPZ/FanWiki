using FanWiki.Application.DTOs;
using FanWiki.Application.Services;
using Microsoft.AspNetCore.Authorization; 
using Microsoft.AspNetCore.Mvc;

namespace FanWiki.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WikiController(IWikiService wikiService, IWebHostEnvironment env) : ControllerBase
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
        CancellationToken ct = default)
    {
        var articles = await wikiService.GetAllArticlesAsync(lang, category, alignment, sort, ct);
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
            string? imagePath = await SaveImageAsync(dto.Image, ct);
            var id = await wikiService.CreateArticleAsync(dto, imagePath, ct); 
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
            string? imagePath = await SaveImageAsync(dto.Image, ct);
            await wikiService.UpdateArticleAsync(id, dto, imagePath, ct);
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
    public async Task<IActionResult> UploadArticleImage(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("No file");

        var uploadsFolder = Path.Combine(env.WebRootPath, "images", "articles");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return Ok(new { url = $"/images/articles/{uniqueFileName}" });
    }
    
    private async Task<string?> SaveImageAsync(IFormFile? image, CancellationToken ct)
    {
        if (image == null) return null;

        var uploadsFolder = Path.Combine(env.WebRootPath, "images");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = Guid.NewGuid().ToString() + "_" + image.FileName;
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await image.CopyToAsync(fileStream, ct);
        }

        return "/images/" + uniqueFileName;
    }
}