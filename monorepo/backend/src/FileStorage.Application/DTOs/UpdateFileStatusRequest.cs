namespace FileStorage.Application.DTOs;

public sealed class UpdateFileStatusRequest
{
    [System.ComponentModel.DataAnnotations.Required]
    public string Status { get; init; } = string.Empty;
}
