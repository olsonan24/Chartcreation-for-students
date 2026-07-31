using System;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Windows.Forms;

namespace Pass.Dialogs;

public class EditDialog : Form
{
	private DataTable _details = new DataTable();

	private bool _isFinished;

	private Client _client;

	private bool _newClient;

	private bool _saved;

	private bool _simple;

	private IContainer components;

	private Label FirstNameLbl;

	private TextBox FirstNameTxt;

	private Button SaveBtn;

	private TextBox CalledNameTxt;

	private Label CalledNameLbl;

	private TextBox DateOfBirthTxt;

	private Label DateofBirthLbl;

	private TextBox PhoneTxt;

	private Label PhoneLbl;

	private TextBox MobileTxt;

	private Label MobileLbl;

	private TextBox FaxTxt;

	private Label FaxLbl;

	private TextBox EmailTxt;

	private Label EmailLbl;

	private TextBox PostAddressTxt;

	private Label PostalAddressLbl;

	private TextBox PhysicalAddressTxt;

	private Label PhsicalAddressLbl;

	private RichTextBox NotesTxt;

	private Label DetailsLbl;

	private Label DoteofBirthHintLbl;

	private Button CloseBtn;

	public Client Client
	{
		get
		{
			return _client;
		}
		set
		{
			_client = value;
		}
	}

	public bool Saved => _saved;

	public bool Simple
	{
		get
		{
			return _simple;
		}
		set
		{
			_simple = value;
			NotesTxt.Visible = !value;
			PhysicalAddressTxt.Visible = !value;
			PostAddressTxt.Visible = !value;
			EmailTxt.Visible = !value;
			FaxTxt.Visible = !value;
			MobileTxt.Visible = !value;
			PhoneTxt.Visible = !value;
			PhoneLbl.Visible = !value;
			MobileLbl.Visible = !value;
			FaxLbl.Visible = !value;
			EmailLbl.Visible = !value;
			PostalAddressLbl.Visible = !value;
			PhsicalAddressLbl.Visible = !value;
			DetailsLbl.Visible = !value;
			base.Size = (value ? new Size(437, 159) : new Size(437, 449));
		}
	}

	public EditDialog(Client client)
	{
		InitializeComponent();
		_client = ((client != null) ? client : new Client());
		_newClient = client == null;
		base.FormClosed += pass_edit_FormClosed;
		base.FormClosing += pass_edit_FormClosing;
	}

	private void pass_edit_FormClosing(object sender, FormClosingEventArgs e)
	{
	}

	private void pass_edit_FormClosed(object sender, FormClosedEventArgs e)
	{
		_isFinished = true;
	}

	public static bool EditClient(Form parent, Client client, bool simple = false)
	{
		EditDialog editDialog = new EditDialog(client)
		{
			Simple = simple
		};
		parent.Enabled = false;
		editDialog.Show(parent);
		while (!editDialog._isFinished)
		{
			Application.DoEvents();
		}
		parent.Enabled = true;
		parent.Activate();
		return editDialog.Saved;
	}

	public static Client AddClient(Form parent, bool simple = false)
	{
		EditDialog editDialog = new EditDialog(null)
		{
			Simple = simple
		};
		parent.Enabled = false;
		editDialog.Show(parent);
		while (!editDialog._isFinished)
		{
			Application.DoEvents();
		}
		parent.Enabled = true;
		parent.Activate();
		if (editDialog.Saved)
		{
			return editDialog.Client;
		}
		return null;
	}

	private void CloseBtn_Click(object sender, EventArgs e)
	{
		Close();
	}

	private void SaveBtn_Click(object sender, EventArgs e)
	{
		_client.FullName = FirstNameTxt.Text;
		_client.FirstName = "";
		_client.LastName = "";
		_client.CalledName = CalledNameTxt.Text;
		_client.Dob = DateOfBirthTxt.Text;
		_client.Phone = PhoneTxt.Text;
		_client.Mobile = MobileTxt.Text;
		_client.Fax = FaxTxt.Text;
		_client.Email = EmailTxt.Text;
		_client.Postal = PostAddressTxt.Text;
		_client.Physical = PhysicalAddressTxt.Text;
		_client.Notes = NotesTxt.Rtf;
		_saved = true;
		Close();
	}

