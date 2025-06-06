using BankingAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BankingAPI.Interfaces
{
    

    public interface IAccountService
    {
        Task<Account> CreateAccountAsync(int customerId, string accountNumber, string accountType);
        Task<Account?> GetAccountByIdAsync(int accountId);
        Task<IEnumerable<Account>> GetAccountsByCustomerIdAsync(int customerId);
        Task<IEnumerable<Account>> GetAllAccountsAsync();
    }

   
}
