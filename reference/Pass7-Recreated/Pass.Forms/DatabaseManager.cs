using System;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Windows.Forms;
using Pass.Dialogs;

namespace Pass.Forms;

public class DatabaseManager : Form
{
	private Database dbMan;

	private DataTable dbList;

	private bool isFinished;

	private double index = -1.0;

	private IContainer components;

	private ListBox dbList_lst;

	private Label label1;

	private Button add_btn;

	private Button copy_btn;

	private Button remove_btn;

	private Button close_btn;

	public DatabaseManager(Database databaseManager)
	{
		dbMan = databaseManager;
		InitializeComponent();
		base.FormClosed += pass_dbManager_FormClosed;
		base.StartPosition = FormStartPosition.CenterScreen;
	}

	private void pass_dbManager_FormClosed(object sender, FormClosedEventArgs e)
	{
		isFinished = true;
	}

	public static double Show(Form parent, Database databaseManager)
	{
		DatabaseManager databaseManager2 = new DatabaseManager(databaseManager);
		databaseManager2.ShowDialog(parent);
		while (!databaseManager2.isFinished)
		{
			Application.DoEvents();
		}
		return databaseManager2.index;
	}

	private void close_btn_Click(object sender, EventArgs e)
	{
		Close();
	}

	private void pass_dbManager_Load(object sender, EventArgs e)
	{
		updateList();
	}

	public void updateList()
	{
		dbList = dbMan.getDatabaseList();
		dbList_lst.Items.Clear();
		foreach (DataRow row in dbList.Rows)
		{
			dbList_lst.Items.Add(row["DbName"].ToString());
		}
	}

	private void add_btn_Click(object sender, EventArgs e)
	{
		InputData inputData = InputDialog.Show("Please name the new database", "Add New Database");
		if (!inputData.Canceled)
		{
			dbMan.addDatabase(inputData.Input);
		}
		updateList();
	}

	private void remove_btn_Click(object sender, EventArgs e)
	{
		index = (double)dbList.Rows[dbList_lst.SelectedIndex]["DbID"];
		dbMan.removeDatabase(index);
		updateList();
	}

	private void copy_btn_Click(object sender, EventArgs e)
	{
		InputData inputData = InputDialog.Show("Please name the new database", "Copy Exsisting Database");
		if (!inputData.Canceled)
		{
			index = (double)dbList.Rows[dbList_lst.SelectedIndex]["DbID"];
			dbMan.copyDatabase(inputData.Input, index);
		}
		updateList();
	}

	private void dbList_lst_SelectedIndexChanged(object sender, EventArgs e)
	{
		index = (double)dbList.Rows[dbList_lst.SelectedIndex]["DbID"];
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
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Pass.Forms.DatabaseManager));
		this.dbList_lst = new System.Windows.Forms.ListBox();
		this.label1 = new System.Windows.Forms.Label();
		this.add_btn = new System.Windows.Forms.Button();
		this.copy_btn = new System.Windows.Forms.Button();
		this.remove_btn = new System.Windows.Forms.Button();
		this.close_btn = new System.Windows.Forms.Button();
		base.SuspendLayout();
		this.dbList_lst.FormattingEnabled = true;
		this.dbList_lst.Location = new System.Drawing.Point(12, 25);
		this.dbList_lst.Name = "dbList_lst";
		this.dbList_lst.Size = new System.Drawing.Size(375, 290);
		this.dbList_lst.TabIndex = 0;
		this.dbList_lst.SelectedIndexChanged += new System.EventHandler(dbList_lst_SelectedIndexChanged);
		this.label1.AutoSize = true;
		this.label1.Location = new System.Drawing.Point(12, 9);
		this.label1.Name = "label1";
		this.label1.Size = new System.Drawing.Size(101, 13);
		this.label1.TabIndex = 1;
		this.label1.Text = "Avalible Databases:";
		this.add_btn.Location = new System.Drawing.Point(25, 321);
		this.add_btn.Name = "add_btn";
		this.add_btn.Size = new System.Drawing.Size(82, 23);
		this.add_btn.TabIndex = 2;
		this.add_btn.Text = "Add New";
		this.add_btn.UseVisualStyleBackColor = true;
		this.add_btn.Click += new System.EventHandler(add_btn_Click);
		this.copy_btn.Location = new System.Drawing.Point(113, 321);
		this.copy_btn.Name = "copy_btn";
		this.copy_btn.Size = new System.Drawing.Size(82, 23);
		this.copy_btn.TabIndex = 3;
		this.copy_btn.Text = "Copy As New";
		this.copy_btn.UseVisualStyleBackColor = true;
		this.copy_btn.Click += new System.EventHandler(copy_btn_Click);
		this.remove_btn.Location = new System.Drawing.Point(201, 321);
		this.remove_btn.Name = "remove_btn";
		this.remove_btn.Size = new System.Drawing.Size(82, 23);
		this.remove_btn.TabIndex = 4;
		this.remove_btn.Text = "Remove";
		this.remove_btn.UseVisualStyleBackColor = true;
		this.remove_btn.Click += new System.EventHandler(remove_btn_Click);
		this.close_btn.Location = new System.Drawing.Point(289, 321);
		this.close_btn.Name = "close_btn";
		this.close_btn.Size = new System.Drawing.Size(82, 23);
		this.close_btn.TabIndex = 5;
		this.close_btn.Text = "Done";
		this.close_btn.UseVisualStyleBackColor = true;
		this.close_btn.Click += new System.EventHandler(close_btn_Click);
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(399, 349);
		base.Controls.Add(this.close_btn);
		base.Controls.Add(this.remove_btn);
		base.Controls.Add(this.copy_btn);
		base.Controls.Add(this.add_btn);
		base.Controls.Add(this.label1);
		base.Controls.Add(this.dbList_lst);
		base.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.MaximizeBox = false;
		base.MinimizeBox = false;
		base.Name = "pass_dbManager";
		this.Text = "Database Manager - Pass 3";
		base.Load += new System.EventHandler(pass_dbManager_Load);
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
