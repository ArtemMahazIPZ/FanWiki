using FanWiki.Application.DTOs;
using FanWiki.Application.Services;
using FanWiki.Domain.Enums; 
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
    public async Task<IActionResult> GetAll([FromQuery] string lang = "en", CancellationToken ct = default)
    {
        var articles = await wikiService.GetAllArticlesAsync(lang, ct);
        return Ok(articles);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateArticleDto dto, CancellationToken ct = default)
    {
        string? imagePath = null;

        if (dto.Image != null)
        {
            var uploadsFolder = Path.Combine(env.WebRootPath, "images");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + dto.Image.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Image.CopyToAsync(fileStream, ct);
            }

            imagePath = "/images/" + uniqueFileName;
        }
        
        var id = await wikiService.CreateArticleAsync(dto, imagePath, ct); 
        
        return CreatedAtAction(nameof(Get), new { slug = dto.Slug }, new { id });
    }
}