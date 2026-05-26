using System.Text;
using System.Text.Json;
using FanWiki.Application.Services;
using Microsoft.Extensions.Logging;

namespace FanWiki.API.Services;

public class GoogleTranslationService(
    IHttpClientFactory httpClientFactory,
    ILogger<GoogleTranslationService> logger) : ITranslationService
{
    private const string BaseUrl = "https://translate.googleapis.com/translate_a/single";

    public async Task<string> TranslateAsync(string text, string sourceLanguage, string targetLanguage, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;

        var sl = sourceLanguage.ToLowerInvariant();
        var tl = targetLanguage.ToLowerInvariant();
        var encoded = Uri.EscapeDataString(text);
        var url = $"{BaseUrl}?client=gtx&sl={sl}&tl={tl}&dt=t&q={encoded}";

        var client = httpClientFactory.CreateClient("GoogleTranslate");
        client.Timeout = TimeSpan.FromSeconds(30);

        HttpResponseMessage response;
        try
        {
            response = await client.GetAsync(url, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "HTTP request failed when calling Google Translate.");
            throw;
        }

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            logger.LogError("Google Translate API error {StatusCode}: {Body}", (int)response.StatusCode, body);
            throw new HttpRequestException($"Google Translate returned {(int)response.StatusCode}");
        }

        var json = await response.Content.ReadAsStringAsync(ct);

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        var sb = new StringBuilder();
        foreach (var chunk in root[0].EnumerateArray())
        {
            if (chunk.ValueKind == JsonValueKind.Array &&
                chunk.GetArrayLength() > 0 &&
                chunk[0].ValueKind == JsonValueKind.String)
            {
                sb.Append(chunk[0].GetString());
            }
        }

        return sb.ToString();
    }
}
