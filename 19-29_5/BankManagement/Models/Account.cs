using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BankManagement.Models
{


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

}
