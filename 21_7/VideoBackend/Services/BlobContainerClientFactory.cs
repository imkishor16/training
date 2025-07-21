using Azure.Storage.Blobs;
using Microsoft.Extensions.Configuration;
using System;

namespace Services
{
    public static class BlobContainerClientFactory
    {
        public static BlobContainerClient Create(IConfiguration configuration)
        {
            var baseUrl = configuration["AzureBlobStorage:BaseUrl"];
            var containerName = configuration["AzureBlobStorage:ContainerName"];
            var sasToken = configuration["AzureBlobStorage:SasToken"];
            var blobUri = $"{baseUrl}/{containerName}?{sasToken}";
            return new BlobContainerClient(new Uri(blobUri));
        }
    }
} 