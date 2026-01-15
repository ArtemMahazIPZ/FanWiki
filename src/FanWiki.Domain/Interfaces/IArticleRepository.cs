using FanWiki.Domain.Entities;

namespace FanWiki.Domain.Interfaces;

public interface IArticleRepository
{
    Task<Article?> GetBySlugAsync(string slug, CancellationToken ct);
    Task AddAsync(Article article, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
    
    Task<List<Article>> GetAllAsync(CancellationToken ct);
    Task DeleteAsync(Article article, CancellationToken ct);
    Task<Article?> GetByIdAsync(Guid id, CancellationToken ct);
}