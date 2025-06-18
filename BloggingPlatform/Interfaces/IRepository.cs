using System.Collections.Generic;
using System.Threading.Tasks;

namespace BloggingPlatform.Interfaces
{
    public interface IRepository<K,T> where T : class
    {
        public Task<IEnumerable<T>> GetAll();
        Task<T> Get(K key);
        Task<T> Add(T entity);
        Task<T> Update(K key,T entity);
        Task<T> Delete(K key);
    }
}
