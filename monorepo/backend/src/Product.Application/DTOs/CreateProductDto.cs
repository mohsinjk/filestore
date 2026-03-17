using System.ComponentModel.DataAnnotations;

namespace Product.Application.DTOs;

public class CreateProductDto
{
    [Required(ErrorMessage = "Product name is required.")]
    [MinLength(3, ErrorMessage = "Product name must be at least 3 characters.")]
    [MaxLength(100, ErrorMessage = "Product name cannot exceed 100 characters.")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
    public string Description { get; set; } = string.Empty;

    [Range(10, double.MaxValue, ErrorMessage = "Price must be at least 10.")]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Initial stock cannot be negative.")]
    public int InitialStock { get; set; } = 10;
}
