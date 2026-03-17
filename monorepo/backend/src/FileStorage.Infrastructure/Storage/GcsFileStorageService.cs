using FileStorage.Domain.Interfaces;
using FileStorage.Infrastructure.Configuration;
using Google.Cloud.Storage.V1;
using Microsoft.Extensions.Options;

namespace FileStorage.Infrastructure.Storage;

public sealed class GcsFileStorageService : IFileStorageService
{
    private readonly StorageClient _storageClient;
    private readonly string _bucketName;

    public GcsFileStorageService(IOptions<GcsOptions> options)
    {
        _bucketName = options.Value.BucketName;
        _storageClient = StorageClient.Create();
    }

    public async Task<string> UploadAsync(
        Stream content,
        string storagePath,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        await _storageClient.UploadObjectAsync(
            _bucketName,
            storagePath,
            contentType,
            content,
            cancellationToken: cancellationToken);

        return storagePath;
    }

    public async Task DownloadAsync(
        string storagePath,
        Stream destination,
        CancellationToken cancellationToken = default)
    {
        await _storageClient.DownloadObjectAsync(
            _bucketName,
            storagePath,
            destination,
            cancellationToken: cancellationToken);
    }

    public async Task DeleteAsync(
        string storagePath,
        CancellationToken cancellationToken = default)
    {
        await _storageClient.DeleteObjectAsync(
            _bucketName,
            storagePath,
            cancellationToken: cancellationToken);
    }
}
