var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseCors();

var servers = new List<Server>
{
    new Server(1, "TrueNAS", "truenas", "192.168.1.10", "Online", 28, 61, 54, "23d 04h", DateTimeOffset.UtcNow),
    new Server(2, "Desktop", "desktop", "192.168.1.20", "Online", 42, 58, 71, "8d 12h", DateTimeOffset.UtcNow),
    new Server(3, "Raspberry Pi", "raspberrypi", "192.168.1.30", "Online", 19, 37, 48, "41d 02h", DateTimeOffset.UtcNow),
    new Server(4, "Notebook", "notebook", "192.168.1.40", "Offline", 0, 0, 0, "—", DateTimeOffset.UtcNow.AddMinutes(-18))
};

var services = new List<ServiceItem>
{
    new ServiceItem(1, "Nextcloud", "https://cloud.example.local", "Online", 23, 1),
    new ServiceItem(2, "Jellyfin", "https://media.example.local", "Online", 14, 1),
    new ServiceItem(3, "Immich", "https://photos.example.local", "Online", 31, 1),
    new ServiceItem(4, "Vaultwarden", "https://vault.example.local", "Online", 18, 2),
    new ServiceItem(5, "Grafana", "https://grafana.example.local", "Online", 11, 3),
    new ServiceItem(6, "Paperless", "https://docs.example.local", "Offline", 0, 2)
};

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", timestamp = DateTimeOffset.UtcNow }));

app.MapGet("/api/dashboard", () => Results.Ok(new
{
    serversOnline = servers.Count(s => s.Status == "Online"),
    serversTotal = servers.Count,
    servicesOnline = services.Count(s => s.Status == "Online"),
    servicesTotal = services.Count,
    averageCpu = Math.Round(servers.Where(s => s.Status == "Online").Average(s => s.CpuUsage)),
    averageMemory = Math.Round(servers.Where(s => s.Status == "Online").Average(s => s.MemoryUsage)),
    servers,
    services,
    alerts = new[]
    {
        new { id = 1, title = "Paperless está indisponível", detail = "Última verificação há 2 minutos", severity = "critical", time = "2 min" },
        new { id = 2, title = "Uso de armazenamento elevado", detail = "Desktop atingiu 71% de utilização", severity = "warning", time = "18 min" }
    }
}));

app.MapGet("/api/servers", () => Results.Ok(servers));
app.MapGet("/api/servers/{id:int}", (int id) => servers.FirstOrDefault(s => s.Id == id) is { } server ? Results.Ok(server) : Results.NotFound());
app.MapPost("/api/servers", (CreateServerRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.IpAddress))
        return Results.BadRequest(new { message = "Name and ipAddress are required." });

    var server = new Server(servers.Count == 0 ? 1 : servers.Max(s => s.Id) + 1,
        request.Name.Trim(), request.Hostname?.Trim() ?? request.Name.Trim().ToLowerInvariant().Replace(' ', '-'),
        request.IpAddress.Trim(), "Unknown", 0, 0, 0, "—", DateTimeOffset.UtcNow);
    servers.Add(server);
    return Results.Created($"/api/servers/{server.Id}", server);
});
app.MapPut("/api/servers/{id:int}", (int id, UpdateServerRequest request) =>
{
    var index = servers.FindIndex(s => s.Id == id);
    if (index < 0) return Results.NotFound();
    if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.IpAddress))
        return Results.BadRequest(new { message = "Name and ipAddress are required." });

    var current = servers[index];
    servers[index] = current with { Name = request.Name.Trim(), Hostname = request.Hostname?.Trim() ?? current.Hostname, IpAddress = request.IpAddress.Trim() };
    return Results.Ok(servers[index]);
});
app.MapDelete("/api/servers/{id:int}", (int id) => servers.RemoveAll(s => s.Id == id) > 0 ? Results.NoContent() : Results.NotFound());
app.MapGet("/api/services", () => Results.Ok(services));
app.MapGet("/api/services/{id:int}", (int id) => services.FirstOrDefault(s => s.Id == id) is { } service ? Results.Ok(service) : Results.NotFound());
app.MapPost("/api/services", (CreateServiceRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Url))
        return Results.BadRequest(new { message = "Name and url are required." });
    if (servers.All(s => s.Id != request.ServerId))
        return Results.BadRequest(new { message = "serverId does not reference an existing server." });

    var service = new ServiceItem(services.Count == 0 ? 1 : services.Max(s => s.Id) + 1, request.Name.Trim(), request.Url.Trim(), "Unknown", 0, request.ServerId);
    services.Add(service);
    return Results.Created($"/api/services/{service.Id}", service);
});
app.MapDelete("/api/services/{id:int}", (int id) => services.RemoveAll(s => s.Id == id) > 0 ? Results.NoContent() : Results.NotFound());

app.Run();

record Server(int Id, string Name, string Hostname, string IpAddress, string Status, int CpuUsage, int MemoryUsage, int DiskUsage, string Uptime, DateTimeOffset LastSeen);
record ServiceItem(int Id, string Name, string Url, string Status, int ResponseTime, int ServerId);
record CreateServerRequest(string Name, string IpAddress, string? Hostname);
record UpdateServerRequest(string Name, string IpAddress, string? Hostname);
record CreateServiceRequest(string Name, string Url, int ServerId);
