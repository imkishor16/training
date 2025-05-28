
using FirstAPI.Interfaces;
using FirstAPI.Repositories;
using FirstAPI.Models; 
using FirstAPI.Models.DTOs.DoctorSpecialities;   
using System.Collections.Generic;
using System.Linq;

namespace FirstAPI.Services
{
    public class DoctorService : IDoctorService
    {   
        private readonly IRepository<int, Doctor> _doctorRepository;
        private readonly IRepository<int, Speciality> _specialityRepository;
        private readonly IRepository<int, DoctorSpeciality> _doctorSpecialityRepository;

        public DoctorService(
            IRepository<int, Doctor> doctorRepository,
            IRepository<int, Speciality> specialityRepository,
            IRepository<int, DoctorSpeciality> doctorSpecialityRepository)
        {
            _doctorRepository = doctorRepository;
            _specialityRepository = specialityRepository;
            _doctorSpecialityRepository = doctorSpecialityRepository;
        }

        public async Task<Doctor> GetDoctByName(string name)
        {
            var doctors = await _doctorRepository.GetAll();
            return doctors.FirstOrDefault(d => d.Name.Equals(name));
        }

        public async Task<ICollection<Doctor>> GetDoctorsBySpeciality(string speciality)
        {
            var specialities = await _specialityRepository.GetAll();
            var matchedSpeciality = specialities.FirstOrDefault(s => s.Name.Equals(speciality, StringComparison.OrdinalIgnoreCase));
            if (matchedSpeciality == null) return new List<Doctor>();

            var doctorSpecialities = await _doctorSpecialityRepository.GetAll();
            var doctorIds = doctorSpecialities
                .Where(ds => ds.SpecialityId == matchedSpeciality.Id)
                .Select(ds => ds.DoctorId)
                .ToList();

            var doctors = await _doctorRepository.GetAll();
            return doctors.Where(d => doctorIds.Contains(d.Id)).ToList();
        }

        public async Task<Doctor> AddDoctor(DoctorAddRequestDto doctorDto)
        {
            var doctor = new Doctor
            {
                Name = doctorDto.Name,
                status="Acitve",
                YearsOfExperience = doctorDto.YearsOfExperience
            };
            var addedDoctor = await _doctorRepository.Add(doctor);
            var specialities = doctorDto.Specialities;
            specialities.ForEach(s =>
            {
                var speciality = new Speciality
                {
                    Name = s.Name,
                    Status = "Active"
                };
                var addSpeciality = _specialityRepository.Add(speciality);
                var doctorSpeciality = new DoctorSpeciality
                {
                    DoctorId = addedDoctor.Id,
                    SpecialityId = addSpeciality.Id
                };
                _doctorSpecialityRepository.Add(doctorSpeciality);
            });

            await _doctorRepository.SaveChangesAsync();
            await _specialityRepository.SaveChangesAsync();
            await _doctorSpecialityRepository.SaveChangesAsync();

            return addedDoctor;
        }
    }
}