using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
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
    private const string Endpoint = "https://api-free.deepl.com/v2/translate";

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public async Task<string> TranslateAsync(
        string text,
        string sourceLanguage,
        string targetLanguage,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;

        var apiKey = configuration["DeepL:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException(
                "DeepL API key is not configured. Set the 'DeepL__ApiKey' environment variable.");

        var isHtml = text.TrimStart().StartsWith('<');

        var payload = new DeepLRequest(
            Text:        [text],
            SourceLang:  sourceLanguage.ToUpperInvariant(),
            TargetLang:  MapTargetLang(targetLanguage),
            TagHandling: isHtml ? "html" : null
        );

        var client = httpClientFactory.CreateClient("DeepL");

        using var request = new HttpRequestMessage(HttpMethod.Post, Endpoint);
        request.Headers.TryAddWithoutValidation("Authorization", $"DeepL-Auth-Key {apiKey}");
        request.Content = JsonContent.Create(payload, options: JsonOpts);

        HttpResponseMessage response;
        try
        {
            response = await client.SendAsync(request, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "HTTP request to DeepL failed.");
            throw;
        }

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            logger.LogError("DeepL API error {StatusCode}: {Body}", (int)response.StatusCode, body);
            throw new HttpRequestException(
                $"DeepL returned {(int)response.StatusCode}: {body}",
                null,
                response.StatusCode);
        }

        var result = await response.Content.ReadFromJsonAsync<DeepLResponse>(cancellationToken: ct);

        return result?.Translations?.FirstOrDefault()?.Text
            ?? throw new InvalidOperationException("DeepL returned an empty translation result.");
    }

    // DeepL requires "EN-US" or "EN-GB" as a target language; "EN" still works
    // for Free tier but EN-US is explicit and future-proof.
    private static string MapTargetLang(string lang) =>
        lang.ToLowerInvariant() == "en" ? "EN-US" : lang.ToUpperInvariant();

    // ── DTOs ─────────────────────────────────────────────────────────────────

    private record DeepLRequest(
        [property: JsonPropertyName("text")]
        string[] Text,

        [property: JsonPropertyName("source_lang")]
        string SourceLang,

        [property: JsonPropertyName("target_lang")]
        string TargetLang,

        [property: JsonPropertyName("tag_handling")]
        [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        string? TagHandling
    );

    private record DeepLResponse(
        [property: JsonPropertyName("translations")]
        DeepLTranslation[]? Translations
    );

    private record DeepLTranslation(
        [property: JsonPropertyName("text")]
        string? Text
    );
}
