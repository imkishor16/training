using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BankManagement.Models
{
    public class Transaction
    {
        public int Id { get; set; }

        [Required]
        public TransactionType Type { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Source Account 
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
