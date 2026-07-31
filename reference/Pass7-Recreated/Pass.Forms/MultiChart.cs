using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Windows.Forms;
using Pass.Controls;
using Pass.Dialogs;

namespace Pass.Forms;

public class MultiChart : Form
{
	private class thingy
	{
		public string Name;

		public string DOB;

		public Report Report;

		public MultiChartClient Chart;
	}

	private ChartType mode;

	private IList<thingy> _clientList = new List<thingy>();

	private int _clientCount;

	private int _previousY;

	private Bitmap _offscreenBMP;

	private Graphics _offscreenDC;

	private Graphics _onscreenDC;

	private List<MultiChartClient> pmcList = new List<MultiChartClient>();

	private PassDate Curdate;

	private IContainer components;

	private Panel ChartPanel;

	private TrackBar OffsetTrackBar;

	private Button ToggleMonthsYearsBtn;

	private Button close_btn;

	private Button print_btn;

	private VScrollBar vScrollBar_sb;

	private Panel ControlPanel;

	private NumericUpDown date_txt;

	private NumericUpDown numericUpDown2;

	private NumericUpDown numericUpDown1;

	private Label label3;

	private Label label2;

	private Label label1;

	public MultiChart()
	{
		InitializeComponent();
		ChartPanel.MouseWheel += panel1_MouseWheel;
		vScrollBar_sb.Scroll += vScrollBar_sb_Scroll;
		vScrollBar_sb.Minimum = 0;
		vScrollBar_sb.LargeChange = ChartPanel.Height;
		vScrollBar_sb.SmallChange = 100;
		Curdate.Year = DateTime.Now.Year;
		Curdate.Month = DateTime.Now.Month;
		Curdate.Day = DateTime.Now.Day;
		_offscreenBMP = new Bitmap(1000, 300);
		_offscreenDC = Graphics.FromImage(_offscreenBMP);
		_onscreenDC = CreateGraphics();
		PassMultichartResize(this, null);
		SetStyle(ControlStyles.DoubleBuffer, value: true);
	}

	private void panel1_MouseWheel(object sender, MouseEventArgs e)
	{
		int num = -e.Delta;
		if (vScrollBar_sb.Value + num > vScrollBar_sb.Maximum)
		{
			num = vScrollBar_sb.Maximum - vScrollBar_sb.Value;
		}
		else if (vScrollBar_sb.Value + num < vScrollBar_sb.Minimum)
		{
			num = vScrollBar_sb.Minimum - vScrollBar_sb.Value;
		}
		vScrollBar_sb.Value += num;
		vScrollBar_sb_Scroll(this, null);
	}

	private void vScrollBar_sb_Scroll(object sender, ScrollEventArgs e)
	{
		int num = 0;
		foreach (MultiChartClient pmc in pmcList)
		{
			pmc.Location = new Point(pmc.Location.X, num - vScrollBar_sb.Value);
			num += pmc.Height;
		}
	}

	public void AddClient(string Name, string DOB)
	{
		Report report = new Report(Name, DOB);
		MultiChartClient multiChartClient = new MultiChartClient();
		_clientList.Add(new thingy
		{
			Name = Name,
			DOB = DOB,
			Report = report,
			Chart = multiChartClient
		});
		multiChartClient.Report = report;
		multiChartClient.Location = new Point(3, _previousY);
		ChartPanel.Controls.Add(multiChartClient);
		pmcList.Add(multiChartClient);
		_previousY = multiChartClient.Location.Y + multiChartClient.Height;
		if (_previousY > ChartPanel.Height)
		{
			vScrollBar_sb.Maximum = _previousY;
		}
	}

	private void OffsetTrackBar_Scroll(object sender, EventArgs e)
	{
		Goto(OffsetTrackBar.Value);
	}

	private void Goto(int offset)
	{
		foreach (MultiChartClient pmc in pmcList)
		{
			pmc.Offset = offset;
		}
		date_txt.Text = (DateTime.Now.Year + offset).ToString();
	}

	private void button1_Click_1(object sender, EventArgs e)
	{
		QuickChart quickChart = new QuickChart();
		int index = int.Parse(((Button)sender).Name);
		quickChart.setDetails(_clientList[index].Name, _clientList[index].DOB);
		quickChart.Show();
	}

