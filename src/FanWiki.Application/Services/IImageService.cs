namespace FanWiki.Application.Services;

public interface IImageService
{
    Task<string?> UploadImageAsync(Stream fileStream, string fileName, string folder, CancellationToken ct = default);
}
