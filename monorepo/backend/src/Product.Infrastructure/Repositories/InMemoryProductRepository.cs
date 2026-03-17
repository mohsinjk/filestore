using Product.Domain.Interfaces;
using Product.Domain.Entities;
using Product.Infrastructure.Data;

namespace Product.Infrastructure.Repositories;

public class InMemoryProductRepository : IProductRepository
{
    private static readonly List<Product.Domain.Entities.Product> _products = new(TestData.GetInitialProducts());

    public Task<IEnumerable<Product.Domain.Entities.Product>> GetAllAsync()
    {
        return Task.FromResult<IEnumerable<Product.Domain.Entities.Product>>(_products);
    }

    public Task<Product.Domain.Entities.Product?> GetByIdAsync(Guid id)
    {
        var product = _products.FirstOrDefault(p => p.Id == id);
        return Task.FromResult(product);
    }

    public Task<Product.Domain.Entities.Product> CreateAsync(Product.Domain.Entities.Product product)
    {
        _products.Add(product);
        return Task.FromResult(product);
    }

    public Task<Product.Domain.Entities.Product> UpdateAsync(Product.Domain.Entities.Product product)
    {
        var existingProduct = _products.FirstOrDefault(p => p.Id == product.Id);
        if (existingProduct != null)
        {
            var index = _products.IndexOf(existingProduct);
            _products[index] = product;
        }
        return Task.FromResult(product);
    }

    public Task<bool> DeleteAsync(Guid id)
    {
        var product = _products.FirstOrDefault(p => p.Id == id);
        if (product != null)
        {
            _products.Remove(product);
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }
}
