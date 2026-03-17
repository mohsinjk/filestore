using Product.Domain.Entities;

namespace Product.Infrastructure.Data;

public static class TestData
{
    public static List<Product.Domain.Entities.Product> GetInitialProducts()
    {
        return new List<Product.Domain.Entities.Product>
        {
            Product.Domain.Entities.Product.Create("Laptop Pro 15", "High-performance laptop with 16GB RAM and 512GB SSD", 1299.99m, 15),
            Product.Domain.Entities.Product.Create("Wireless Mouse", "Ergonomic wireless mouse with long battery life", 29.99m, 50),
            Product.Domain.Entities.Product.Create("Mechanical Keyboard", "RGB backlit mechanical keyboard with Cherry MX switches", 149.99m, 25),
            Product.Domain.Entities.Product.Create("USB-C Hub", "7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader", 49.99m, 30),
            Product.Domain.Entities.Product.Create("Monitor Stand", "Adjustable dual monitor stand with cable management", 79.99m, 20)
        };
    }
}
