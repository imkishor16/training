using BloggingPlatform.Interfaces;
using BloggingPlatform.Contexts;

namespace BloggingPlatform.Repositories
{
    public  abstract class Repository<K, T> : IRepository<K, T> where T:class
    {
        protected readonly BloggingPlatformContext _Context;

        public Repository(BloggingPlatformContext Context)
        {
            _Context = Context;
        }
        public async Task<T> Add(T item)
        {
            _Context.Add(item);
            await _Context.SaveChangesAsync();
            return item;
        }

        public async Task<T> Delete(K key)
        {
            var item = await Get(key);
            if (item != null)
            {
                _Context.Remove(item);
                await _Context.SaveChangesAsync();
                return item;
            }
            throw new Exception("No such item found for deleting");
        }

        public abstract Task<T> Get(K key);


        public abstract Task<IEnumerable<T>> GetAll();


        public async Task<T> Update(K key, T item)
        {
            var myItem = await Get(key);
            if (myItem != null)
            {
                _Context.Entry(myItem).CurrentValues.SetValues(item);
                // _Context.Entry(myItem).Property("IsDeleted").IsModified = false;

                await _Context.SaveChangesAsync();
                return item;
            }
            throw new Exception("No such item found for updation");
        }
    }
}
