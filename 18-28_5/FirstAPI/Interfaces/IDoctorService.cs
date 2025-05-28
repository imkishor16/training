using System;
using FirstAPI.Interfaces;
using FirstAPI.Models;
using FirstAPI.Models.DTOs.DoctorSpecialities;
using System.Collections.Generic;

namespace FirstAPI.Interfaces
{
    public interface IDoctorService
    {
        public Task<Doctor> GetDoctByName(string name);
        public Task<ICollection<Doctor>> GetDoctorsBySpeciality(string speciality);
        public Task<Doctor> AddDoctor(DoctorAddRequestDto doctor);
    }
}