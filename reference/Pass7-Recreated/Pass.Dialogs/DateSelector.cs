using System;
using System.ComponentModel;
using System.Drawing;
using System.Windows.Forms;

namespace Pass.Dialogs;

public class DateSelector : Form
{
	private bool isReady;

	private PassDate date;

	private IContainer components;

	private MonthCalendar monthCalendar1;

	private Button button1;

	public DateSelector()
	{
		InitializeComponent();
		monthCalendar1.TodayDate = DateTime.Now;
		date.Day = monthCalendar1.SelectionStart.Day;
		date.Month = monthCalendar1.SelectionStart.Month;
		date.Year = monthCalendar1.SelectionStart.Year;
	}

	public static PassDate SelectDate(Form p, PassDate Date)
	{
		DateSelector dateSelector = new DateSelector();
		dateSelector.date = Date;
		dateSelector.monthCalendar1.SetDate(new DateTime(Date.Year, Date.Month, Date.Day));
		dateSelector.ShowDialog(p);
		while (!dateSelector.isReady)
		{
			Application.DoEvents();
		}
		return dateSelector.date;
	}

	public static PassDate SelectDate(Form p)
	{
		DateSelector dateSelector = new DateSelector();
		dateSelector.ShowDialog(p);
		while (!dateSelector.isReady)
		{
			Application.DoEvents();
		}
		return dateSelector.date;
	}

	private void monthCalendar1_DateChanged(object sender, DateRangeEventArgs e)
	{
		date.Day = e.Start.Day;
		date.Month = e.Start.Month;
		date.Year = e.Start.Year;
	}

	private void button1_Click(object sender, EventArgs e)
	{
		isReady = true;
		Close();
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
		this.monthCalendar1 = new System.Windows.Forms.MonthCalendar();
		this.button1 = new System.Windows.Forms.Button();
		base.SuspendLayout();
		this.monthCalendar1.Location = new System.Drawing.Point(4, 4);
		this.monthCalendar1.MaxSelectionCount = 1;
		this.monthCalendar1.Name = "monthCalendar1";
		this.monthCalendar1.ShowToday = false;
		this.monthCalendar1.ShowTodayCircle = false;
		this.monthCalendar1.TabIndex = 0;
		this.monthCalendar1.TodayDate = new System.DateTime(2010, 2, 4, 0, 0, 0, 0);
		this.monthCalendar1.DateChanged += new System.Windows.Forms.DateRangeEventHandler(monthCalendar1_DateChanged);
		this.button1.Location = new System.Drawing.Point(4, 167);
		this.button1.Name = "button1";
		this.button1.Size = new System.Drawing.Size(227, 23);
		this.button1.TabIndex = 1;
		this.button1.Text = "OK";
		this.button1.UseVisualStyleBackColor = true;
		this.button1.Click += new System.EventHandler(button1_Click);
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(234, 193);
		base.ControlBox = false;
		base.Controls.Add(this.button1);
		base.Controls.Add(this.monthCalendar1);
		base.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedToolWindow;
		base.MaximizeBox = false;
		base.MinimizeBox = false;
		base.Name = "pass_dateSelector";
		base.SizeGripStyle = System.Windows.Forms.SizeGripStyle.Hide;
		this.Text = "Select a Date";
		base.ResumeLayout(false);
	}
}
