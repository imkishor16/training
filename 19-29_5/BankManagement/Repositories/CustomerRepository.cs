using BankManagementSystem.Contexts;
using BankManagementSystem.Models;
using Microsoft.EntityFrameworkCore;


namespace BankManagement.Repositories
{

    public class CustomerRepository : Repository<int, Customer>
    {
        public CustomerRepository(BankContext bankContext) : base(bankContext)
        {
        }

        public override async Task<Customer> Get(int key)
        {
            var customer = await _bankContext.Customers.SingleOrDefaultAsync(a => a.Id == key);
            return customer ?? throw new Exception($"No customer with given ID {key}");
        }

        public override async Task<IEnumerable<Customer>> GetAll()
        {
            var customers = _bankContext.Customers;
            if (customers.Count() == 0)
            {
                throw new Exception("No customers in the database");
            }
            return await customers.ToListAsync();
        }

    }
}