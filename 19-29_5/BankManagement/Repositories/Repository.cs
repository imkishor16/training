using BankingAPI.Contexts;
using BankingAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BankingAPI.Repositories
{
    public abstract class Repository<K, T> : IRepository<K, T> where T : class
    {
        protected readonly BankingContext _context;

        public Repository(BankingContext context)
        {
            _context = context;
        }

        public async Task<T> Add(T item)
        {
            _context.Add(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<T> Delete(K key)
        {
            var item = await Get(key);
            if (item != null)
            {
                _context.Remove(item);
                await _context.SaveChangesAsync();
                return item;
            }
            throw new Exception("No such item found for deletion");
        }

        public abstract Task<T> Get(K key);

        public abstract Task<IEnumerable<T>> GetAll();

        public async Task<T> Update(K key, T item)
        {
            var existingItem = await Get(key);
            if (existingItem != null)
            {
                _context.Entry(existingItem).CurrentValues.SetValues(item);
                await _context.SaveChangesAsync();
                return item;
            }
            throw new Exception("No such item found for update");
        }
    }
}
