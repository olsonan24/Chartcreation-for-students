using System;
using System.Data;
using System.Data.SqlClient;
using System.Windows.Forms;

namespace Pass;

public class Database
{
	private string pdm_user = "Pass2";

	private string pdm_pass = "";

	private string pdm_server = "";

	private SqlConnection dbConn = new SqlConnection();

	private SqlCommand cmd;

	private SqlDataReader rdr;

	private SqlDataAdapter data;

	public bool connect(string user, string pass, string server)
	{
		if (dbConn.State != ConnectionState.Closed)
		{
			dbConn.Close();
		}
		if (user != "" && pass != "" && server != "")
		{
			pdm_user = user;
			pdm_pass = pass;
			pdm_server = server;
			SqlConnectionStringBuilder sqlConnectionStringBuilder = new SqlConnectionStringBuilder();
			sqlConnectionStringBuilder.DataSource = server;
			sqlConnectionStringBuilder.UserID = user;
			sqlConnectionStringBuilder.Password = pass;
			sqlConnectionStringBuilder.ConnectTimeout = 20;
			sqlConnectionStringBuilder.PersistSecurityInfo = true;
			try
			{
				dbConn.ConnectionString = sqlConnectionStringBuilder.ConnectionString;
				dbConn.Open();
				return true;
			}
			catch (Exception ex)
			{
				dbConn.Close();
				MessageBox.Show(null, ex.Message, "Error while trying to connect!", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
			}
		}
		return false;
	}

	public bool isOpen()
	{
		if (dbConn.State == ConnectionState.Open)
		{
			return true;
		}
		return false;
	}

	public string getServerStatus()
	{
		return dbConn.State switch
		{
			ConnectionState.Broken => "Broken", 
			ConnectionState.Closed => "Closed", 
			ConnectionState.Connecting => "Connecting...", 
			ConnectionState.Executing => "Excuting...", 
			ConnectionState.Fetching => "Fetching...", 
			ConnectionState.Open => "Open", 
			_ => "", 
		};
	}

	public DataTable getClientList(double dbLimit, char nameLimit)
	{
		DataSet dataSet = new DataSet();
		string text = "";
		string text2 = "";
		if (dbLimit == 0.0)
		{
			if (nameLimit != 0)
			{
				text = "WHERE Client.FullName LIKE '" + nameLimit + "%'";
			}
			text2 = "SELECT Client.ClientID,Client.FullName,Client.Dob,Client.CalledName FROM pass2.dbo.Client " + text + " ORDER BY Client.FirstName ASC";
		}
		else
		{
			if (nameLimit != 0)
			{
				text = "AND Client.FullName LIKE '" + nameLimit + "%'";
			}
			text2 = "SELECT Client.ClientID,Client.FullName,Client.Dob,Client.CalledName FROM pass2.dbo.Client JOIN pass2.dbo.LnkClientDb ON Client.ClientID = LnkClientDb.ClientID WHERE LnkClientDb.DbID = " + dbLimit + " " + text + " ORDER BY Client.FirstName ASC";
		}
		data = new SqlDataAdapter(text2, dbConn);
		data.Fill(dataSet);
		return dataSet.Tables[0];
	}

	public Client getClientDetails(double index)
	{
		DataSet dataSet = new DataSet();
		Client client = new Client();
		cmd = new SqlCommand("SELECT * FROM [pass2].[dbo].[Client] WHERE [ClientID]=" + index + ";", dbConn);
		try
		{
			data = new SqlDataAdapter(cmd);
			data.Fill(dataSet);
		}
		catch (SqlException ex)
		{
			MessageBox.Show(null, ex.Message, "MsSQL Error - Pass 3", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			return client;
		}
		DataRow dataRow = dataSet.Tables[0].Rows[0];
		client.FullName = dataRow["FullName"].ToString();
		client.CalledName = dataRow["CalledName"].ToString();
		client.setDOB(dataRow["Dob"].ToString());
		client.FirstName = dataRow["FirstName"].ToString();
		client.LastName = dataRow["LastName"].ToString();
		client.Phone = dataRow["Phone"].ToString();
		client.Mobile = dataRow["Mobile"].ToString();
		client.Fax = dataRow["Fax"].ToString();
		client.Email = dataRow["Email"].ToString();
		client.Postal = dataRow["Postal"].ToString();
		client.Physical = dataRow["Physical"].ToString();
		client.Notes = dataRow["Notes"].ToString();
		client.id = (int)dataRow["ClientID"];
		return client;
	}

	public bool setClientDetails(Client client)
	{
		cmd = new SqlCommand("UPDATE [pass2].[dbo].[Client] SET [FullName]=@FullName,[FirstName]=@FirstName,[LastName]=@LastName,[Dob]=@Dob,[CalledName]=@CalledName,[Phone]=@Phone,[Fax]=@Fax,[Email]=@Email,[Postal]=@Postal,[Physical]=@Physical,[Notes]=@Notes,[Mobile]=@Mobile WHERE [ClientID]=@ID;", dbConn);
		cmd.Parameters.AddWithValue("@FullName", client.FullName);
		cmd.Parameters.AddWithValue("@FirstName", client.FirstName);
		cmd.Parameters.AddWithValue("@LastName", client.LastName);
		cmd.Parameters.AddWithValue("@Dob", client.getDOB());
		cmd.Parameters.AddWithValue("@CalledName", client.CalledName);
		cmd.Parameters.AddWithValue("@Phone", client.Phone);
		cmd.Parameters.AddWithValue("@Fax", client.Fax);
		cmd.Parameters.AddWithValue("@Email", client.Email);
		cmd.Parameters.AddWithValue("@Postal", client.Postal);
		cmd.Parameters.AddWithValue("@Physical", client.Physical);
		cmd.Parameters.AddWithValue("@Notes", client.Notes);
		cmd.Parameters.AddWithValue("@Mobile", client.Mobile);
		cmd.Parameters.AddWithValue("@ID", client.id);
		try
		{
			cmd.ExecuteNonQuery();
		}
		catch (SqlException ex)
		{
			MessageBox.Show(null, ex.Message, "MsSQL Error - Pass 3", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			return false;
		}
		return true;
	}

	public bool addClient(Client client)
	{
		SqlCommand sqlCommand = new SqlCommand("SELECT MAX([pass2].[dbo].[Client].[ClientID]) as DbID FROM [pass2].[dbo].[Client];", dbConn);
		rdr = sqlCommand.ExecuteReader();
		rdr.Read();
		double num = (double)rdr["DbID"] + 1.0;
		rdr.Close();
		sqlCommand = new SqlCommand("INSERT INTO [pass2].[dbo].[Client] ([ClientID],[FullName],[FirstName],[LastName],[Dob],[CalledName],[Phone],[Fax],[Email],[Postal],[Physical],[Notes],[Mobile],[DateEstb],[EstbUserID]) VALUES (" + num + ",@FullName,@FirstName,@LastName,@Dob,@CalledName,@Phone,@Fax,@Email,@Postal,@Physical,@Notes,@Mobile, GETDATE() ,1);", dbConn);
		sqlCommand.Parameters.AddWithValue("@FullName", client.FullName);
		sqlCommand.Parameters.AddWithValue("@FirstName", client.FirstName);
		sqlCommand.Parameters.AddWithValue("@LastName", client.LastName);
		sqlCommand.Parameters.AddWithValue("@Dob", client.getDOB());
		sqlCommand.Parameters.AddWithValue("@CalledName", client.CalledName);
		sqlCommand.Parameters.AddWithValue("@Phone", client.Phone);
		sqlCommand.Parameters.AddWithValue("@Fax", client.Fax);
		sqlCommand.Parameters.AddWithValue("@Email", client.Email);
		sqlCommand.Parameters.AddWithValue("@Postal", client.Postal);
		sqlCommand.Parameters.AddWithValue("@Physical", client.Physical);
		sqlCommand.Parameters.AddWithValue("@Notes", client.Notes);
		sqlCommand.Parameters.AddWithValue("@Mobile", client.Mobile);
		try
		{
			sqlCommand.ExecuteNonQuery();
		}
		catch (SqlException ex)
		{
			MessageBox.Show(null, ex.Message, "MsSQL Error - Pass 3", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			return false;
		}
		return true;
	}

	public bool copyClients(double[] Clients, double dbIndex)
	{
		string text = "";
		foreach (double num in Clients)
		{
			text = text + "INSERT INTO [pass2].[dbo].[LnkClientDb] ([ClientID],[DbID]) VALUES (" + num + "," + dbIndex + "); ";
		}
		cmd = new SqlCommand(text, dbConn);
		try
		{
			cmd.ExecuteNonQuery();
		}
		catch (SqlException ex)
		{
			MessageBox.Show(null, ex.Message, "MsSQL Error - Pass 3", MessageBoxButtons.OK, MessageBoxIcon.Hand);
		}
		return true;
	}

	public DataTable getDatabaseList()
	{
		DataSet dataSet = new DataSet();
		cmd = new SqlCommand("SELECT * FROM [pass2].[dbo].[Db] ORDER BY [DbName] ASC", dbConn);
		data = new SqlDataAdapter(cmd);
		data.Fill(dataSet);
		return dataSet.Tables[0];
	}

	public bool addDatabase(string name)
	{
		SqlCommand sqlCommand = new SqlCommand("SELECT MAX([pass2].[dbo].[Db].[DbID]) as DbID FROM [pass2].[dbo].[Db];", dbConn);
		rdr = sqlCommand.ExecuteReader();
		rdr.Read();
		double num = (double)rdr["DbID"] + 1.0;
		rdr.Close();
		name = name.Replace("'", "''");
		sqlCommand = new SqlCommand("INSERT INTO [pass2].[dbo].[Db] ([DbID],[DbName],[DateEstb],[EstbUserID]) VALUES (" + num + ",'" + name + "',GETDATE(),1);", dbConn);
		try
		{
			sqlCommand.ExecuteNonQuery();
		}
		catch (SqlException ex)
		{
			MessageBox.Show(null, ex.Message, "MsSQL Error!", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			return false;
		}
		return true;
	}

	public bool copyDatabase(string name, double index)
	{
		DataSet dataSet = new DataSet();
		SqlCommand sqlCommand = new SqlCommand("SELECT MAX([pass2].[dbo].[Db].[DbID]) as DbID FROM [pass2].[dbo].[Db];", dbConn);
		rdr = sqlCommand.ExecuteReader();
		rdr.Read();
		double num = (double)rdr["DbID"] + 1.0;
		rdr.Close();
		name = name.Replace("'", "''");
		sqlCommand = new SqlCommand("INSERT INTO [pass2].[dbo].[Db] ([DbID],[DbName],[DateEstb],[EstbUserID]) VALUES (" + num + ",'" + name + "', GETDATE(),1);", dbConn);
		try
		{
			sqlCommand.ExecuteNonQuery();
		}
		catch (SqlException ex)
		{
			MessageBox.Show(null, ex.Message, "MsSQL Error!", MessageBoxButtons.OK, MessageBoxIcon.Hand);
		}
		sqlCommand = new SqlCommand("SELECT * FROM [pass2].[dbo].[LnkClientDb] WHERE [DbID]=" + index + ";", dbConn);
		data = new SqlDataAdapter(sqlCommand);
		data.Fill(dataSet);
		foreach (DataRow row in dataSet.Tables[0].Rows)
		{
			row["DbID"] = num;
		}
		SqlBulkCopy sqlBulkCopy = new SqlBulkCopy(dbConn);
		sqlBulkCopy.DestinationTableName = "LnkClientDb";
		sqlBulkCopy.WriteToServer(dataSet.Tables[0]);
		return true;
	}

	public bool removeDatabase(double index)
	{
		cmd = new SqlCommand("DELETE FROM [pass2].[dbo].[Db] WHERE [DbID]=" + index + ";DELETE FROM [pass2].[dbo].[LnkClientDb] WHERE [DbID]=" + index + ";", dbConn);
		try
		{
			cmd.ExecuteNonQuery();
		}
		catch (SqlException ex)
		{
			MessageBox.Show(ex.Message);
		}
		return true;
	}
}
