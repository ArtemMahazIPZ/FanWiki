FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["FanWiki.sln", "./"]
COPY ["src/FanWiki.API/FanWiki.API.csproj", "src/FanWiki.API/"]
COPY ["src/FanWiki.Application/FanWiki.Application.csproj", "src/FanWiki.Application/"]
COPY ["src/FanWiki.Domain/FanWiki.Domain.csproj", "src/FanWiki.Domain/"]
COPY ["src/FanWiki.Infrastructure/FanWiki.Infrastructure.csproj", "src/FanWiki.Infrastructure/"]

RUN dotnet restore "FanWiki.sln"

COPY . .
WORKDIR "/src/src/FanWiki.API"
RUN dotnet publish "FanWiki.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "FanWiki.API.dll"]
