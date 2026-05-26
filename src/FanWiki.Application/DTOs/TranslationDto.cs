namespace FanWiki.Application.DTOs;

public record TranslateRequestDto(string Text, string SourceLang = "UK", string TargetLang = "EN");
public record TranslateResponseDto(string TranslatedText);
