using Product.Application.DTOs;
using Product.Application.Interfaces;
using Product.Domain.Interfaces;

namespace Product.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repository;

    public ProductService(IProductRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
    {
        var products = await _repository.GetAllAsync();
        return products.Select(p => MapToDto(p));
    }

    public async Task<ProductDto?> GetProductByIdAsync(Guid id)
    {
        var product = await _repository.GetByIdAsync(id);
        return product != null ? MapToDto(product) : null;
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto createDto)
    {
        var product = Product.Domain.Entities.Product.Create(
            createDto.Name,
            createDto.Description,
            createDto.Price,
            createDto.InitialStock);

        var createdProduct = await _repository.CreateAsync(product);
        return MapToDto(createdProduct);
    }

    public async Task<ProductDto?> UpdateProductAsync(Guid id, UpdateProductDto updateDto)
    {
        var existingProduct = await _repository.GetByIdAsync(id);
        if (existingProduct == null)
        {
            return null;
        }

        existingProduct.UpdateDetails(updateDto.Name, updateDto.Description, updateDto.Price);

        var updatedProduct = await _repository.UpdateAsync(existingProduct);
        return MapToDto(updatedProduct);
    }

    public async Task<bool> DeleteProductAsync(Guid id)
    {
        return await _repository.DeleteAsync(id);
    }

    private static ProductDto MapToDto(Product.Domain.Entities.Product product)
    {
        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            StockQuantity = product.StockQuantity,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt
        };
    }
}
