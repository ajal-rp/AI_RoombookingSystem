# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY ["ConferenceRoomBooking.sln", "./"]

# Copy project files
COPY ["src/ConferenceRoomBooking.API/ConferenceRoomBooking.API.csproj", "src/ConferenceRoomBooking.API/"]
COPY ["src/ConferenceRoomBooking.Application/ConferenceRoomBooking.Application.csproj", "src/ConferenceRoomBooking.Application/"]
COPY ["src/ConferenceRoomBooking.Domain/ConferenceRoomBooking.Domain.csproj", "src/ConferenceRoomBooking.Domain/"]
COPY ["src/ConferenceRoomBooking.Infrastructure/ConferenceRoomBooking.Infrastructure.csproj", "src/ConferenceRoomBooking.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "ConferenceRoomBooking.sln"

# Copy all source code
COPY . .

# Build the application
WORKDIR "/src/src/ConferenceRoomBooking.API"
RUN dotnet build "ConferenceRoomBooking.API.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "ConferenceRoomBooking.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Copy published application
COPY --from=publish /app/publish .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Production

# Create directory for logs
RUN mkdir -p /app/logs

ENTRYPOINT ["dotnet", "ConferenceRoomBooking.API.dll"]
