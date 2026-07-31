using System;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Windows.Forms;
using Pass.Dialogs;
using Pass.Properties;

namespace Pass.Forms;

public class Main : Form
{
	public Database dbMan = new Database();

	private DataTable dbList;

	private DataTable clientList;

	private int dbLimit;

	private char nameLimit = 'A';

	private CheckBox selectAll_chk = new CheckBox();

	private Rectangle selBox_rect;

	private IContainer components;

	private DataGridView ClientList_dgv;

	private Label label1;

	private ComboBox db_cmb;

	private CheckBox limit_chk;

	private ComboBox limit_cmb;

	private Button adddb_btn;

	private Button dbManage_btn;

	private StatusStrip status_strp;

	private ToolStripStatusLabel status_txt;

	private Button quickChart_btn;

	private DataGridViewCheckBoxColumn with_col;

	private DataGridViewTextBoxColumn CID;

	private DataGridViewTextBoxColumn fullName_col;

	private DataGridViewTextBoxColumn calledName_col;

	private DataGridViewTextBoxColumn dob_col;

	private Button addc_btn;

	private Button edit_btn;

	private Button copy_btn;

	private Button button5;

	private Button button6;

	private Button button7;

	private Button button8;

	private Button charts_btn;

	private Button multiChart_btn;

	private Button button11;

	private Button button12;

	private MenuStrip menuStrip1;

	private ToolStripMenuItem fileToolStripMenuItem;

	private ToolStripMenuItem logoutToolStripMenuItem;

	private ToolStripMenuItem quitToolStripMenuItem;

	public Main()
	{
		base.StartPosition = FormStartPosition.CenterScreen;
		InitializeComponent();
	}

	private bool login()
	{
		throw new Exception("Code disabled");
	}

	private void Form1_Load(object sender, EventArgs e)
	{
		if (login())
		{
			selBox_rect = ClientList_dgv.GetCellDisplayRectangle(0, -1, cutOverflow: true);
			selBox_rect.X += selBox_rect.Width / 3;
			selBox_rect.Y += selBox_rect.Height / 4;
			selectAll_chk.Size = new Size(13, 13);
			selectAll_chk.Name = "selectAll";
			selectAll_chk.AutoSize = false;
			selectAll_chk.Location = selBox_rect.Location;
			selectAll_chk.CheckedChanged += selectAll_chk_CheckedChanged;
			ClientList_dgv.Controls.Add(selectAll_chk);
		}
	}

	private void selectAll_chk_CheckedChanged(object sender, EventArgs e)
	{
		bool flag = selectAll_chk.Checked;
		for (int i = 0; i < ClientList_dgv.Rows.Count; i++)
		{
			((DataGridViewCheckBoxCell)ClientList_dgv.Rows[i].Cells[0]).Value = flag;
			if (flag)
			{
				ClientList_dgv.Rows[i].DefaultCellStyle.BackColor = Color.DeepSkyBlue;
			}
			else
			{
				ClientList_dgv.Rows[i].DefaultCellStyle.BackColor = Color.White;
			}
		}
	}

	public void updateAll()
	{
		updateDatabase();
		updateClients();
	}

	public void updateDatabase()
	{
		db_cmb.Items.Clear();
		dbList = dbMan.getDatabaseList();
		db_cmb.Items.Add("[Global]");
		for (int i = 0; i < dbList.Rows.Count; i++)
		{
			db_cmb.Items.Add(dbList.Rows[i]["DbName"].ToString());
		}
		db_cmb.SelectedIndex = Settings.Default.LastDB;
	}

	public void updateClients()
	{
		selectAll_chk.Checked = false;
		ClientList_dgv.Rows.Clear();
		clientList = dbMan.getClientList(dbLimit, nameLimit);
		for (int i = 0; i < clientList.Rows.Count; i++)
		{
			ClientList_dgv.Rows.Add(false, clientList.Rows[i][0], clientList.Rows[i][1], clientList.Rows[i][3], convertDob(clientList.Rows[i][2]));
			ClientList_dgv.Rows[i].Cells[0].ReadOnly = false;
		}
	}

