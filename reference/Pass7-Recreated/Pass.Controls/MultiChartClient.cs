using System;
using System.ComponentModel;
using System.Drawing;
using System.Windows.Forms;
using Pass.Forms;

namespace Pass.Controls;

public class MultiChartClient : UserControl
{
	private Report _report;

	private int _offset;

	private ChartType _type;

	private IContainer components;

	private Button button1;

	private Label name_txt;

	private Label dob_txt;

	private Panel panel1;

	public MultichartCtrl chart;

	public ChartType Type
	{
		get
		{
			return _type;
		}
		set
		{
			_type = value;
			chart.Type = value;
		}
	}

	public Report Report
	{
		get
		{
			return _report;
		}
		set
		{
			_report = value;
			UpdateDetails();
		}
	}

	public int Offset
	{
		get
		{
			return _offset;
		}
		set
		{
			_offset = value;
			chart.Offset = value + _report.Age;
		}
	}

	public MultiChartClient()
	{
		_report = new Report("John Smith", "1/1/1990");
		InitializeComponent();
		MultiChartClient_Resize(this, null);
		chart.Report = _report;
	}

	private void MultiChartClient_BackColorChanged(object sender, EventArgs e)
	{
		chart.BackColor = BackColor;
	}

	private void MultiChartClient_Resize(object sender, EventArgs e)
	{
		chart.Width = base.Width - panel1.Width - 3;
	}

	private void button1_Click(object sender, EventArgs e)
	{
		QuickForm quickForm = new QuickForm();
		quickForm.SetDetails(_report.FullName, _report.DOB);
		quickForm.Show();
	}

	private void UpdateDetails()
	{
		chart.Report = _report;
		name_txt.Text = _report.FullName;
		dob_txt.Text = _report.DOB;
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
		Pass.Report report = new Pass.Report("John Smith", "1/1/1990");
		this.button1 = new System.Windows.Forms.Button();
		this.name_txt = new System.Windows.Forms.Label();
		this.dob_txt = new System.Windows.Forms.Label();
		this.panel1 = new System.Windows.Forms.Panel();
		this.chart = new Pass.Controls.MultichartCtrl();
		this.panel1.SuspendLayout();
		((System.ComponentModel.ISupportInitialize)this.chart).BeginInit();
		base.SuspendLayout();
		this.button1.Location = new System.Drawing.Point(100, 72);
		this.button1.Name = "button1";
		this.button1.Size = new System.Drawing.Size(75, 23);
		this.button1.TabIndex = 0;
		this.button1.Text = "QuickChart";
		this.button1.UseVisualStyleBackColor = true;
		this.button1.Click += new System.EventHandler(button1_Click);
		this.name_txt.AutoSize = true;
		this.name_txt.Font = new System.Drawing.Font("Courier New", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.name_txt.Location = new System.Drawing.Point(3, 3);
		this.name_txt.Name = "name_txt";
		this.name_txt.Size = new System.Drawing.Size(88, 16);
		this.name_txt.TabIndex = 1;
		this.name_txt.Text = "John Smith";
		this.dob_txt.AutoSize = true;
		this.dob_txt.Font = new System.Drawing.Font("Courier New", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.dob_txt.Location = new System.Drawing.Point(3, 19);
		this.dob_txt.Name = "dob_txt";
		this.dob_txt.Size = new System.Drawing.Size(88, 16);
		this.dob_txt.TabIndex = 2;
		this.dob_txt.Text = "01/01/1990";
		this.panel1.BackColor = System.Drawing.SystemColors.Info;
		this.panel1.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
		this.panel1.Controls.Add(this.button1);
		this.panel1.Controls.Add(this.dob_txt);
		this.panel1.Controls.Add(this.name_txt);
		this.panel1.Dock = System.Windows.Forms.DockStyle.Left;
		this.panel1.Location = new System.Drawing.Point(0, 0);
		this.panel1.Name = "panel1";
		this.panel1.Size = new System.Drawing.Size(180, 100);
		this.panel1.TabIndex = 3;
		this.chart.BackColor = System.Drawing.SystemColors.ControlLightLight;
		this.chart.Color1 = System.Drawing.Color.OrangeRed;
		this.chart.Color2 = System.Drawing.Color.OrangeRed;
		this.chart.Color3 = System.Drawing.Color.Blue;
		this.chart.Color4 = System.Drawing.Color.Turquoise;
		this.chart.Color5 = System.Drawing.Color.Blue;
		this.chart.Color6 = System.Drawing.Color.Green;
		this.chart.Dock = System.Windows.Forms.DockStyle.Right;
		this.chart.Font = new System.Drawing.Font("Consolas", 9f);
		this.chart.Location = new System.Drawing.Point(244, 0);
		this.chart.Name = "chart";
		this.chart.Offset = 26;
		this.chart.Report = report;
		this.chart.Size = new System.Drawing.Size(625, 100);
		this.chart.TabIndex = 0;
		this.chart.Type = Pass.Controls.ChartType.Years;
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.Controls.Add(this.chart);
		base.Controls.Add(this.panel1);
		this.MaximumSize = new System.Drawing.Size(10000, 100);
		this.MinimumSize = new System.Drawing.Size(2, 100);
		base.Name = "passMultiChartClient";
		base.Size = new System.Drawing.Size(869, 100);
		base.BackColorChanged += new System.EventHandler(MultiChartClient_BackColorChanged);
		base.Resize += new System.EventHandler(MultiChartClient_Resize);
		this.panel1.ResumeLayout(false);
		this.panel1.PerformLayout();
		((System.ComponentModel.ISupportInitialize)this.chart).EndInit();
		base.ResumeLayout(false);
	}
}
