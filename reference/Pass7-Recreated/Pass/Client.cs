namespace Pass;

public class Client
{
	public int id;

	public string FullName;

	public string CalledName;

	public string FirstName;

	public string LastName;

	public string Dob;

	public string Phone;

	public string Fax;

	public string Email;

	public string Postal;

	public string Physical;

	public string Notes;

	public string NoteText;

	public string Mobile;

	public void setDOB(string value)
	{
		string[] array = value.Split('-');
		Dob = array[2] + "/" + array[1] + "/" + array[0];
	}

	public string getDOB()
	{
		string[] array = Dob.Split('/');
		return array[2] + "-" + array[1] + "-" + array[0];
	}
}
