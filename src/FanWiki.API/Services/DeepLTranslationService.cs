using System.Net.Http.Json;
using System.Text.Json.Serialization;
using FanWiki.Application.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FanWiki.API.Services;

public class DeepLTranslationService(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<DeepLTranslationService> logger) : ITranslationService
{
    private const string DeepLFreeEndpoint = "https://api-free.deepl.com/v2/translate";

    public async Task<string> TranslateAsync(string text, string sourceLanguage, string targetLanguage, CancellationToken ct = default)
    {
        var apiKey = configuration["DeepL:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            logger.LogWarning("DeepL:ApiKey is not configured. Returning stub translation.");
            return $"[Auto-translated] {text}";
        }

        var client = httpClientFactory.CreateClient("DeepL");
        client.DefaultRequestHeaders.Clear();
        client.DefaultRequestHeaders.Add("Authorization", $"DeepL-Auth-Key {apiKey}");

        var payload = new
        {
            text = new[] { text },
            source_lang = sourceLanguage.ToUpperInvariant(),
            target_lang = targetLanguage.ToUpperInvariant()
        };

        var response = await client.PostAsJsonAsync(DeepLFreeEndpoint, payload, ct);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            logger.LogError("DeepL API error {StatusCode}: {Body}", (int)response.StatusCode, body);
            throw new HttpRequestException($"DeepL returned {(int)response.StatusCode}: {body}");
        }

        var result = await response.Content.ReadFromJsonAsync<DeepLResponse>(cancellationToken: ct);

        var translated = result?.Translations?.FirstOrDefault()?.Text;
        if (translated is null)
            throw new InvalidOperationException("DeepL returned an empty translation.");

        return translated;
    }

    private record DeepLResponse(
        [property: JsonPropertyName("translations")] DeepLTranslation[]? Translations);

    private record DeepLTranslation(
        [property: JsonPropertyName("text")] string? Text);
}
