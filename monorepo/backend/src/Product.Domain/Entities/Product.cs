namespace Product.Domain.Entities;

/// <summary>
/// Product Aggregate Root - manages product information, pricing, and inventory.
/// Independent aggregate from Order - referenced by ID in OrderItem.
/// Represents a transactional boundary for product-related operations.
/// </summary>
public class Product
{
    // Private constructor to enforce factory method usage
    private Product()
    {
    }

    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;

    public decimal Price { get; private set; }
    public int StockQuantity { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; }

    // Factory method to create new Product with validation
    public static Product Create(string name, string description, decimal price, int initialStock = 10)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Product name is required.");

        return new Product
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description ?? string.Empty,
            Price = price >= 10 ? price : throw new ArgumentException("Price must be at least 10."),
            StockQuantity = Math.Max(0, initialStock),
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };
    }

    // Business logic method to update product details
    public void UpdateDetails(string name, string description, decimal price)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Product name is required.");

        Name = name;
        Description = description ?? string.Empty;
        Price = price;
    }

    // Inventory management business rules
    public void AddStock(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be positive.", nameof(quantity));

        StockQuantity += quantity;
    }

    public void ReduceStock(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be positive.", nameof(quantity));

        if (StockQuantity < quantity)
            throw new InvalidOperationException($"Insufficient stock. Available: {StockQuantity}, Requested: {quantity}");

        StockQuantity -= quantity;
    }

    public bool HasSufficientStock(int requiredQuantity)
    {
        return StockQuantity >= requiredQuantity;
    }

    public bool IsInStock() => StockQuantity > 0;

    public bool IsLowStock(int threshold = 10) => StockQuantity > 0 && StockQuantity <= threshold;

    // Product lifecycle management
    public void Deactivate()
    {
        if (!IsActive)
            throw new InvalidOperationException("Product is already inactive.");

        IsActive = false;
    }

    public void Activate()
    {
        if (IsActive)
            throw new InvalidOperationException("Product is already active.");

        IsActive = true;
    }

    public void ApplyDiscount(decimal discountPercentage)
    {
        if (discountPercentage < 0 || discountPercentage > 50)
            throw new ArgumentException("Discount must be between 0% and 50%.", nameof(discountPercentage));

        var discountedPrice = Price * (1 - discountPercentage / 100);

        if (discountedPrice < 10)
            throw new InvalidOperationException("Discounted price cannot fall below minimum threshold of 10.");

        Price = discountedPrice;
    }
}