	private void Generic_KeyPress(object sender, KeyPressEventArgs e)
	{
		if (e.KeyChar == '\r')
		{
			SelectNextControl((Control)sender, forward: true, tabStopOnly: false, nested: true, wrap: false);
			e.Handled = true;
		}
	}

	protected override void Dispose(bool disposing)
	{
		if (disposing && components != null)
		{
			components.Dispose();
		}
		base.Dispose(disposing);
	}

	private void InitializeComponent()
	{
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Pass.Dialogs.EditDialog));
		this.FirstNameLbl = new System.Windows.Forms.Label();
		this.FirstNameTxt = new System.Windows.Forms.TextBox();
		this.SaveBtn = new System.Windows.Forms.Button();
		this.CalledNameTxt = new System.Windows.Forms.TextBox();
		this.CalledNameLbl = new System.Windows.Forms.Label();
		this.DateOfBirthTxt = new System.Windows.Forms.TextBox();
		this.DateofBirthLbl = new System.Windows.Forms.Label();
		this.PhoneTxt = new System.Windows.Forms.TextBox();
		this.PhoneLbl = new System.Windows.Forms.Label();
		this.MobileTxt = new System.Windows.Forms.TextBox();
		this.MobileLbl = new System.Windows.Forms.Label();
		this.FaxTxt = new System.Windows.Forms.TextBox();
		this.FaxLbl = new System.Windows.Forms.Label();
		this.EmailTxt = new System.Windows.Forms.TextBox();
		this.EmailLbl = new System.Windows.Forms.Label();
		this.PostAddressTxt = new System.Windows.Forms.TextBox();
		this.PostalAddressLbl = new System.Windows.Forms.Label();
		this.PhysicalAddressTxt = new System.Windows.Forms.TextBox();
		this.PhsicalAddressLbl = new System.Windows.Forms.Label();
		this.NotesTxt = new System.Windows.Forms.RichTextBox();
		this.DetailsLbl = new System.Windows.Forms.Label();
		this.DoteofBirthHintLbl = new System.Windows.Forms.Label();
		this.CloseBtn = new System.Windows.Forms.Button();
		base.SuspendLayout();
		this.FirstNameLbl.AutoSize = true;
		this.FirstNameLbl.Location = new System.Drawing.Point(23, 15);
		this.FirstNameLbl.Name = "FirstNameLbl";
		this.FirstNameLbl.Size = new System.Drawing.Size(54, 13);
		this.FirstNameLbl.TabIndex = 0;
		this.FirstNameLbl.Text = "Full Name";
		this.FirstNameTxt.Location = new System.Drawing.Point(83, 12);
		this.FirstNameTxt.Name = "FirstNameTxt";
		this.FirstNameTxt.Size = new System.Drawing.Size(327, 20);
		this.FirstNameTxt.TabIndex = 1;
		this.FirstNameTxt.KeyPress += new System.Windows.Forms.KeyPressEventHandler(Generic_KeyPress);
		this.SaveBtn.Anchor = System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right;
		this.SaveBtn.Location = new System.Drawing.Point(254, 380);
		this.SaveBtn.Name = "SaveBtn";
		this.SaveBtn.Size = new System.Drawing.Size(75, 23);
		this.SaveBtn.TabIndex = 11;
		this.SaveBtn.Text = "&Save";
		this.SaveBtn.UseVisualStyleBackColor = true;
		this.SaveBtn.Click += new System.EventHandler(SaveBtn_Click);
		this.CalledNameTxt.Location = new System.Drawing.Point(83, 38);
		this.CalledNameTxt.Name = "CalledNameTxt";
		this.CalledNameTxt.Size = new System.Drawing.Size(327, 20);
		this.CalledNameTxt.TabIndex = 2;
		this.CalledNameTxt.KeyPress += new System.Windows.Forms.KeyPressEventHandler(Generic_KeyPress);
		this.CalledNameLbl.AutoSize = true;
		this.CalledNameLbl.Location = new System.Drawing.Point(10, 41);
		this.CalledNameLbl.Name = "CalledNameLbl";
		this.CalledNameLbl.Size = new System.Drawing.Size(67, 13);
		this.CalledNameLbl.TabIndex = 3;
		this.CalledNameLbl.Text = "Called Name";
		this.DateOfBirthTxt.Location = new System.Drawing.Point(83, 64);
		this.DateOfBirthTxt.Name = "DateOfBirthTxt";
		this.DateOfBirthTxt.Size = new System.Drawing.Size(111, 20);
		this.DateOfBirthTxt.TabIndex = 3;
		this.DateOfBirthTxt.KeyPress += new System.Windows.Forms.KeyPressEventHandler(Generic_KeyPress);
		this.DateofBirthLbl.AutoSize = true;
		this.DateofBirthLbl.Location = new System.Drawing.Point(38, 67);
		this.DateofBirthLbl.Name = "DateofBirthLbl";
		this.DateofBirthLbl.Size = new System.Drawing.Size(39, 13);
		this.DateofBirthLbl.TabIndex = 5;
		this.DateofBirthLbl.Text = "D.O.B.";
		this.PhoneTxt.Location = new System.Drawing.Point(83, 90);
		this.PhoneTxt.Name = "PhoneTxt";
		this.PhoneTxt.Size = new System.Drawing.Size(111, 20);
		this.PhoneTxt.TabIndex = 4;
		this.PhoneTxt.KeyPress += new System.Windows.Forms.KeyPressEventHandler(Generic_KeyPress);
		this.PhoneLbl.AutoSize = true;
		this.PhoneLbl.Location = new System.Drawing.Point(39, 93);
		this.PhoneLbl.Name = "PhoneLbl";
		this.PhoneLbl.Size = new System.Drawing.Size(38, 13);
		this.PhoneLbl.TabIndex = 7;
		this.PhoneLbl.Text = "Phone";
		this.MobileTxt.Location = new System.Drawing.Point(299, 93);
		this.MobileTxt.Name = "MobileTxt";
		this.MobileTxt.Size = new System.Drawing.Size(111, 20);
		this.MobileTxt.TabIndex = 5;
		this.MobileTxt.KeyPress += new System.Windows.Forms.KeyPressEventHandler(Generic_KeyPress);
		this.MobileLbl.AutoSize = true;
		this.MobileLbl.Location = new System.Drawing.Point(255, 96);
		this.MobileLbl.Name = "MobileLbl";
		this.MobileLbl.Size = new System.Drawing.Size(38, 13);
		this.MobileLbl.TabIndex = 9;
		this.MobileLbl.Text = "Mobile";
		this.FaxTxt.Location = new System.Drawing.Point(83, 116);
		this.FaxTxt.Name = "FaxTxt";
		this.FaxTxt.Size = new System.Drawing.Size(111, 20);
		this.FaxTxt.TabIndex = 6;
		this.FaxTxt.KeyPress += new System.Windows.Forms.KeyPressEventHandler(Generic_KeyPress);
		this.FaxLbl.AutoSize = true;
		this.FaxLbl.Location = new System.Drawing.Point(53, 119);
		this.FaxLbl.Name = "FaxLbl";
		this.FaxLbl.Size = new System.Drawing.Size(24, 13);
		this.FaxLbl.TabIndex = 11;
		this.FaxLbl.Text = "Fax";
		this.EmailTxt.Location = new System.Drawing.Point(83, 142);
		this.EmailTxt.Name = "EmailTxt";
		this.EmailTxt.Size = new System.Drawing.Size(327, 20);
		this.EmailTxt.TabIndex = 7;
		this.EmailTxt.KeyPress += new System.Windows.Forms.KeyPressEventHandler(Generic_KeyPress);
		this.EmailLbl.AutoSize = true;
		this.EmailLbl.Location = new System.Drawing.Point(45, 145);
		this.EmailLbl.Name = "EmailLbl";
		this.EmailLbl.Size = new System.Drawing.Size(32, 13);
		this.EmailLbl.TabIndex = 13;
		this.EmailLbl.Text = "Email";
		this.PostAddressTxt.Location = new System.Drawing.Point(83, 168);
		this.PostAddressTxt.Name = "PostAddressTxt";
		this.PostAddressTxt.Size = new System.Drawing.Size(327, 20);
		this.PostAddressTxt.TabIndex = 8;
		this.PostAddressTxt.KeyPress += new System.Windows.Forms.KeyPressEventHandler(Generic_KeyPress);
		this.PostalAddressLbl.AutoSize = true;
		this.PostalAddressLbl.Location = new System.Drawing.Point(16, 171);
		this.PostalAddressLbl.Name = "PostalAddressLbl";
		this.PostalAddressLbl.Size = new System.Drawing.Size(61, 13);
		this.PostalAddressLbl.TabIndex = 15;
		this.PostalAddressLbl.Text = "Postal Addr";
		this.PhysicalAddressTxt.Location = new System.Drawing.Point(83, 194);
		this.PhysicalAddressTxt.Name = "PhysicalAddressTxt";
		this.PhysicalAddressTxt.Size = new System.Drawing.Size(327, 20);
		this.PhysicalAddressTxt.TabIndex = 9;
		this.PhysicalAddressTxt.KeyPress += new System.Windows.Forms.KeyPressEventHandler(Generic_KeyPress);
		this.PhsicalAddressLbl.AutoSize = true;
		this.PhsicalAddressLbl.Location = new System.Drawing.Point(6, 197);
		this.PhsicalAddressLbl.Name = "PhsicalAddressLbl";
		this.PhsicalAddressLbl.Size = new System.Drawing.Size(71, 13);
		this.PhsicalAddressLbl.TabIndex = 17;
		this.PhsicalAddressLbl.Text = "Physical Addr";
		this.NotesTxt.AcceptsTab = true;
		this.NotesTxt.EnableAutoDragDrop = true;
		this.NotesTxt.Location = new System.Drawing.Point(83, 220);
		this.NotesTxt.Name = "NotesTxt";
		this.NotesTxt.ScrollBars = System.Windows.Forms.RichTextBoxScrollBars.Vertical;
		this.NotesTxt.Size = new System.Drawing.Size(327, 154);
		this.NotesTxt.TabIndex = 10;
		this.NotesTxt.Text = "";
		this.DetailsLbl.AutoSize = true;
		this.DetailsLbl.Location = new System.Drawing.Point(42, 223);
		this.DetailsLbl.Name = "DetailsLbl";
		this.DetailsLbl.Size = new System.Drawing.Size(35, 13);
		this.DetailsLbl.TabIndex = 20;
		this.DetailsLbl.Text = "Notes";
		this.DoteofBirthHintLbl.AutoSize = true;
		this.DoteofBirthHintLbl.Location = new System.Drawing.Point(200, 67);
		this.DoteofBirthHintLbl.Name = "DoteofBirthHintLbl";
		this.DoteofBirthHintLbl.Size = new System.Drawing.Size(85, 13);
		this.DoteofBirthHintLbl.TabIndex = 21;
		this.DoteofBirthHintLbl.Text = "(DD/MM/YYYY)";
		this.CloseBtn.Anchor = System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right;
		this.CloseBtn.Location = new System.Drawing.Point(335, 380);
		this.CloseBtn.Name = "CloseBtn";
		this.CloseBtn.Size = new System.Drawing.Size(75, 23);
		this.CloseBtn.TabIndex = 12;
		this.CloseBtn.Text = "&Cancel";
		this.CloseBtn.UseVisualStyleBackColor = true;
		this.CloseBtn.Click += new System.EventHandler(CloseBtn_Click);
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(421, 410);
		base.Controls.Add(this.CloseBtn);
		base.Controls.Add(this.DoteofBirthHintLbl);
		base.Controls.Add(this.DetailsLbl);
		base.Controls.Add(this.NotesTxt);
		base.Controls.Add(this.PhysicalAddressTxt);
		base.Controls.Add(this.PhsicalAddressLbl);
		base.Controls.Add(this.PostAddressTxt);
		base.Controls.Add(this.PostalAddressLbl);
		base.Controls.Add(this.EmailTxt);
		base.Controls.Add(this.EmailLbl);
		base.Controls.Add(this.FaxTxt);
		base.Controls.Add(this.FaxLbl);
		base.Controls.Add(this.MobileTxt);
		base.Controls.Add(this.MobileLbl);
		base.Controls.Add(this.PhoneTxt);
		base.Controls.Add(this.PhoneLbl);
		base.Controls.Add(this.DateOfBirthTxt);
		base.Controls.Add(this.DateofBirthLbl);
		base.Controls.Add(this.CalledNameTxt);
		base.Controls.Add(this.CalledNameLbl);
		base.Controls.Add(this.SaveBtn);
		base.Controls.Add(this.FirstNameTxt);
		base.Controls.Add(this.FirstNameLbl);
		base.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedToolWindow;
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.Name = "PassEditDialog";
		base.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
		this.Text = "Client View/Edit - Pass 3";
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
