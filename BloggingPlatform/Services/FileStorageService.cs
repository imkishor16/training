using Azure.Identity;
using Azure.Security.KeyVault.Secrets;
using Azure.Storage.Blobs;

namespace BloggingPlatform.Services
{
    public class FileStorageService
    {
        private  BlobContainerClient _containerClinet;
        private readonly IConfiguration _configuration;

        public FileStorageService(IConfiguration configuration)
        {
            _configuration = configuration;
            
        }

        private async Task UpdateContainerClient()
        {
            var blobUrl = _configuration["AzureKeyVault:KeyVaultUrl"];
                if (string.IsNullOrWhiteSpace(blobUrl))
        throw new Exception("KeyVaultUrl  missing in configuration.");

            SecretClient secretClient = new SecretClient(new Uri(blobUrl), new DefaultAzureCredential());
            KeyVaultSecret secret = await secretClient.GetSecretAsync("ContainerSasUrl");
            var blobUrlValue = secret.Value;

            _containerClinet = new BlobContainerClient(new Uri(blobUrlValue));
        }

        public async Task UploadFile(Stream fileStream,string fileName)
        {
            await UpdateContainerClient();
            var blobClient = _containerClinet.GetBlobClient(fileName);
            await blobClient.UploadAsync(fileStream,overwrite:true);
        }

        public async Task<Stream> DownloadFile(string fileName)
        {
            await UpdateContainerClient();
            var blobClient = _containerClinet?.GetBlobClient(fileName);
            if(await blobClient.ExistsAsync())
            {
                var downloadInfor = await blobClient.DownloadStreamingAsync();
                return downloadInfor.Value.Content;
            }
            return null;
        }
    }
}