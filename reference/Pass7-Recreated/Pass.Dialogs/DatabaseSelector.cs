using System;
using System.ComponentModel;
using System.Drawing;
using System.Windows.Forms;

namespace Pass.Dialogs;

public class DatabaseSelector : Form
{
	private bool isFinished;

	private double index = -1.0;

	private Database dbMan;

	private IContainer components;

	private Label label1;

	private ListBox dbList_lst;

	private Button cancel_btn;

	private Button select_btn;

	public DatabaseSelector(Database DatabaseManager)
	{
		dbMan = DatabaseManager;
		InitializeComponent();
	}

	public static double SelectDb(Form parent, Database databaseManager)
	{
		DatabaseSelector databaseSelector = new DatabaseSelector(databaseManager);
		databaseSelector.Show(parent);
		while (!databaseSelector.isFinished)
		{
			Application.DoEvents();
		}
		return databaseSelector.index;
	}

	private void cancel_btn_Click(object sender, EventArgs e)
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
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Pass.Dialogs.DatabaseSelector));
		this.label1 = new System.Windows.Forms.Label();
		this.dbList_lst = new System.Windows.Forms.ListBox();
		this.cancel_btn = new System.Windows.Forms.Button();
		this.select_btn = new System.Windows.Forms.Button();
		base.SuspendLayout();
		this.label1.AutoSize = true;
		this.label1.Location = new System.Drawing.Point(12, 9);
		this.label1.Name = "label1";
		this.label1.Size = new System.Drawing.Size(101, 13);
		this.label1.TabIndex = 3;
		this.label1.Text = "Avalible Databases:";
		this.dbList_lst.FormattingEnabled = true;
		this.dbList_lst.Location = new System.Drawing.Point(12, 25);
		this.dbList_lst.Name = "dbList_lst";
		this.dbList_lst.Size = new System.Drawing.Size(375, 290);
		this.dbList_lst.TabIndex = 2;
		this.cancel_btn.Location = new System.Drawing.Point(312, 321);
		this.cancel_btn.Name = "cancel_btn";
		this.cancel_btn.Size = new System.Drawing.Size(75, 23);
		this.cancel_btn.TabIndex = 4;
		this.cancel_btn.Text = "Cancel";
		this.cancel_btn.UseVisualStyleBackColor = true;
		this.cancel_btn.Click += new System.EventHandler(cancel_btn_Click);
		this.select_btn.Location = new System.Drawing.Point(231, 321);
		this.select_btn.Name = "select_btn";
		this.select_btn.Size = new System.Drawing.Size(75, 23);
		this.select_btn.TabIndex = 5;
		this.select_btn.Text = "Select";
		this.select_btn.UseVisualStyleBackColor = true;
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(399, 354);
		base.Controls.Add(this.select_btn);
		base.Controls.Add(this.cancel_btn);
		base.Controls.Add(this.label1);
		base.Controls.Add(this.dbList_lst);
		base.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedToolWindow;
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.Name = "pass_selectDatabase";
		this.Text = "Select Database - Pass 3";
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
