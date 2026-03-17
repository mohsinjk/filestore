using Product.Application.DTOs;

namespace Product.Application.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllProductsAsync();
    Task<ProductDto?> GetProductByIdAsync(Guid id);
    Task<ProductDto> CreateProductAsync(CreateProductDto createDto);
    Task<ProductDto?> UpdateProductAsync(Guid id, UpdateProductDto updateDto);
    Task<bool> DeleteProductAsync(Guid id);
}