	private string convertDob(object input)
	{
		if (typeof(DBNull) == input.GetType())
		{
			return "";
		}
		string[] array = ((string)input).Split('-');
		if (array.Count() > 1)
		{
			return array[2] + "/" + array[1] + "/" + array[0];
		}
		return "";
	}

	private void ClientList_dgv_CellClick(object sender, DataGridViewCellMouseEventArgs e)
	{
		if (ClientList_dgv.Columns[e.ColumnIndex].Name == "with_col" && e.RowIndex > -1)
		{
			DataGridViewCheckBoxCell obj = (DataGridViewCheckBoxCell)ClientList_dgv.Rows[e.RowIndex].Cells[0];
			bool flag = (bool)obj.Value;
			obj.Value = !flag;
			if (!flag)
			{
				ClientList_dgv.Rows[e.RowIndex].DefaultCellStyle.BackColor = Color.DeepSkyBlue;
			}
			else
			{
				ClientList_dgv.Rows[e.RowIndex].DefaultCellStyle.BackColor = Color.White;
			}
		}
	}

	private void db_cmb_SelectedIndexChanged(object sender, EventArgs e)
	{
		int selectedIndex = db_cmb.SelectedIndex;
		Settings.Default.LastDB = selectedIndex;
		Settings.Default.Save();
		if (selectedIndex == 0)
		{
			dbLimit = 0;
		}
		else
		{
			dbLimit = (int)dbList.Rows[selectedIndex - 1]["DbID"];
		}
		updateClients();
	}

	private void limit_cmb_SelectedIndexChanged(object sender, EventArgs e)
	{
		if (limit_chk.Checked)
		{
			nameLimit = limit_cmb.Text.ToCharArray()[0];
		}
		else
		{
			nameLimit = '\0';
		}
		updateClients();
	}

	private void limit_chk_CheckedChanged(object sender, EventArgs e)
	{
		if (limit_chk.Checked)
		{
			nameLimit = limit_cmb.Text.ToCharArray()[0];
		}
		else
		{
			nameLimit = '\0';
		}
		updateClients();
	}

	public void updateStatus()
	{
		status_txt.Text = "Connection Status: " + dbMan.getServerStatus();
	}

	private void button1_Click(object sender, EventArgs e)
	{
		QuickChart quickChart = new QuickChart();
		string name = (string)ClientList_dgv.SelectedRows[0].Cells[2].Value;
		string dob = (string)ClientList_dgv.SelectedRows[0].Cells[4].Value;
		quickChart.setDetails(name, dob);
		quickChart.ShowDialog();
		quickChart.Dispose();
	}

	private void logoutToolStripMenuItem_Click(object sender, EventArgs e)
	{
		base.Enabled = false;
		ClientList_dgv.Rows.Clear();
		login();
	}

	private void quitToolStripMenuItem_Click(object sender, EventArgs e)
	{
		Close();
	}

	private void dbManage_btn_Click(object sender, EventArgs e)
	{
		DatabaseManager.Show(this, dbMan);
		updateAll();
	}

	private void edit_btn_Click(object sender, EventArgs e)
	{
	}

	private void adddb_btn_Click(object sender, EventArgs e)
	{
		InputData inputData = InputDialog.Show("Please name the new database", "Add New Database");
		if (!inputData.Canceled)
		{
			dbMan.addDatabase(inputData.Input);
		}
		updateAll();
	}

	private void addc_btn_Click(object sender, EventArgs e)
	{
	}

	private void copy_btn_Click(object sender, EventArgs e)
	{
		double[] array = new double[ClientList_dgv.Rows.Count];
		double dbIndex = DatabaseManager.Show(this, dbMan);
		for (int i = 0; i < ClientList_dgv.Rows.Count; i++)
		{
			if ((bool)ClientList_dgv.Rows[i].Cells[0].Value)
			{
				array[i] = (double)ClientList_dgv.Rows[i].Cells[1].Value;
			}
		}
		dbMan.copyClients(array, dbIndex);
	}

