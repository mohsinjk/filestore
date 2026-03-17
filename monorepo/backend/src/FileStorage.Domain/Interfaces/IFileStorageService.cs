namespace FileStorage.Domain.Interfaces;

public interface IFileStorageService
{
    Task<string> UploadAsync(
        Stream content,
        string storagePath,
        string contentType,
        CancellationToken cancellationToken = default);

    Task DownloadAsync(
        string storagePath,
        Stream destination,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        string storagePath,
        CancellationToken cancellationToken = default);
}
