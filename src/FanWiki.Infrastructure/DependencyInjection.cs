using FanWiki.Domain.Interfaces;
using FanWiki.Infrastructure.Data;
using FanWiki.Infrastructure.Repositories;
using FanWiki.Infrastructure.Services; 
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FanWiki.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IArticleRepository, ArticleRepository>();
        
        services.AddTransient<IEmailSender, DebugEmailSender>();

        return services;
    }
}