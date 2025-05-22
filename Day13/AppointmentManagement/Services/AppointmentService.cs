using WholeApplication.Models;
using WholeApplication.Interfaces;
using WholeApplication.Exceptions;

namespace WholeApplication.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IRepository<int, Appointment> _repo;

        public AppointmentService(IRepository<int, Appointment> repo)
        {
            _repo = repo;
        }

        public int AddAppointment(Appointment appointment)
        {
            var added = _repo.Add(appointment);
            return added.Id;
        }

        public List<Appointment>? SearchAppointments(AppointmentSearchModel searchModel)
        {
            try
            {
                var results = _repo.GetAll().ToList();

                if (!string.IsNullOrWhiteSpace(searchModel.PatientName))
                {
                    results = results
                        .Where(a => a.PatientName.Contains(searchModel.PatientName, StringComparison.OrdinalIgnoreCase))
                        .ToList();
                }

                if (searchModel.AppointmentDate.HasValue)
                {
                    results = results
                        .Where(a => a.AppointmentDate.Date == searchModel.AppointmentDate.Value.Date)
                        .ToList();
                }

                if (searchModel.AgeRange != null)
                {
                    results = results
                        .Where(a => a.PatientAge >= searchModel.AgeRange.MinVal && a.PatientAge <= searchModel.AgeRange.MaxVal)
                        .ToList();
                }

                return results;
            }
            catch (CollectionEmptyException)
            {
                return new List<Appointment>();
            }
        }
    }
}
