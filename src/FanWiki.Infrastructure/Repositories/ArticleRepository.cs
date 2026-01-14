using FanWiki.Domain.Entities;
using FanWiki.Domain.Interfaces;
using FanWiki.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FanWiki.Infrastructure.Repositories;

public class ArticleRepository(AppDbContext context) : IArticleRepository
{
    public async Task<Article?> GetBySlugAsync(string slug, CancellationToken ct)
    {
        return await context.Articles
            .Include(a => a.Translations) 
            .FirstOrDefaultAsync(a => a.Slug == slug, ct);
    }

    public async Task<List<Article>> GetAllAsync(CancellationToken ct)
    {
        return await context.Articles
            .AsNoTracking() 
            .Include(a => a.Translations)
            .Where(a => a.IsPublished) 
            .OrderByDescending(a => a.CreatedAt) 
            .ToListAsync(ct);
    }

    public async Task AddAsync(Article article, CancellationToken ct)
    {
        await context.Articles.AddAsync(article, ct);
    }

    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await context.SaveChangesAsync(ct);
    }
}