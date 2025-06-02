using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BankManagement.Models
{
    public class Customer
    {
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        public ICollection<Account> Accounts { get; set; } = new List<Account>();
    }

    public class Account
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string AccountNumber { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Balance { get; set; }

        public AccountType AccountType { get; set; }

        [ForeignKey("Customer")]
        public int CustomerId { get; set; }

        public Customer? Customer { get; set; }

        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }

    public enum AccountType
    {
        Savings,
        Checking
    }

    public class Transaction
    {
        public int Id { get; set; }

        [Required]
        public TransactionType Type { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Source Account (always present)
        public int AccountId { get; set; }

        public Account? Account { get; set; }

        // For transfers
        public int? TargetAccountId { get; set; }

        public Account? TargetAccount { get; set; }
    }

    public enum TransactionType
    {
        Deposit,
        Withdraw,
        Transfer
    }
}