	private void multiChart_btn_Click(object sender, EventArgs e)
	{
		MultiChart multiChart = new MultiChart();
		for (int i = 0; i < ClientList_dgv.Rows.Count; i++)
		{
			if ((bool)ClientList_dgv.Rows[i].Cells[0].Value)
			{
				multiChart.AddClient((string)ClientList_dgv.Rows[i].Cells[2].Value, (string)ClientList_dgv.Rows[i].Cells[4].Value);
			}
		}
		multiChart.Show();
	}

	private void menuStrip1_ItemClicked(object sender, ToolStripItemClickedEventArgs e)
	{
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
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Pass.Forms.Main));
		this.ClientList_dgv = new System.Windows.Forms.DataGridView();
		this.with_col = new System.Windows.Forms.DataGridViewCheckBoxColumn();
		this.CID = new System.Windows.Forms.DataGridViewTextBoxColumn();
		this.fullName_col = new System.Windows.Forms.DataGridViewTextBoxColumn();
		this.calledName_col = new System.Windows.Forms.DataGridViewTextBoxColumn();
		this.dob_col = new System.Windows.Forms.DataGridViewTextBoxColumn();
		this.label1 = new System.Windows.Forms.Label();
		this.db_cmb = new System.Windows.Forms.ComboBox();
		this.limit_chk = new System.Windows.Forms.CheckBox();
		this.limit_cmb = new System.Windows.Forms.ComboBox();
		this.adddb_btn = new System.Windows.Forms.Button();
		this.dbManage_btn = new System.Windows.Forms.Button();
		this.status_strp = new System.Windows.Forms.StatusStrip();
		this.status_txt = new System.Windows.Forms.ToolStripStatusLabel();
		this.quickChart_btn = new System.Windows.Forms.Button();
		this.addc_btn = new System.Windows.Forms.Button();
		this.edit_btn = new System.Windows.Forms.Button();
		this.copy_btn = new System.Windows.Forms.Button();
		this.button5 = new System.Windows.Forms.Button();
		this.button6 = new System.Windows.Forms.Button();
		this.button7 = new System.Windows.Forms.Button();
		this.button8 = new System.Windows.Forms.Button();
		this.charts_btn = new System.Windows.Forms.Button();
		this.multiChart_btn = new System.Windows.Forms.Button();
		this.button11 = new System.Windows.Forms.Button();
		this.button12 = new System.Windows.Forms.Button();
		this.menuStrip1 = new System.Windows.Forms.MenuStrip();
		this.fileToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
		this.logoutToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
		this.quitToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
		((System.ComponentModel.ISupportInitialize)this.ClientList_dgv).BeginInit();
		this.menuStrip1.SuspendLayout();
		base.SuspendLayout();
		this.ClientList_dgv.AllowUserToAddRows = false;
		this.ClientList_dgv.AllowUserToDeleteRows = false;
		this.ClientList_dgv.AllowUserToResizeRows = false;
		this.ClientList_dgv.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
		this.ClientList_dgv.Columns.AddRange(this.with_col, this.CID, this.fullName_col, this.calledName_col, this.dob_col);
		this.ClientList_dgv.GridColor = System.Drawing.SystemColors.Control;
		this.ClientList_dgv.ImeMode = System.Windows.Forms.ImeMode.NoControl;
		this.ClientList_dgv.Location = new System.Drawing.Point(5, 56);
		this.ClientList_dgv.MultiSelect = false;
		this.ClientList_dgv.Name = "ClientList_dgv";
		this.ClientList_dgv.ReadOnly = true;
		this.ClientList_dgv.RowHeadersVisible = false;
		this.ClientList_dgv.RowTemplate.Height = 18;
		this.ClientList_dgv.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
		this.ClientList_dgv.Size = new System.Drawing.Size(754, 505);
		this.ClientList_dgv.TabIndex = 0;
		this.ClientList_dgv.CellMouseDown += new System.Windows.Forms.DataGridViewCellMouseEventHandler(ClientList_dgv_CellClick);
		this.with_col.HeaderText = "";
		this.with_col.Name = "with_col";
		this.with_col.ReadOnly = true;
		this.with_col.Resizable = System.Windows.Forms.DataGridViewTriState.False;
		this.with_col.Width = 40;
		this.CID.HeaderText = "ClientID";
		this.CID.Name = "CID";
		this.CID.ReadOnly = true;
		this.CID.Resizable = System.Windows.Forms.DataGridViewTriState.False;
		this.CID.Visible = false;
		this.fullName_col.HeaderText = "Full Name";
		this.fullName_col.MinimumWidth = 50;
		this.fullName_col.Name = "fullName_col";
		this.fullName_col.ReadOnly = true;
		this.fullName_col.Resizable = System.Windows.Forms.DataGridViewTriState.False;
		this.fullName_col.Width = 300;
		this.calledName_col.HeaderText = "Called Name";
		this.calledName_col.MinimumWidth = 50;
		this.calledName_col.Name = "calledName_col";
		this.calledName_col.ReadOnly = true;
		this.calledName_col.Resizable = System.Windows.Forms.DataGridViewTriState.False;
		this.calledName_col.Width = 300;
		this.dob_col.HeaderText = "DOB";
		this.dob_col.Name = "dob_col";
		this.dob_col.ReadOnly = true;
		this.dob_col.Resizable = System.Windows.Forms.DataGridViewTriState.False;
		this.label1.AutoSize = true;
		this.label1.Location = new System.Drawing.Point(17, 30);
		this.label1.Name = "label1";
		this.label1.Size = new System.Drawing.Size(56, 13);
		this.label1.TabIndex = 1;
		this.label1.Text = "Database:";
		this.db_cmb.FormattingEnabled = true;
		this.db_cmb.Location = new System.Drawing.Point(79, 27);
		this.db_cmb.Name = "db_cmb";
		this.db_cmb.Size = new System.Drawing.Size(397, 21);
		this.db_cmb.TabIndex = 2;
		this.db_cmb.SelectedIndexChanged += new System.EventHandler(db_cmb_SelectedIndexChanged);
		this.limit_chk.AutoSize = true;
		this.limit_chk.Checked = true;
		this.limit_chk.CheckState = System.Windows.Forms.CheckState.Checked;
		this.limit_chk.Location = new System.Drawing.Point(482, 30);
		this.limit_chk.Name = "limit_chk";
		this.limit_chk.Size = new System.Drawing.Size(47, 17);
		this.limit_chk.TabIndex = 3;
		this.limit_chk.Text = "Limit";
		this.limit_chk.UseVisualStyleBackColor = true;
		this.limit_chk.CheckedChanged += new System.EventHandler(limit_chk_CheckedChanged);
		this.limit_cmb.FormattingEnabled = true;
		this.limit_cmb.Items.AddRange(new object[26]
		{
			"A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
			"K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
			"U", "V", "W", "X", "Y", "Z"
		});
		this.limit_cmb.Location = new System.Drawing.Point(535, 27);
		this.limit_cmb.Name = "limit_cmb";
		this.limit_cmb.Size = new System.Drawing.Size(74, 21);
		this.limit_cmb.TabIndex = 4;
		this.limit_cmb.Text = "A";
		this.limit_cmb.SelectedIndexChanged += new System.EventHandler(limit_cmb_SelectedIndexChanged);
		this.adddb_btn.Location = new System.Drawing.Point(615, 27);
		this.adddb_btn.Name = "adddb_btn";
		this.adddb_btn.Size = new System.Drawing.Size(47, 23);
		this.adddb_btn.TabIndex = 5;
		this.adddb_btn.Text = "Add";
		this.adddb_btn.UseVisualStyleBackColor = true;
		this.adddb_btn.Click += new System.EventHandler(adddb_btn_Click);
		this.dbManage_btn.Location = new System.Drawing.Point(668, 27);
		this.dbManage_btn.Name = "dbManage_btn";
		this.dbManage_btn.Size = new System.Drawing.Size(83, 23);
		this.dbManage_btn.TabIndex = 6;
		this.dbManage_btn.Text = "Manage";
		this.dbManage_btn.UseVisualStyleBackColor = true;
		this.dbManage_btn.Click += new System.EventHandler(dbManage_btn_Click);
		this.status_strp.Location = new System.Drawing.Point(0, 683);
		this.status_strp.Name = "status_strp";
		this.status_strp.Size = new System.Drawing.Size(764, 22);
		this.status_strp.SizingGrip = false;
		this.status_strp.TabIndex = 7;
		this.status_txt.Name = "status_txt";
		this.status_txt.Size = new System.Drawing.Size(77, 17);
		this.status_txt.Text = "Server Status:";
		this.quickChart_btn.Location = new System.Drawing.Point(427, 567);
		this.quickChart_btn.Name = "quickChart_btn";
		this.quickChart_btn.Size = new System.Drawing.Size(75, 23);
		this.quickChart_btn.TabIndex = 8;
		this.quickChart_btn.Text = "QuickChart";
		this.quickChart_btn.UseVisualStyleBackColor = true;
		this.quickChart_btn.Click += new System.EventHandler(button1_Click);
		this.addc_btn.Location = new System.Drawing.Point(136, 567);
		this.addc_btn.Name = "addc_btn";
		this.addc_btn.Size = new System.Drawing.Size(75, 23);
		this.addc_btn.TabIndex = 9;
		this.addc_btn.Text = "Add Client";
		this.addc_btn.UseVisualStyleBackColor = true;
		this.addc_btn.Click += new System.EventHandler(addc_btn_Click);
		this.edit_btn.Location = new System.Drawing.Point(217, 567);
		this.edit_btn.Name = "edit_btn";
		this.edit_btn.Size = new System.Drawing.Size(85, 23);
		this.edit_btn.TabIndex = 10;
		this.edit_btn.Text = "Edit / View";
		this.edit_btn.UseVisualStyleBackColor = true;
		this.edit_btn.Click += new System.EventHandler(edit_btn_Click);
		this.copy_btn.Location = new System.Drawing.Point(217, 596);
		this.copy_btn.Name = "copy_btn";
		this.copy_btn.Size = new System.Drawing.Size(85, 23);
		this.copy_btn.TabIndex = 11;
		this.copy_btn.Text = "Copy Selected";
		this.copy_btn.UseVisualStyleBackColor = true;
		this.copy_btn.Click += new System.EventHandler(copy_btn_Click);
		this.button5.Enabled = false;
		this.button5.Location = new System.Drawing.Point(308, 567);
		this.button5.Name = "button5";
		this.button5.Size = new System.Drawing.Size(113, 23);
		this.button5.TabIndex = 13;
		this.button5.Text = "Criteria";
		this.button5.UseVisualStyleBackColor = true;
		this.button6.Enabled = false;
		this.button6.Location = new System.Drawing.Point(308, 596);
		this.button6.Name = "button6";
		this.button6.Size = new System.Drawing.Size(113, 23);
		this.button6.TabIndex = 14;
		this.button6.Text = "Find Client";
		this.button6.UseVisualStyleBackColor = true;
		this.button7.Enabled = false;
		this.button7.Location = new System.Drawing.Point(308, 625);
		this.button7.Name = "button7";
		this.button7.Size = new System.Drawing.Size(113, 23);
		this.button7.TabIndex = 15;
		this.button7.Text = "Profiler";
		this.button7.UseVisualStyleBackColor = true;
		this.button8.Enabled = false;
		this.button8.Location = new System.Drawing.Point(308, 654);
		this.button8.Name = "button8";
		this.button8.Size = new System.Drawing.Size(113, 23);
		this.button8.TabIndex = 16;
		this.button8.Text = "Numerology Search";
		this.button8.UseVisualStyleBackColor = true;
		this.charts_btn.Enabled = false;
		this.charts_btn.Location = new System.Drawing.Point(427, 596);
		this.charts_btn.Name = "charts_btn";
		this.charts_btn.Size = new System.Drawing.Size(75, 23);
		this.charts_btn.TabIndex = 17;
		this.charts_btn.Text = "Charts";
		this.charts_btn.UseVisualStyleBackColor = true;
		this.multiChart_btn.Location = new System.Drawing.Point(427, 625);
		this.multiChart_btn.Name = "multiChart_btn";
		this.multiChart_btn.Size = new System.Drawing.Size(75, 23);
		this.multiChart_btn.TabIndex = 18;
		this.multiChart_btn.Text = "Multi Charts";
		this.multiChart_btn.UseVisualStyleBackColor = true;
		this.multiChart_btn.Click += new System.EventHandler(multiChart_btn_Click);
		this.button11.Enabled = false;
		this.button11.Location = new System.Drawing.Point(508, 567);
		this.button11.Name = "button11";
		this.button11.Size = new System.Drawing.Size(142, 23);
		this.button11.TabIndex = 19;
		this.button11.Text = "Relatioship Explorer";
		this.button11.UseVisualStyleBackColor = true;
		this.button12.Enabled = false;
		this.button12.Location = new System.Drawing.Point(508, 596);
		this.button12.Name = "button12";
		this.button12.Size = new System.Drawing.Size(142, 23);
		this.button12.TabIndex = 20;
		this.button12.Text = "Relationship Maintanence";
		this.button12.UseVisualStyleBackColor = true;
		this.menuStrip1.BackColor = System.Drawing.SystemColors.Control;
		this.menuStrip1.BackgroundImageLayout = System.Windows.Forms.ImageLayout.None;
		this.menuStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[1] { this.fileToolStripMenuItem });
		this.menuStrip1.Location = new System.Drawing.Point(0, 0);
		this.menuStrip1.Name = "menuStrip1";
		this.menuStrip1.RenderMode = System.Windows.Forms.ToolStripRenderMode.Professional;
		this.menuStrip1.Size = new System.Drawing.Size(764, 24);
		this.menuStrip1.TabIndex = 21;
		this.menuStrip1.Text = "menuStrip1";
		this.menuStrip1.ItemClicked += new System.Windows.Forms.ToolStripItemClickedEventHandler(menuStrip1_ItemClicked);
		this.fileToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[2] { this.logoutToolStripMenuItem, this.quitToolStripMenuItem });
		this.fileToolStripMenuItem.Name = "fileToolStripMenuItem";
		this.fileToolStripMenuItem.Size = new System.Drawing.Size(37, 20);
		this.fileToolStripMenuItem.Text = "File";
		this.logoutToolStripMenuItem.Name = "logoutToolStripMenuItem";
		this.logoutToolStripMenuItem.Size = new System.Drawing.Size(112, 22);
		this.logoutToolStripMenuItem.Text = "Logout";
		this.logoutToolStripMenuItem.Click += new System.EventHandler(logoutToolStripMenuItem_Click);
		this.quitToolStripMenuItem.Name = "quitToolStripMenuItem";
		this.quitToolStripMenuItem.Size = new System.Drawing.Size(112, 22);
		this.quitToolStripMenuItem.Text = "Quit";
		this.quitToolStripMenuItem.Click += new System.EventHandler(quitToolStripMenuItem_Click);
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(764, 705);
		base.Controls.Add(this.button12);
		base.Controls.Add(this.button11);
		base.Controls.Add(this.multiChart_btn);
		base.Controls.Add(this.charts_btn);
		base.Controls.Add(this.button8);
		base.Controls.Add(this.button7);
		base.Controls.Add(this.button6);
		base.Controls.Add(this.button5);
		base.Controls.Add(this.copy_btn);
		base.Controls.Add(this.edit_btn);
		base.Controls.Add(this.addc_btn);
		base.Controls.Add(this.quickChart_btn);
		base.Controls.Add(this.status_strp);
		base.Controls.Add(this.menuStrip1);
		base.Controls.Add(this.dbManage_btn);
		base.Controls.Add(this.adddb_btn);
		base.Controls.Add(this.limit_cmb);
		base.Controls.Add(this.limit_chk);
		base.Controls.Add(this.db_cmb);
		base.Controls.Add(this.label1);
		base.Controls.Add(this.ClientList_dgv);
		base.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.MainMenuStrip = this.menuStrip1;
		base.MaximizeBox = false;
		base.Name = "pass_main";
		base.SizeGripStyle = System.Windows.Forms.SizeGripStyle.Hide;
		this.Text = "Pass 3";
		base.Load += new System.EventHandler(Form1_Load);
		((System.ComponentModel.ISupportInitialize)this.ClientList_dgv).EndInit();
		this.menuStrip1.ResumeLayout(false);
		this.menuStrip1.PerformLayout();
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
