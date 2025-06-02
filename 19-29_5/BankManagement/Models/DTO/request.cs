namespace BankManagement.DTOs
{
    public class CreateCustomerRequest
    {
        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;
    }

    public class CreateAccountRequest
    {
        public int CustomerId { get; set; }

        public string AccountNumber { get; set; } = string.Empty;

        public string AccountType { get; set; } = "Savings"; // Savings /checking
    }

    public class DepositRequest
    {
        public int AccountId { get; set; }

        public decimal Amount { get; set; }
    }

    public class WithdrawRequest
    {
        public int AccountId { get; set; }

        public decimal Amount { get; set; }
    }

    public class TransferRequest
    {
        public int FromAccountId { get; set; }

        public int ToAccountId { get; set; }

        public decimal Amount { get; set; }
    }
}
