using FileStorage.Application.Interfaces;
using FileStorage.Application.Services;
using FileStorage.Domain.Interfaces;
using FileStorage.Infrastructure.Configuration;
using FileStorage.Infrastructure.Repositories;
using FileStorage.Infrastructure.Storage;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // Automatic 400 responses for model validation errors
        options.SuppressModelStateInvalidFilter = false;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo
    {
        Title = "Product API",
        Version = "v1",
        Description = "A REST API for managing products using Clean Architecture"
    });
});

// FileStorage: configuration
builder.Services.Configure<FirestoreOptions>(
    builder.Configuration.GetSection("FileStorage:Firestore"));
builder.Services.Configure<GcsOptions>(
    builder.Configuration.GetSection("FileStorage:Gcs"));

// FileStorage: infrastructure
builder.Services.AddScoped<IFileRepository, FirestoreFileRepository>();
builder.Services.AddScoped<IFileStorageService, GcsFileStorageService>();
builder.Services.AddScoped<IFileService, FileService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Product API V1");
    c.RoutePrefix = "swagger"; // Swagger UI will be available at /swagger
});

app.UseHttpsRedirection();

// Enable CORS
app.UseCors();

app.UseAuthorization();
app.MapControllers();

app.Run();
