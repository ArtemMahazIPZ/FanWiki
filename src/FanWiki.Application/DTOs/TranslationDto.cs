namespace FanWiki.Application.DTOs;

public record TranslateRequestDto(string Text, string SourceLang = "uk", string TargetLang = "en");
public record TranslateResponseDto(string TranslatedText);

public record TranslateBatchRequestDto(
    string Title,
    string Quote,
    string Content,
    string? VoiceActor,
    string? BirthPlace,
    string? BirthDate,
    string? CauseOfDeath,
    string[]? FamilyNames,
    string[]? AlliesNames,
    string[]? EnemiesNames,
    string[]? AlsoKnownAs,
    string SourceLang = "uk",
    string TargetLang = "en"
);

public record TranslateBatchResponseDto(
    string Title,
    string Quote,
    string Content,
    string? VoiceActor,
    string? BirthPlace,
    string? BirthDate,
    string? CauseOfDeath,
    string[] FamilyNames,
    string[] AlliesNames,
    string[] EnemiesNames,
    string[] AlsoKnownAs
);
