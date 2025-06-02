using BankingAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BankingAPI.Interfaces
{
   

    public interface ITransactionService
    {
        Task<Transaction> DepositAsync(int accountId, decimal amount);
        Task<Transaction> WithdrawAsync(int accountId, decimal amount);
        Task<Transaction> TransferAsync(int fromAccountId, int toAccountId, decimal amount);
        Task<IEnumerable<Transaction>> GetTransactionsByAccountIdAsync(int accountId);
    }
}
