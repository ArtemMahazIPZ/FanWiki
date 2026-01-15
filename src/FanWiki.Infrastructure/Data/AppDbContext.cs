using FanWiki.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FanWiki.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Article> Articles { get; set; }
    public DbSet<ArticleTranslation> ArticleTranslations { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder); 

        builder.Entity<Article>()
            .HasIndex(a => a.Slug)
            .IsUnique();

        builder.Entity<ArticleTranslation>()
            .HasOne(t => t.Article)
            .WithMany(a => a.Translations)
            .HasForeignKey(t => t.ArticleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}