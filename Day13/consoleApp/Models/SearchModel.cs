namespace WholeApplication.Models
{
    public class SearchModel
    {
        public int? Id { get; set; }
        public string? Name { get; set; }
        public Range<int>? Age { get; set; }
        public Range<double>? Salary { get; set; }
    }

    public class Range<T> where T : struct
    {
        public T MinVal { get; set; }
        public T MaxVal { get; set; }

        public Range(T minVal, T maxVal)
        {
            MinVal = minVal;
            MaxVal = maxVal;
        }

        public Range() { } 
    }
}
