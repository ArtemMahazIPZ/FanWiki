namespace FanWiki.Application.DTOs;

public record TranslateRequestDto(string Text, string SourceLang = "UK", string TargetLang = "EN");
public record TranslateResponseDto(string TranslatedText);

public record TranslateBatchRequestDto(
    string Title,
    string Quote,
    string Content,
    string SourceLang = "UK",
    string TargetLang = "EN"
);

public record TranslateBatchResponseDto(string Title, string Quote, string Content);
