using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("/api/[controller]")]
public class PatientController : ControllerBase
{
    private static List<Patient> patients = new List<Patient>
    {
        new Patient { Id = 101, Name = "Bruce", DateOfBirth = new DateTime(1985, 10, 14), Ailment = "Cold" },
        new Patient { Id = 102, Name = "Walter White", DateOfBirth = new DateTime(1970, 5, 20), Ailment = "Cancer" }
    };

    [HttpGet]
    public ActionResult<IEnumerable<Patient>> GetPatients()
    {
        return Ok(patients);
    }

    [HttpGet("{id}")]
    public ActionResult<Patient> GetPatient(int id)
    {
        var patient = patients.FirstOrDefault(p => p.Id == id);

        if (patient == null)
        {
            return NotFound($"Patient with Id {id} not found.");
        }
        return Ok(patient);
    }

    [HttpPost]
    public ActionResult<Patient> PostPatient([FromBody] Patient patient)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (patients.Any(p => p.Id == patient.Id))
        {
            
            return Conflict($"Patient with Id {patient.Id} already exists.");
        }

        patients.Add(patient);

        return CreatedAtAction(nameof(GetPatient), new { id = patient.Id }, patient); //commonly used

    }

    [HttpPut("{id}")]
    public ActionResult PutPatient(int id, [FromBody] Patient updatedPatient)
    {
        
        if (id != updatedPatient.Id)
        {
            return BadRequest("Patient ID in URL does not match ID in request body.");
        }

        
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var existingPatient = patients.FirstOrDefault(p => p.Id == id);

        if (existingPatient == null)
        {
            return NotFound($"Patient with Id {id} not found.");
        }

        
        existingPatient.Name = updatedPatient.Name;
        existingPatient.DateOfBirth = updatedPatient.DateOfBirth;
        existingPatient.Ailment = updatedPatient.Ailment;

        return NoContent(); 
    }
    
    [HttpDelete("{id}")]
    public ActionResult DeletePatient(int id)
    {
        
        var patientsRemovedCount = patients.RemoveAll(p => p.Id == id);

        if (patientsRemovedCount == 0)
        {
            return NotFound($"Patient with Id {id} not found.");
        }

        return NoContent();
    }
}