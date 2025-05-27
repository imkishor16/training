namespace WholeApplication.Models
{
    public class Appointment
    {
        public int Id { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public int PatientAge { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class AppointmentSearchModel
    {
        public string? PatientName { get; set; }
        public DateTime? AppointmentDate { get; set; }
        public Range<int>? AgeRange { get; set; }
    }

    public class Range<T> where T : struct
    {
        public T MinVal { get; set; }
        public T MaxVal { get; set; }

        public Range(T min, T max)
        {
            MinVal = min;
            MaxVal = max;
        }

        public Range() { }
    }
}
