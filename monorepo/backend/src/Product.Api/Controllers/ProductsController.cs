using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Product.Application.DTOs;
using Product.Application.Interfaces;

namespace Product.Api.Controllers;

/// <summary>
/// Controller for managing product operations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(IProductService productService, ILogger<ProductsController> logger)
    {
        _productService = productService;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves all products.
    /// </summary>
    /// <returns>A list of products.</returns>
    /// <response code="200">Returns the list of products.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ProductDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAllProducts()
    {
        try
        {
            _logger.LogInformation("Retrieving all products.");
            var products = await _productService.GetAllProductsAsync();
            return Ok(products);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while retrieving all products.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = "An internal server error occurred." });
        }
    }

    /// <summary>
    /// Retrieves a product by its ID.
    /// </summary>
    /// <param name="id">The product ID.</param>
    /// <returns>The product with the specified ID.</returns>
    /// <response code="200">Returns the product.</response>
    /// <response code="404">If the product is not found.</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductDto>> GetProductById(Guid id)
    {
        try
        {
            _logger.LogInformation("Retrieving product with ID: {Id}", id);
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
            {
                _logger.LogWarning("Product with ID: {Id} not found.", id);
                return NotFound(new { error = $"Product with ID {id} not found." });
            }
            return Ok(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while retrieving product with ID: {Id}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = "An internal server error occurred." });
        }
    }

    /// <summary>
    /// Creates a new product.
    /// </summary>
    /// <param name="createDto">The product creation data.</param>
    /// <returns>The created product.</returns>
    /// <response code="201">Returns the newly created product.</response>
    /// <response code="400">If the input data is invalid.</response>
    [HttpPost]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto createDto)
    {
        try
        {
            if (createDto == null)
            {
                _logger.LogWarning("Create product request body is null.");
                return BadRequest(new { error = "Request body cannot be null." });
            }

            _logger.LogInformation("Creating a new product: {ProductName}", createDto.Name);
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for product creation.");
                return BadRequest(ModelState);
            }

            var product = await _productService.CreateProductAsync(createDto);
            return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, product);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error while creating product.");
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Business rule violation while creating product.");
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while creating a product.");
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = "An internal server error occurred." });
        }
    }

    /// <summary>
    /// Updates an existing product.
    /// </summary>
    /// <param name="id">The product ID.</param>
    /// <param name="updateDto">The product update data.</param>
    /// <returns>The updated product.</returns>
    /// <response code="200">Returns the updated product.</response>
    /// <response code="400">If the input data is invalid.</response>
    /// <response code="404">If the product is not found.</response>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductDto>> UpdateProduct(Guid id, [FromBody] UpdateProductDto updateDto)
    {
        try
        {
            _logger.LogInformation("Updating product with ID: {Id}", id);
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for product update.");
                return BadRequest(ModelState);
            }

            var product = await _productService.UpdateProductAsync(id, updateDto);
            if (product == null)
            {
                _logger.LogWarning("Product with ID: {Id} not found for update.", id);
                return NotFound(new { error = $"Product with ID {id} not found." });
            }
            return Ok(product);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error while updating product with ID: {Id}", id);
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Business rule violation while updating product with ID: {Id}", id);
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while updating product with ID: {Id}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = "An internal server error occurred." });
        }
    }

    /// <summary>
    /// Deletes a product by its ID.
    /// </summary>
    /// <param name="id">The product ID.</param>
    /// <returns>No content.</returns>
    /// <response code="204">If the product was deleted successfully.</response>
    /// <response code="404">If the product is not found.</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        try
        {
            _logger.LogInformation("Deleting product with ID: {Id}", id);
            var deleted = await _productService.DeleteProductAsync(id);
            if (!deleted)
            {
                _logger.LogWarning("Product with ID: {Id} not found for deletion.", id);
                return NotFound(new { error = $"Product with ID {id} not found." });
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while deleting product with ID: {Id}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = "An internal server error occurred." });
        }
    }
}
