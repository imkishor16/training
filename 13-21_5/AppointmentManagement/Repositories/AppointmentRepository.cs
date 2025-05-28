using WholeApplication.Models;
using WholeApplication.Exceptions;

namespace WholeApplication.Repositories
{
    public class AppointmentRepository : Repository<int, Appointment>
    {
        protected override int GenerateID() => _items.Count == 0 ? 1 : _items.Max(a => a.Id) + 1;

        public override ICollection<Appointment> GetAll()
        {
            if (_items.Count == 0)
                throw new CollectionEmptyException("No appointments found");
            return _items;
        }

        public override Appointment GetById(int id)
        {
            var appointment = _items.FirstOrDefault(a => a.Id == id);
            if (appointment == null)
                throw new KeyNotFoundException("Appointment not found");
            return appointment;
        }
    }
}
