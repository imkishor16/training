using BankingAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BankingAPI.Interfaces
{
    public interface ICustomerService
    {
        Task<Customer> CreateCustomerAsync(string fullName, string email);
        Task<Customer?> GetCustomerByIdAsync(int customerId);
        Task<IEnumerable<Customer>> GetAllCustomersAsync();
    }

    
}
