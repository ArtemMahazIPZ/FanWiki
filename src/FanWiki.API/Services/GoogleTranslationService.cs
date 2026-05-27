using System.Text;
using System.Text.Json;
using FanWiki.Application.Services;
using Microsoft.Extensions.Logging;

namespace FanWiki.API.Services;

public class GoogleTranslationService(
    IHttpClientFactory httpClientFactory,
    ILogger<GoogleTranslationService> logger) : ITranslationService
{
    private const string TranslateUrl = "https://translate.googleapis.com/translate_a/single";
    private const string BatchExecuteUrl = "https://translate.google.com/_/TranslateWebserverUi/data/batchexecute";
    private const int MaxChunkSize = 4000;
    private const int MaxHtmlChunkSize = 3000;

    public async Task<string> TranslateAsync(string text, string sourceLanguage, string targetLanguage, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;

        if (LooksLikeHtml(text))
            return await TranslateHtmlChunkedAsync(text, sourceLanguage, targetLanguage, ct);

        if (text.Length <= MaxChunkSize)
            return await TranslatePlainSingleAsync(text, sourceLanguage, targetLanguage, ct);

        var chunks = SplitIntoChunks(text, MaxChunkSize);
        var results = new List<string>(chunks.Count);
        foreach (var chunk in chunks)
            results.Add(await TranslatePlainSingleAsync(chunk, sourceLanguage, targetLanguage, ct));
        return string.Concat(results);
    }

    // ── HTML translation via batchexecute (rpcid: MkM2Zd) ────────────────────

    private static bool LooksLikeHtml(string text) =>
        text.TrimStart().StartsWith('<');

    private async Task<string> TranslateHtmlChunkedAsync(string html, string sl, string tl, CancellationToken ct)
    {
        if (html.Length <= MaxHtmlChunkSize)
            return await TranslateHtmlSingleAsync(html, sl, tl, ct);

        var chunks = SplitHtmlAtBlockBoundaries(html, MaxHtmlChunkSize);
        var results = new List<string>(chunks.Count);
        foreach (var chunk in chunks)
            results.Add(await TranslateHtmlSingleAsync(chunk, sl, tl, ct));
        return string.Concat(results);
    }

    private async Task<string> TranslateHtmlSingleAsync(string html, string sl, string tl, CancellationToken ct)
    {
        var client = httpClientFactory.CreateClient("GoogleTranslate");

        // f.req: [[["MkM2Zd","[[\"html\",\"sl\",\"tl\"]]",null,"generic"]]]
        var innerPayload = JsonSerializer.Serialize(new[] { new object[] { html, sl, tl } });
        var fReq = JsonSerializer.Serialize(
            new[] { new[] { new object?[] { "MkM2Zd", innerPayload, null, "generic" } } });

        using var formContent = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("f.req", fReq)
        ]);

        HttpResponseMessage response;
        try
        {
            response = await client.PostAsync(
                $"{BatchExecuteUrl}?rpcids=MkM2Zd&source-path=%2F&bl=boq_translate-webserver_20241201.00_p0&soc-app=1&soc-platform=1&soc-device=1&rt=c",
                formContent, ct);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "batchexecute request failed; falling back to plain-text translate.");
            return await TranslatePlainSingleAsync(html, sl, tl, ct);
        }

        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("batchexecute returned {Status}; falling back to plain-text translate.", (int)response.StatusCode);
            return await TranslatePlainSingleAsync(html, sl, tl, ct);
        }

        var raw = await response.Content.ReadAsStringAsync(ct);
        try
        {
            return ParseBatchExecuteResponse(raw);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to parse batchexecute response; falling back to plain-text translate. Raw: {Raw}",
                raw[..Math.Min(300, raw.Length)]);
            return await TranslatePlainSingleAsync(html, sl, tl, ct);
        }
    }

    private static string ParseBatchExecuteResponse(string raw)
    {
        // Response starts with ")]}'" followed by newlines, then a JSON array.
        var jsonStart = raw.IndexOf('[');
        if (jsonStart < 0) throw new InvalidOperationException("No JSON array found in batchexecute response.");

        using var doc = JsonDocument.Parse(raw[jsonStart..]);

        // Structure: [[["wrb.fr","MkM2Zd","<inner_json>",...]],...]
        var innerJsonStr = doc.RootElement[0][0][2].GetString()
            ?? throw new InvalidOperationException("Missing inner JSON in batchexecute response.");

        using var inner = JsonDocument.Parse(innerJsonStr);
        // Inner: [["<translated_html>","sl","tl",null,[...]]]
        return inner.RootElement[0][0].GetString()
            ?? throw new InvalidOperationException("Missing translated HTML in batchexecute inner response.");
    }

    // ── Plain-text translation ────────────────────────────────────────────────

    private async Task<string> TranslatePlainSingleAsync(string text, string sl, string tl, CancellationToken ct)
    {
        var client = httpClientFactory.CreateClient("GoogleTranslate");
        var url = $"{TranslateUrl}?client=gtx&sl={sl.ToLowerInvariant()}&tl={tl.ToLowerInvariant()}&dt=t";

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
                $"Google Translate returned {(int)response.StatusCode}", null, response.StatusCode);
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

    // ── Chunking helpers ──────────────────────────────────────────────────────

    private static List<string> SplitHtmlAtBlockBoundaries(string html, int maxSize)
    {
        var blockEndTags = new[] { "</p>", "</h1>", "</h2>", "</h3>", "</h4>", "</li>", "</blockquote>", "</div>" };
        var chunks = new List<string>();
        var start = 0;

        while (start < html.Length)
        {
            if (start + maxSize >= html.Length)
            {
                chunks.Add(html[start..]);
                break;
            }

            var end = start + maxSize;
            var bestSplit = -1;

            foreach (var tag in blockEndTags)
            {
                var idx = html.LastIndexOf(tag, end, end - start, StringComparison.OrdinalIgnoreCase);
                if (idx > start)
                {
                    var splitPos = idx + tag.Length;
                    if (splitPos > bestSplit) bestSplit = splitPos;
                }
            }

            if (bestSplit <= start) bestSplit = end;

            chunks.Add(html[start..bestSplit]);
            start = bestSplit;
        }

        return chunks;
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
                for (var i = end; i > start + maxSize / 2; i--)
                {
                    if (text[i] == ' ')
                    {
                        splitAt = i + 1;
                        break;
                    }
                }
            }

            if (splitAt < 0) splitAt = end;

            chunks.Add(text[start..splitAt]);
            start = splitAt;
        }

        return chunks;
    }
}