	private void pass_multichart_Load(object sender, EventArgs e)
	{
	}

	private void ToggleMonthsYearsBtn_Click(object sender, EventArgs e)
	{
		if (mode == ChartType.Years)
		{
			mode = ChartType.Months;
			ToggleMonthsYearsBtn.Text = "View Years";
		}
		else if (mode == ChartType.Months)
		{
			mode = ChartType.Years;
			ToggleMonthsYearsBtn.Text = "View Months";
		}
		foreach (MultiChartClient pmc in pmcList)
		{
			pmc.Type = mode;
		}
	}

	private void CloseBtn_Click(object sender, EventArgs e)
	{
		Close();
	}

	private void PrintBtn_Click(object sender, EventArgs e)
	{
		PdfDocument pdfDocument = new PdfDocument();
		foreach (thingy client in _clientList)
		{
			MultichartCtrl chart = client.Chart.chart;
			pdfDocument.addClient(chart.Report.FullName, chart.Report.DOB);
		}
		pdfDocument.ChartType = DocumentType.MultiChart;
		pdfDocument.ChartPart = ((mode != ChartType.Months) ? DocumentPart.Years : DocumentPart.Months);
		pdfDocument.setOffsets(OffsetTrackBar.Value, OffsetTrackBar.Value, OffsetTrackBar.Value);
		pdfDocument.GenerateChart();
	}

	private void GotoBtn_Click(object sender, EventArgs e)
	{
		int num = int.Parse(date_txt.Text);
		OffsetTrackBar.Value = num - DateTime.Now.Year;
		Goto(OffsetTrackBar.Value);
	}

	private void PassMultichartResize(object sender, EventArgs e)
	{
		ChartPanel.Height = ControlPanel.Location.Y - 3;
		vScrollBar_sb.LargeChange = ChartPanel.Height;
		Point location = date_txt.Location;
		location.X = base.Width / 2 - date_txt.Width / 2;
		date_txt.Location = location;
		foreach (MultiChartClient pmc in pmcList)
		{
			pmc.Width = ChartPanel.Width - 6;
		}
	}

	private void numericUpDown1_ValueChanged(object sender, EventArgs e)
	{
		OffsetTrackBar.Minimum = (int)numericUpDown1.Value;
	}

	private void numericUpDown2_ValueChanged(object sender, EventArgs e)
	{
		OffsetTrackBar.Maximum = (int)numericUpDown2.Value;
	}

