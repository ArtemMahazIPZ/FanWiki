using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using FanWiki.Application.Services;

namespace FanWiki.API.Services;

public class CloudinaryImageService : IImageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryImageService()
    {
        var cloudName = Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME");
        var apiKey = Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY");
        var apiSecret = Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET");

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<string?> UploadImageAsync(Stream fileStream, string fileName, string folder, CancellationToken ct = default)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, fileStream),
            Folder = $"fanwiki/{folder}",
            PublicId = $"{Guid.NewGuid()}",
        };

        var result = await _cloudinary.UploadAsync(uploadParams, ct);

        if (result.StatusCode != System.Net.HttpStatusCode.OK)
            return null;

        return result.SecureUrl.ToString();
    }
}
