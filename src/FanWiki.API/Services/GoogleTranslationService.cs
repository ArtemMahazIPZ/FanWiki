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
    private const int MaxChunkSize = 4000;

    public async Task<string> TranslateAsync(string text, string sourceLanguage, string targetLanguage, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;

        if (text.Length <= MaxChunkSize)
            return await TranslateSingleAsync(text, sourceLanguage, targetLanguage, ct);

        var chunks = SplitIntoChunks(text, MaxChunkSize);
        var results = new List<string>(chunks.Count);
        foreach (var chunk in chunks)
            results.Add(await TranslateSingleAsync(chunk, sourceLanguage, targetLanguage, ct));

        return string.Concat(results);
    }

    private async Task<string> TranslateSingleAsync(string text, string sl, string tl, CancellationToken ct)
    {
        var client = httpClientFactory.CreateClient("GoogleTranslate");
        var url = $"{BaseUrl}?client=gtx&sl={sl.ToLowerInvariant()}&tl={tl.ToLowerInvariant()}&dt=t";

        using var formContent = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("q", text)
        ]);

        HttpResponseMessage response;
        try
        {
            response = await client.PostAsync(url, formContent, ct);
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
            throw new HttpRequestException(
                $"Google Translate returned {(int)response.StatusCode}",
                null,
                response.StatusCode);
        }

        var json = await response.Content.ReadAsStringAsync(ct);

        try
        {
            using var doc = JsonDocument.Parse(json);
            var sb = new StringBuilder();
            foreach (var chunk in doc.RootElement[0].EnumerateArray())
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
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to parse Google Translate response: {Json}", json[..Math.Min(500, json.Length)]);
            throw new InvalidOperationException("Unexpected response format from Google Translate.", ex);
        }
    }

    private static List<string> SplitIntoChunks(string text, int maxSize)
    {
        var chunks = new List<string>();
        var start = 0;

        while (start < text.Length)
        {
            if (start + maxSize >= text.Length)
            {
                chunks.Add(text[start..]);
                break;
            }

            // Try to split at a paragraph or sentence boundary near the limit
            var end = start + maxSize;
            var splitAt = -1;

            for (var i = end; i > start + maxSize / 2; i--)
            {
                var c = text[i];
                if (c == '\n' || c == '.' || c == '!' || c == '?')
                {
                    splitAt = i + 1;
                    break;
                }
            }

            if (splitAt < 0)
            {
                // Fall back to splitting at a space
                for (var i = end; i > start + maxSize / 2; i--)
                {
                    if (text[i] == ' ')
                    {
                        splitAt = i + 1;
                        break;
                    }
                }
            }

            if (splitAt < 0)
                splitAt = end;

            chunks.Add(text[start..splitAt]);
            start = splitAt;
        }

        return chunks;
    }
}
