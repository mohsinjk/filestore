namespace Product.Domain.Interfaces;

public interface IProductRepository
{
    Task<IEnumerable<Entities.Product>> GetAllAsync();
    Task<Entities.Product?> GetByIdAsync(Guid id);
    Task<Entities.Product> CreateAsync(Entities.Product product);
    Task<Entities.Product> UpdateAsync(Entities.Product product);
    Task<bool> DeleteAsync(Guid id);
}