	private void date_txt_ValueChanged(object sender, EventArgs e)
	{
		try
		{
			int num = (int)date_txt.Value - DateTime.Now.Year;
			if (numericUpDown1.Value > (decimal)num)
			{
				numericUpDown1.Value = num;
			}
			if (numericUpDown2.Value < (decimal)num)
			{
				numericUpDown2.Value = num;
			}
			OffsetTrackBar.Value = num;
			Goto(OffsetTrackBar.Value);
		}
		catch (Exception)
		{
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
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Pass.Forms.MultiChart));
		this.ChartPanel = new System.Windows.Forms.Panel();
		this.vScrollBar_sb = new System.Windows.Forms.VScrollBar();
		this.OffsetTrackBar = new System.Windows.Forms.TrackBar();
		this.ToggleMonthsYearsBtn = new System.Windows.Forms.Button();
		this.close_btn = new System.Windows.Forms.Button();
		this.print_btn = new System.Windows.Forms.Button();
		this.ControlPanel = new System.Windows.Forms.Panel();
		this.label3 = new System.Windows.Forms.Label();
		this.label2 = new System.Windows.Forms.Label();
		this.label1 = new System.Windows.Forms.Label();
		this.numericUpDown2 = new System.Windows.Forms.NumericUpDown();
		this.numericUpDown1 = new System.Windows.Forms.NumericUpDown();
		this.date_txt = new System.Windows.Forms.NumericUpDown();
		this.ChartPanel.SuspendLayout();
		((System.ComponentModel.ISupportInitialize)this.OffsetTrackBar).BeginInit();
		this.ControlPanel.SuspendLayout();
		((System.ComponentModel.ISupportInitialize)this.numericUpDown2).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.numericUpDown1).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.date_txt).BeginInit();
		base.SuspendLayout();
		this.ChartPanel.BackColor = System.Drawing.SystemColors.ControlLightLight;
		this.ChartPanel.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
		this.ChartPanel.Controls.Add(this.vScrollBar_sb);
		this.ChartPanel.Dock = System.Windows.Forms.DockStyle.Top;
		this.ChartPanel.Location = new System.Drawing.Point(0, 0);
		this.ChartPanel.Name = "ChartPanel";
		this.ChartPanel.Size = new System.Drawing.Size(884, 583);
		this.ChartPanel.TabIndex = 0;
		this.vScrollBar_sb.Dock = System.Windows.Forms.DockStyle.Right;
		this.vScrollBar_sb.LargeChange = 2;
		this.vScrollBar_sb.Location = new System.Drawing.Point(863, 0);
		this.vScrollBar_sb.Maximum = 1;
		this.vScrollBar_sb.Name = "vScrollBar_sb";
		this.vScrollBar_sb.Size = new System.Drawing.Size(17, 579);
		this.vScrollBar_sb.SmallChange = 2;
		this.vScrollBar_sb.TabIndex = 0;
		this.OffsetTrackBar.Anchor = System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left | System.Windows.Forms.AnchorStyles.Right;
		this.OffsetTrackBar.Location = new System.Drawing.Point(84, 41);
		this.OffsetTrackBar.Maximum = 150;
		this.OffsetTrackBar.Minimum = -150;
		this.OffsetTrackBar.Name = "OffsetTrackBar";
		this.OffsetTrackBar.Size = new System.Drawing.Size(716, 45);
		this.OffsetTrackBar.TabIndex = 1;
		this.OffsetTrackBar.Scroll += new System.EventHandler(OffsetTrackBar_Scroll);
		this.ToggleMonthsYearsBtn.Location = new System.Drawing.Point(3, 3);
		this.ToggleMonthsYearsBtn.Name = "ToggleMonthsYearsBtn";
		this.ToggleMonthsYearsBtn.Size = new System.Drawing.Size(96, 23);
		this.ToggleMonthsYearsBtn.TabIndex = 2;
		this.ToggleMonthsYearsBtn.Text = "View Months";
		this.ToggleMonthsYearsBtn.UseVisualStyleBackColor = true;
		this.ToggleMonthsYearsBtn.Click += new System.EventHandler(ToggleMonthsYearsBtn_Click);
		this.close_btn.Anchor = System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right;
		this.close_btn.Location = new System.Drawing.Point(806, 3);
		this.close_btn.Name = "close_btn";
		this.close_btn.Size = new System.Drawing.Size(75, 23);
		this.close_btn.TabIndex = 3;
		this.close_btn.Text = "Close";
		this.close_btn.UseVisualStyleBackColor = true;
		this.close_btn.Click += new System.EventHandler(CloseBtn_Click);
		this.print_btn.Anchor = System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right;
		this.print_btn.Location = new System.Drawing.Point(715, 3);
		this.print_btn.Name = "print_btn";
		this.print_btn.Size = new System.Drawing.Size(75, 23);
		this.print_btn.TabIndex = 3;
		this.print_btn.Text = "Print";
		this.print_btn.UseVisualStyleBackColor = true;
		this.print_btn.Click += new System.EventHandler(PrintBtn_Click);
		this.ControlPanel.Controls.Add(this.label3);
		this.ControlPanel.Controls.Add(this.label2);
		this.ControlPanel.Controls.Add(this.label1);
		this.ControlPanel.Controls.Add(this.numericUpDown2);
		this.ControlPanel.Controls.Add(this.numericUpDown1);
		this.ControlPanel.Controls.Add(this.date_txt);
		this.ControlPanel.Controls.Add(this.ToggleMonthsYearsBtn);
		this.ControlPanel.Controls.Add(this.OffsetTrackBar);
		this.ControlPanel.Controls.Add(this.close_btn);
		this.ControlPanel.Controls.Add(this.print_btn);
		this.ControlPanel.Dock = System.Windows.Forms.DockStyle.Bottom;
		this.ControlPanel.Location = new System.Drawing.Point(0, 589);
		this.ControlPanel.Name = "ControlPanel";
		this.ControlPanel.Size = new System.Drawing.Size(884, 73);
		this.ControlPanel.TabIndex = 5;
		this.label3.Anchor = System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right;
		this.label3.AutoSize = true;
		this.label3.Location = new System.Drawing.Point(806, 34);
		this.label3.Name = "label3";
		this.label3.Size = new System.Drawing.Size(75, 13);
		this.label3.TabIndex = 10;
		this.label3.Text = "Maximum Limit";
		this.label2.AutoSize = true;
		this.label2.Location = new System.Drawing.Point(3, 34);
		this.label2.Name = "label2";
		this.label2.Size = new System.Drawing.Size(72, 13);
		this.label2.TabIndex = 9;
		this.label2.Text = "Minimum Limit";
		this.label1.Anchor = System.Windows.Forms.AnchorStyles.Bottom;
		this.label1.AutoSize = true;
		this.label1.Location = new System.Drawing.Point(316, 8);
		this.label1.Name = "label1";
		this.label1.Size = new System.Drawing.Size(79, 13);
		this.label1.TabIndex = 8;
		this.label1.Text = "Focus on Year:";
		this.numericUpDown2.Anchor = System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right;
		this.numericUpDown2.Location = new System.Drawing.Point(806, 50);
		this.numericUpDown2.Maximum = new decimal(new int[4] { 2147483647, 0, 0, 0 });
		this.numericUpDown2.Minimum = new decimal(new int[4] { -2147483648, 0, 0, -2147483648 });
		this.numericUpDown2.Name = "numericUpDown2";
		this.numericUpDown2.Size = new System.Drawing.Size(75, 20);
		this.numericUpDown2.TabIndex = 7;
		this.numericUpDown2.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
		this.numericUpDown2.Value = new decimal(new int[4] { 150, 0, 0, 0 });
		this.numericUpDown2.ValueChanged += new System.EventHandler(numericUpDown2_ValueChanged);
		this.numericUpDown1.Anchor = System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left;
		this.numericUpDown1.Location = new System.Drawing.Point(3, 50);
		this.numericUpDown1.Maximum = new decimal(new int[4] { 2147483647, 0, 0, 0 });
		this.numericUpDown1.Minimum = new decimal(new int[4] { -2147483648, 0, 0, -2147483648 });
		this.numericUpDown1.Name = "numericUpDown1";
		this.numericUpDown1.Size = new System.Drawing.Size(75, 20);
		this.numericUpDown1.TabIndex = 6;
		this.numericUpDown1.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
		this.numericUpDown1.Value = new decimal(new int[4] { 150, 0, 0, -2147483648 });
		this.numericUpDown1.ValueChanged += new System.EventHandler(numericUpDown1_ValueChanged);
		this.date_txt.Anchor = System.Windows.Forms.AnchorStyles.Bottom;
		this.date_txt.Location = new System.Drawing.Point(401, 6);
		this.date_txt.Maximum = new decimal(new int[4] { 2147483647, 0, 0, 0 });
		this.date_txt.Minimum = new decimal(new int[4] { -2147483648, 0, 0, -2147483648 });
		this.date_txt.Name = "date_txt";
		this.date_txt.Size = new System.Drawing.Size(76, 20);
		this.date_txt.TabIndex = 5;
		this.date_txt.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
		this.date_txt.Value = new decimal(new int[4] { 2016, 0, 0, 0 });
		this.date_txt.ValueChanged += new System.EventHandler(date_txt_ValueChanged);
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(884, 662);
		base.Controls.Add(this.ControlPanel);
		base.Controls.Add(this.ChartPanel);
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		this.MinimumSize = new System.Drawing.Size(820, 310);
		base.Name = "MultiChart";
		this.Text = "pass_multichart";
		base.Load += new System.EventHandler(pass_multichart_Load);
		base.Resize += new System.EventHandler(PassMultichartResize);
		this.ChartPanel.ResumeLayout(false);
		((System.ComponentModel.ISupportInitialize)this.OffsetTrackBar).EndInit();
		this.ControlPanel.ResumeLayout(false);
		this.ControlPanel.PerformLayout();
		((System.ComponentModel.ISupportInitialize)this.numericUpDown2).EndInit();
		((System.ComponentModel.ISupportInitialize)this.numericUpDown1).EndInit();
		((System.ComponentModel.ISupportInitialize)this.date_txt).EndInit();
		base.ResumeLayout(false);
	}
}
