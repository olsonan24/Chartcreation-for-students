using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace Pass.Forms;

public class QuickForm : Form
{
	private Report _report;

	private string age1 = "";

	private string age10 = "";

	private string nameSep = " ";

	private string _name = "";

	private int min = -500;

	private int max;

	private int curr;

	private bool isMoving;

	private Point oldM;

	private Point newM;

	private const int WM_SETREDRAW = 11;

	private const int WM_USER = 1024;

	private const int EM_GETEVENTMASK = 1083;

	private const int EM_SETEVENTMASK = 1093;

	private IntPtr eventMask = IntPtr.Zero;

	private int drawStopCount;

	private IContainer components;

	private Label fullName_txt;

	private Label fullLetters_txt;

	private Label hdc_txt;

	private Label fullLettersPart_txt;

	private Label p_txt;

	private Label m_txt;

	private Label e_txt;

	private Label i_txt;

	private Label dob_txt;

	private Label bf_txt;

	private Label pn_txt;

	private Label cn_txt;

	private Label ug_txt;

	private Label age_txt;

	private Label s1_txt;

	private Label s2_txt;

	private Label s3_txt;

	private Label s4_txt;

	private Label ageInd_txt;

	private Label age10_txt;

	private Label age1_txt;

	private Label name1_txt;

	private Label name2_txt;

	private Label name3_txt;

	private Label name4_txt;

	private Label name5_txt;

	private Label name6_txt;

	private Label name7_txt;

	private Label name8_txt;

	private Label nameSep_txt;

	private Label ess_txt;

	private Label com_txt;

	private Label py_txt;

	private Label cy_txt;

	private TrackBar trackBar1;

	private Label ageInd2_txt;

	private Panel panel;

	private Label pym3_txt;

	private Label cm_txt;

	private Label pm3_txt;

	private Label mcom3_txt;

	private Label pme3_txt;

	private Label essm3_txt;

	private Label pym2_txt;

	private Label label2;

	private Label pm2_txt;

	private Label mcom2_txt;

	private Label pme2_txt;

	private Label essm2_txt;

	private Label pym1_txt;

	private Label label8;

	private Label pm1_txt;

	private Label mcom1_txt;

	private Label pme1_txt;

	private Label essm1_txt;

	private Label year3_txt;

	private Label year2_txt;

	private Label year1_txt;

	private TrackBar trackBar2;

	private Button button1;

	private Label ageind_big_txt;

	private Label cy_big_txt;

	private Label py_big_txt;

	private Label com_big_txt;

	private Label ess_big_txt;

	private Label name9_big_txt;

	private Label name8_big_txt;

	private Label name7_big_txt;

	private Label name6_big_txt;

	private Label age1_big_txt;

	private Label name5_big_txt;

	private Label age10_big_txt;

	private Label name4_big_txt;

	private Label name1_big_txt;

	private Label name3_big_txt;

	private Label name2_big_txt;

	private TrackBar trackBar3;

	private Label label1;

	private TextBox input_name_txt;

	private Button gen_btn;

	private TextBox input_dob_txt;

	private Label label3;

	private Panel panel1;

	private NumericUpDown YearNumber;

	private Label label4;

	private NumericUpDown AgeNumber;

	private Label label5;

	private NumericUpDown SlidersStop;

	private NumericUpDown SlidersStart;

	public Report Report
	{
		get
		{
			return _report;
		}
		set
		{
			_report = value;
			updateDetails();
		}
	}

	[DllImport("user32", CharSet = CharSet.Auto)]
	private static extern IntPtr SendMessage(IntPtr hWnd, int msg, int wParam, IntPtr lParam);

	public QuickForm()
	{
		InitializeComponent();
	}

	public void StopDrawing()
	{
		if (drawStopCount == 0)
		{
			SendMessage(base.Handle, 11, 0, IntPtr.Zero);
			eventMask = SendMessage(base.Handle, 1083, 0, IntPtr.Zero);
		}
		drawStopCount++;
	}

	public void StartDrawing()
	{
		drawStopCount--;
		if (drawStopCount == 0)
		{
			SendMessage(base.Handle, 1093, 0, eventMask);
			SendMessage(base.Handle, 11, 1, IntPtr.Zero);
			Invalidate();
			Refresh();
		}
	}

	private void pass_quickchart_Load(object sender, EventArgs e)
	{
		input_name_txt.Text = _report.FullName;
		input_dob_txt.Text = _report.DOB;
		trackBar2.Value = _report.Age;
		if (_report.Age - 9 < 0)
		{
			trackBar3.Value = 0;
		}
		else
		{
			trackBar3.Value = _report.Age - 9;
		}
		if (_report.Age - 25 < 0)
		{
			trackBar1.Value = 0;
		}
		else
		{
			trackBar1.Value = _report.Age - 25;
		}
	}

	public void SetDetails(string name, string dob)
	{
		_report = new Report(name, dob);
		updateDetails();
	}

	public void updateDetails()
	{
		Text = "QuickChart for " + _report.FullName + " - Pass 7";
		_name = _report.FullName;
		string text = "                                              ";
		int num = 0;
		int num2 = 0;
		for (int i = 0; i < 3000; i++)
		{
			nameSep += ":";
			age1 += num;
			if (num == 0)
			{
				age10 += num2;
				age10 += text.Substring(0, 10 - num2.ToString().Length);
				num2++;
			}
			num++;
			if (num > 9)
			{
				num = 0;
			}
		}
		AgeNumber.Value = _report.Age;
		hdc_txt.Text = _report.HDC + "  " + _report.HDCTotal;
		fullName_txt.Text = _name.Replace("&", "&&");
		fullLetters_txt.Text = _report.FullLetters + "  " + _report.FullLettersTotal;
		fullLettersPart_txt.Text = _report.FullLettersTotalPart;
		p_txt.Text = "P " + _report.PMEI[0];
		m_txt.Text = "M " + _report.PMEI[1];
		e_txt.Text = "E " + _report.PMEI[2];
		i_txt.Text = "I " + _report.PMEI[3];
		dob_txt.Text = _report.DOB;
		bf_txt.Text = _report.BirthForce;
		pn_txt.Text = _report.Pin;
		cn_txt.Text = _report.Cha;
		ug_txt.Text = "UG: " + _report.UltamateGoal;
		s1_txt.Text = _report.Seasons[0];
		s2_txt.Text = _report.Seasons[1];
		s3_txt.Text = _report.Seasons[2];
		s4_txt.Text = _report.Seasons[3];
		age_txt.Text = "Age: " + _report.Age;
		if (_report.Age - 25 < 0)
		{
			setYear(0);
		}
		else
		{
			setYear(_report.Age - 25);
		}
		if (_report.Age - 8 < 0)
		{
			setYearBig(0);
		}
		else
		{
			setYearBig(_report.Age - 9);
		}
		CenterMonthsatAge(_report.Age);
	}

	public void CenterMonthsatAge(int offset)
	{
		if (offset < 1)
		{
			offset = 1;
		}
		Report.MonthsSet monthSet = _report.GetMonthSet(offset - 1);
		essm3_txt.Text = Numerology.SpaceOutString(monthSet.Essence, skipSpace: false);
		pme3_txt.Text = Numerology.SpaceOutString(monthSet.PersonalMonthEssence, skipSpace: false);
		mcom3_txt.Text = Numerology.SpaceOutString(monthSet.Combined, skipSpace: false);
		pm3_txt.Text = Numerology.SpaceOutString(monthSet.PersonalMonth, skipSpace: false);
		pym3_txt.Text = Numerology.SpaceOutString(monthSet.PersonalYear, skipSpace: false);
		monthSet = _report.GetMonthSet(offset);
		essm2_txt.Text = Numerology.SpaceOutString(monthSet.Essence, skipSpace: false);
		pme2_txt.Text = Numerology.SpaceOutString(monthSet.PersonalMonthEssence, skipSpace: false);
		mcom2_txt.Text = Numerology.SpaceOutString(monthSet.Combined, skipSpace: false);
		pm2_txt.Text = Numerology.SpaceOutString(monthSet.PersonalMonth, skipSpace: false);
		pym2_txt.Text = Numerology.SpaceOutString(monthSet.PersonalYear, skipSpace: false);
		monthSet = _report.GetMonthSet(offset + 1);
		essm1_txt.Text = Numerology.SpaceOutString(monthSet.Essence, skipSpace: false);
		pme1_txt.Text = Numerology.SpaceOutString(monthSet.PersonalMonthEssence, skipSpace: false);
		mcom1_txt.Text = Numerology.SpaceOutString(monthSet.Combined, skipSpace: false);
		pm1_txt.Text = Numerology.SpaceOutString(monthSet.PersonalMonth, skipSpace: false);
		pym1_txt.Text = Numerology.SpaceOutString(monthSet.PersonalYear, skipSpace: false);
		year1_txt.Text = (DateTime.Now.Year - _report.Age + offset - 1).ToString();
		year2_txt.Text = (DateTime.Now.Year - _report.Age + offset).ToString();
		year3_txt.Text = (DateTime.Now.Year - _report.Age + offset + 1).ToString();
	}

	public void setYear(int age)
	{
		if (age < 0)
		{
			return;
		}
		int num = 50;
		int num2 = 0;
		num2 = age;
		if (age <= _report.Age && age + num > _report.Age)
		{
			string text = Numerology.SpaceOutString(new string(' ', _report.Age - age) + "*", skipSpace: false);
			ageInd_txt.Text = text;
			ageInd2_txt.Text = text;
		}
		else
		{
			ageInd_txt.Text = "";
			ageInd2_txt.Text = "";
		}
		age10 = (age1 = "");
		for (int i = age; i < age + num; i++)
		{
			age1 += i % 10;
			if (i % 10 == 0)
			{
				age10 = age10.PadRight(age1.Length - 1) + i / 10;
			}
		}
		age1_txt.Text = Numerology.SpaceOutString(age1, skipSpace: false);
		age10_txt.Text = Numerology.SpaceOutString(age10.PadRight(num).Substring(0, num), skipSpace: false);
		Report.YearsSet yearSet = _report.GetYearSet(age, num);
		string text2 = Numerology.SpaceOutString((num2 == 0) ? (" " + new string(':', num - 1)) : new string(':', num), skipSpace: false);
		List<Label> list = new List<Label> { name1_txt, name2_txt, name3_txt, name4_txt, name5_txt, name6_txt, name7_txt, name8_txt };
		for (int j = 0; j < list.Count; j++)
		{
			list[j].Text = ((yearSet.Names.Count > j) ? Numerology.SpaceOutString(yearSet.Names[j], skipSpace: false) : text2);
		}
		nameSep_txt.Text = text2;
		ess_txt.Text = Numerology.SpaceOutString(yearSet.Essence, skipSpace: false);
		com_txt.Text = Numerology.SpaceOutString(yearSet.Combined, skipSpace: false);
		py_txt.Text = Numerology.SpaceOutString(yearSet.PersonalYear, skipSpace: false);
		cy_txt.Text = Numerology.SpaceOutString(yearSet.CalanderYear, skipSpace: false);
	}

	public void setYearBig(int age)
	{
		if (age < 0)
		{
			return;
		}
		int num = 20;
		int num2 = 0;
		Report.YearsSet yearSet = _report.GetYearSet(age, num);
		num2 = age;
		if (age <= _report.Age && age + num > _report.Age)
		{
			ageind_big_txt.Text = Numerology.SpaceOutString(new string(' ', _report.Age - age) + "*", skipSpace: false, 3);
		}
		else
		{
			ageind_big_txt.Text = "";
		}
		age10 = (age1 = "");
		for (int i = age; i < age + num; i++)
		{
			age1 += i % 10;
			if (i % 10 == 0)
			{
				age10 = age10.PadRight(age1.Length - 1) + i / 10;
			}
		}
		age10_big_txt.Text = Numerology.SpaceOutString(age1, skipSpace: false, 3);
		age1_big_txt.Text = Numerology.SpaceOutString(age10.PadRight(num).Substring(0, num), skipSpace: false, 3);
		string text = Numerology.SpaceOutString((num2 == 0) ? (" " + new string(':', num - 1)) : new string(':', num), skipSpace: false, 3);
		List<Label> list = new List<Label> { name1_big_txt, name2_big_txt, name3_big_txt, name4_big_txt, name5_big_txt, name6_big_txt, name7_big_txt, name8_big_txt };
		for (int j = 0; j < list.Count; j++)
		{
			list[j].Text = ((yearSet.Names.Count > j) ? Numerology.SpaceOutString(yearSet.Names[j], skipSpace: false, 3) : text);
		}
		name9_big_txt.Text = text;
		ess_big_txt.Text = Numerology.SpaceOutString(yearSet.Essence, skipSpace: false, 3);
		com_big_txt.Text = Numerology.SpaceOutString(yearSet.Combined, skipSpace: false, 3);
		py_big_txt.Text = Numerology.SpaceOutString(yearSet.PersonalYear, skipSpace: false, 3);
		cy_big_txt.Text = Numerology.SpaceOutString(yearSet.CalanderYear, skipSpace: false, 3);
	}

	private void trackBar1_Scroll(object sender, EventArgs e)
	{
		setYear(trackBar1.Value);
	}

	private void trackBar2_Scroll(object sender, EventArgs e)
	{
		CenterMonthsatAge(trackBar2.Value);
	}

	private void button2_Click(object sender, EventArgs e)
	{
		Close();
	}

	private void PrintBtn_Click(object sender, EventArgs e)
	{
		PdfDocument pdfDocument = new PdfDocument();
		pdfDocument.addClient(_report.FullName, _report.DOB);
		pdfDocument.ChartType = DocumentType.QuickChart;
		pdfDocument.setOffsets(trackBar3.Value, trackBar1.Value, trackBar2.Value);
		pdfDocument.GenerateChart();
	}

	private void trackBar3_Scroll(object sender, EventArgs e)
	{
		setYearBig(trackBar3.Value);
	}

	private void gen_btn_Click(object sender, EventArgs e)
	{
		SetDetails(input_name_txt.Text, input_dob_txt.Text);
	}

	private int findAge(int year)
	{
		return _report.Age - (DateTime.Now.Year - year);
	}

	private int findYear(int age)
	{
		return DateTime.Now.Year - (_report.Age - age);
	}

	private void numericUpDown1_ValueChanged(object sender, EventArgs e)
	{
		int num = findAge((int)YearNumber.Value);
		if (num < 0)
		{
			return;
		}
		try
		{
			AgeNumber.Value = num;
			trackBar1.Value = num;
			setYear(num - 25);
			if (num > 0)
			{
				trackBar2.Value = num;
				CenterMonthsatAge(num);
			}
			trackBar3.Value = num;
			setYearBig(num - 9);
		}
		catch (Exception)
		{
		}
	}

	private void AgeNumber_ValueChanged(object sender, EventArgs e)
	{
		int num = (int)AgeNumber.Value;
		if (num >= 0)
		{
			YearNumber.Value = findYear((int)AgeNumber.Value);
			if (SlidersStart.Value > AgeNumber.Value)
			{
				SlidersStart.Value = (int)AgeNumber.Value;
			}
			if (SlidersStop.Value < AgeNumber.Value)
			{
				SlidersStop.Value = (int)AgeNumber.Value;
			}
			trackBar1.Value = num;
			setYear(num - 25);
			if (num > 0)
			{
				trackBar2.Value = num;
				CenterMonthsatAge(num);
			}
			trackBar3.Value = num;
			setYearBig(num - 9);
		}
	}

	private void input_name_txt_KeyPress(object sender, KeyPressEventArgs e)
	{
		if (e.KeyChar == '\r')
		{
			gen_btn.PerformClick();
		}
	}

	private void SlidersStart_ValueChanged(object sender, EventArgs e)
	{
		trackBar1.Minimum = (int)SlidersStart.Value;
		trackBar2.Minimum = (int)SlidersStart.Value;
		trackBar3.Minimum = (int)SlidersStart.Value;
	}

	private void SlidersStop_ValueChanged(object sender, EventArgs e)
	{
		trackBar1.Maximum = (int)SlidersStop.Value;
		trackBar2.Maximum = (int)SlidersStop.Value;
		trackBar3.Maximum = (int)SlidersStop.Value;
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
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Pass.Forms.QuickForm));
		this.fullName_txt = new System.Windows.Forms.Label();
		this.fullLetters_txt = new System.Windows.Forms.Label();
		this.hdc_txt = new System.Windows.Forms.Label();
		this.fullLettersPart_txt = new System.Windows.Forms.Label();
		this.p_txt = new System.Windows.Forms.Label();
		this.m_txt = new System.Windows.Forms.Label();
		this.e_txt = new System.Windows.Forms.Label();
		this.i_txt = new System.Windows.Forms.Label();
		this.dob_txt = new System.Windows.Forms.Label();
		this.bf_txt = new System.Windows.Forms.Label();
		this.pn_txt = new System.Windows.Forms.Label();
		this.cn_txt = new System.Windows.Forms.Label();
		this.ug_txt = new System.Windows.Forms.Label();
		this.age_txt = new System.Windows.Forms.Label();
		this.s1_txt = new System.Windows.Forms.Label();
		this.s2_txt = new System.Windows.Forms.Label();
		this.s3_txt = new System.Windows.Forms.Label();
		this.s4_txt = new System.Windows.Forms.Label();
		this.ageInd_txt = new System.Windows.Forms.Label();
		this.age10_txt = new System.Windows.Forms.Label();
		this.age1_txt = new System.Windows.Forms.Label();
		this.name1_txt = new System.Windows.Forms.Label();
		this.name2_txt = new System.Windows.Forms.Label();
		this.name3_txt = new System.Windows.Forms.Label();
		this.name4_txt = new System.Windows.Forms.Label();
		this.name5_txt = new System.Windows.Forms.Label();
		this.name6_txt = new System.Windows.Forms.Label();
		this.name7_txt = new System.Windows.Forms.Label();
		this.name8_txt = new System.Windows.Forms.Label();
		this.nameSep_txt = new System.Windows.Forms.Label();
		this.ess_txt = new System.Windows.Forms.Label();
		this.com_txt = new System.Windows.Forms.Label();
		this.py_txt = new System.Windows.Forms.Label();
		this.cy_txt = new System.Windows.Forms.Label();
		this.trackBar1 = new System.Windows.Forms.TrackBar();
		this.ageInd2_txt = new System.Windows.Forms.Label();
		this.panel = new System.Windows.Forms.Panel();
		this.ageind_big_txt = new System.Windows.Forms.Label();
		this.cy_big_txt = new System.Windows.Forms.Label();
		this.py_big_txt = new System.Windows.Forms.Label();
		this.com_big_txt = new System.Windows.Forms.Label();
		this.ess_big_txt = new System.Windows.Forms.Label();
		this.name9_big_txt = new System.Windows.Forms.Label();
		this.name8_big_txt = new System.Windows.Forms.Label();
		this.name7_big_txt = new System.Windows.Forms.Label();
		this.name6_big_txt = new System.Windows.Forms.Label();
		this.age1_big_txt = new System.Windows.Forms.Label();
		this.name5_big_txt = new System.Windows.Forms.Label();
		this.age10_big_txt = new System.Windows.Forms.Label();
		this.name4_big_txt = new System.Windows.Forms.Label();
		this.name1_big_txt = new System.Windows.Forms.Label();
		this.name3_big_txt = new System.Windows.Forms.Label();
		this.name2_big_txt = new System.Windows.Forms.Label();
		this.year3_txt = new System.Windows.Forms.Label();
		this.year2_txt = new System.Windows.Forms.Label();
		this.year1_txt = new System.Windows.Forms.Label();
		this.pym1_txt = new System.Windows.Forms.Label();
		this.label8 = new System.Windows.Forms.Label();
		this.pm1_txt = new System.Windows.Forms.Label();
		this.mcom1_txt = new System.Windows.Forms.Label();
		this.pme1_txt = new System.Windows.Forms.Label();
		this.essm1_txt = new System.Windows.Forms.Label();
		this.pym2_txt = new System.Windows.Forms.Label();
		this.label2 = new System.Windows.Forms.Label();
		this.pm2_txt = new System.Windows.Forms.Label();
		this.mcom2_txt = new System.Windows.Forms.Label();
		this.pme2_txt = new System.Windows.Forms.Label();
		this.essm2_txt = new System.Windows.Forms.Label();
		this.pym3_txt = new System.Windows.Forms.Label();
		this.cm_txt = new System.Windows.Forms.Label();
		this.pm3_txt = new System.Windows.Forms.Label();
		this.mcom3_txt = new System.Windows.Forms.Label();
		this.pme3_txt = new System.Windows.Forms.Label();
		this.essm3_txt = new System.Windows.Forms.Label();
		this.trackBar2 = new System.Windows.Forms.TrackBar();
		this.button1 = new System.Windows.Forms.Button();
		this.trackBar3 = new System.Windows.Forms.TrackBar();
		this.label1 = new System.Windows.Forms.Label();
		this.input_name_txt = new System.Windows.Forms.TextBox();
		this.gen_btn = new System.Windows.Forms.Button();
		this.input_dob_txt = new System.Windows.Forms.TextBox();
		this.label3 = new System.Windows.Forms.Label();
		this.panel1 = new System.Windows.Forms.Panel();
		this.SlidersStop = new System.Windows.Forms.NumericUpDown();
		this.SlidersStart = new System.Windows.Forms.NumericUpDown();
		this.YearNumber = new System.Windows.Forms.NumericUpDown();
		this.label4 = new System.Windows.Forms.Label();
		this.AgeNumber = new System.Windows.Forms.NumericUpDown();
		this.label5 = new System.Windows.Forms.Label();
		((System.ComponentModel.ISupportInitialize)this.trackBar1).BeginInit();
		this.panel.SuspendLayout();
		((System.ComponentModel.ISupportInitialize)this.trackBar2).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.trackBar3).BeginInit();
		this.panel1.SuspendLayout();
		((System.ComponentModel.ISupportInitialize)this.SlidersStop).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.SlidersStart).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.YearNumber).BeginInit();
		((System.ComponentModel.ISupportInitialize)this.AgeNumber).BeginInit();
		base.SuspendLayout();
		this.fullName_txt.AutoSize = true;
		this.fullName_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.fullName_txt.Location = new System.Drawing.Point(12, 24);
		this.fullName_txt.Name = "fullName_txt";
		this.fullName_txt.Size = new System.Drawing.Size(147, 15);
		this.fullName_txt.TabIndex = 0;
		this.fullName_txt.Text = "Roman &&Peter Vaughan";
		this.fullLetters_txt.AutoSize = true;
		this.fullLetters_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.fullLetters_txt.Location = new System.Drawing.Point(12, 39);
		this.fullLetters_txt.Name = "fullLetters_txt";
		this.fullLetters_txt.Size = new System.Drawing.Size(140, 15);
		this.fullLetters_txt.TabIndex = 1;
		this.fullLetters_txt.Text = "Roman Peter Vaughan";
		this.hdc_txt.AutoSize = true;
		this.hdc_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.hdc_txt.Location = new System.Drawing.Point(12, 9);
		this.hdc_txt.Name = "hdc_txt";
		this.hdc_txt.Size = new System.Drawing.Size(140, 15);
		this.hdc_txt.TabIndex = 2;
		this.hdc_txt.Text = "Roman Peter Vaughan";
		this.fullLettersPart_txt.AutoSize = true;
		this.fullLettersPart_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.fullLettersPart_txt.Location = new System.Drawing.Point(12, 54);
		this.fullLettersPart_txt.Name = "fullLettersPart_txt";
		this.fullLettersPart_txt.Size = new System.Drawing.Size(140, 15);
		this.fullLettersPart_txt.TabIndex = 3;
		this.fullLettersPart_txt.Text = "Roman Peter Vaughan";
		this.p_txt.AutoSize = true;
		this.p_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.p_txt.Location = new System.Drawing.Point(12, 84);
		this.p_txt.Name = "p_txt";
		this.p_txt.Size = new System.Drawing.Size(140, 15);
		this.p_txt.TabIndex = 4;
		this.p_txt.Text = "Roman Peter Vaughan";
		this.m_txt.AutoSize = true;
		this.m_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.m_txt.Location = new System.Drawing.Point(12, 99);
		this.m_txt.Name = "m_txt";
		this.m_txt.Size = new System.Drawing.Size(140, 15);
		this.m_txt.TabIndex = 5;
		this.m_txt.Text = "Roman Peter Vaughan";
		this.e_txt.AutoSize = true;
		this.e_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.e_txt.Location = new System.Drawing.Point(12, 114);
		this.e_txt.Name = "e_txt";
		this.e_txt.Size = new System.Drawing.Size(140, 15);
		this.e_txt.TabIndex = 6;
		this.e_txt.Text = "Roman Peter Vaughan";
		this.i_txt.AutoSize = true;
		this.i_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.i_txt.Location = new System.Drawing.Point(12, 129);
		this.i_txt.Name = "i_txt";
		this.i_txt.Size = new System.Drawing.Size(140, 15);
		this.i_txt.TabIndex = 7;
		this.i_txt.Text = "Roman Peter Vaughan";
		this.dob_txt.AutoSize = true;
		this.dob_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.dob_txt.Location = new System.Drawing.Point(296, 99);
		this.dob_txt.Name = "dob_txt";
		this.dob_txt.Size = new System.Drawing.Size(140, 15);
		this.dob_txt.TabIndex = 8;
		this.dob_txt.Text = "Roman Peter Vaughan";
		this.bf_txt.AutoSize = true;
		this.bf_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.bf_txt.Location = new System.Drawing.Point(296, 114);
		this.bf_txt.Name = "bf_txt";
		this.bf_txt.Size = new System.Drawing.Size(140, 15);
		this.bf_txt.TabIndex = 9;
		this.bf_txt.Text = "Roman Peter Vaughan";
		this.pn_txt.AutoSize = true;
		this.pn_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.pn_txt.Location = new System.Drawing.Point(581, 99);
		this.pn_txt.Name = "pn_txt";
		this.pn_txt.Size = new System.Drawing.Size(140, 15);
		this.pn_txt.TabIndex = 10;
		this.pn_txt.Text = "Roman Peter Vaughan";
		this.cn_txt.AutoSize = true;
		this.cn_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.cn_txt.Location = new System.Drawing.Point(581, 114);
		this.cn_txt.Name = "cn_txt";
		this.cn_txt.Size = new System.Drawing.Size(140, 15);
		this.cn_txt.TabIndex = 11;
		this.cn_txt.Text = "Roman Peter Vaughan";
		this.ug_txt.AutoSize = true;
		this.ug_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.ug_txt.Location = new System.Drawing.Point(581, 9);
		this.ug_txt.Name = "ug_txt";
		this.ug_txt.Size = new System.Drawing.Size(140, 15);
		this.ug_txt.TabIndex = 12;
		this.ug_txt.Text = "Roman Peter Vaughan";
		this.age_txt.AutoSize = true;
		this.age_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.age_txt.Location = new System.Drawing.Point(12, 153);
		this.age_txt.Name = "age_txt";
		this.age_txt.Size = new System.Drawing.Size(56, 15);
		this.age_txt.TabIndex = 13;
		this.age_txt.Text = "Age: 17";
		this.s1_txt.AutoSize = true;
		this.s1_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.s1_txt.Location = new System.Drawing.Point(182, 153);
		this.s1_txt.Name = "s1_txt";
		this.s1_txt.Size = new System.Drawing.Size(49, 15);
		this.s1_txt.TabIndex = 14;
		this.s1_txt.Text = "0 ~ 31";
		this.s2_txt.AutoSize = true;
		this.s2_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.s2_txt.Location = new System.Drawing.Point(345, 153);
		this.s2_txt.Name = "s2_txt";
		this.s2_txt.Size = new System.Drawing.Size(49, 15);
		this.s2_txt.TabIndex = 15;
		this.s2_txt.Text = "0 ~ 31";
		this.s3_txt.AutoSize = true;
		this.s3_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.s3_txt.Location = new System.Drawing.Point(508, 153);
		this.s3_txt.Name = "s3_txt";
		this.s3_txt.Size = new System.Drawing.Size(49, 15);
		this.s3_txt.TabIndex = 16;
		this.s3_txt.Text = "0 ~ 31";
		this.s4_txt.AutoSize = true;
		this.s4_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.s4_txt.Location = new System.Drawing.Point(671, 153);
		this.s4_txt.Name = "s4_txt";
		this.s4_txt.Size = new System.Drawing.Size(49, 15);
		this.s4_txt.TabIndex = 17;
		this.s4_txt.Text = "0 ~ 31";
		this.ageInd_txt.AutoSize = true;
		this.ageInd_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.ageInd_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.ageInd_txt.Location = new System.Drawing.Point(15, 663);
		this.ageInd_txt.Name = "ageInd_txt";
		this.ageInd_txt.Size = new System.Drawing.Size(56, 15);
		this.ageInd_txt.TabIndex = 18;
		this.ageInd_txt.Text = "Age: 17";
		this.age10_txt.AutoSize = true;
		this.age10_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.age10_txt.ForeColor = System.Drawing.SystemColors.ActiveCaptionText;
		this.age10_txt.Location = new System.Drawing.Point(15, 678);
		this.age10_txt.Name = "age10_txt";
		this.age10_txt.Size = new System.Drawing.Size(707, 15);
		this.age10_txt.TabIndex = 19;
		this.age10_txt.Text = "0                   1                   2                   3                   4                   ";
		this.age1_txt.AutoSize = true;
		this.age1_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.age1_txt.ForeColor = System.Drawing.SystemColors.ActiveCaptionText;
		this.age1_txt.Location = new System.Drawing.Point(15, 693);
		this.age1_txt.Name = "age1_txt";
		this.age1_txt.Size = new System.Drawing.Size(714, 15);
		this.age1_txt.TabIndex = 20;
		this.age1_txt.Text = "0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0";
		this.name1_txt.AutoSize = true;
		this.name1_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.name1_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.name1_txt.Location = new System.Drawing.Point(15, 708);
		this.name1_txt.Name = "name1_txt";
		this.name1_txt.Size = new System.Drawing.Size(56, 15);
		this.name1_txt.TabIndex = 21;
		this.name1_txt.Text = "Age: 17";
		this.name2_txt.AutoSize = true;
		this.name2_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.name2_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.name2_txt.Location = new System.Drawing.Point(15, 723);
		this.name2_txt.Name = "name2_txt";
		this.name2_txt.Size = new System.Drawing.Size(56, 15);
		this.name2_txt.TabIndex = 22;
		this.name2_txt.Text = "Age: 17";
		this.name3_txt.AutoSize = true;
		this.name3_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.name3_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.name3_txt.Location = new System.Drawing.Point(15, 738);
		this.name3_txt.Name = "name3_txt";
		this.name3_txt.Size = new System.Drawing.Size(56, 15);
		this.name3_txt.TabIndex = 23;
		this.name3_txt.Text = "Age: 17";
		this.name4_txt.AutoSize = true;
		this.name4_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.name4_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.name4_txt.Location = new System.Drawing.Point(15, 753);
		this.name4_txt.Name = "name4_txt";
		this.name4_txt.Size = new System.Drawing.Size(56, 15);
		this.name4_txt.TabIndex = 24;
		this.name4_txt.Text = "Age: 17";
		this.name5_txt.AutoSize = true;
		this.name5_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.name5_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.name5_txt.Location = new System.Drawing.Point(15, 768);
		this.name5_txt.Name = "name5_txt";
		this.name5_txt.Size = new System.Drawing.Size(56, 15);
		this.name5_txt.TabIndex = 25;
		this.name5_txt.Text = "Age: 17";
		this.name6_txt.AutoSize = true;
		this.name6_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.name6_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.name6_txt.Location = new System.Drawing.Point(15, 783);
		this.name6_txt.Name = "name6_txt";
		this.name6_txt.Size = new System.Drawing.Size(56, 15);
		this.name6_txt.TabIndex = 26;
		this.name6_txt.Text = "Age: 17";
		this.name7_txt.AutoSize = true;
		this.name7_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.name7_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.name7_txt.Location = new System.Drawing.Point(15, 798);
		this.name7_txt.Name = "name7_txt";
		this.name7_txt.Size = new System.Drawing.Size(56, 15);
		this.name7_txt.TabIndex = 27;
		this.name7_txt.Text = "Age: 17";
		this.name8_txt.AutoSize = true;
		this.name8_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.name8_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.name8_txt.Location = new System.Drawing.Point(15, 813);
		this.name8_txt.Name = "name8_txt";
		this.name8_txt.Size = new System.Drawing.Size(56, 15);
		this.name8_txt.TabIndex = 28;
		this.name8_txt.Text = "Age: 17";
		this.nameSep_txt.AutoSize = true;
		this.nameSep_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.nameSep_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.nameSep_txt.Location = new System.Drawing.Point(15, 828);
		this.nameSep_txt.Name = "nameSep_txt";
		this.nameSep_txt.Size = new System.Drawing.Size(588, 15);
		this.nameSep_txt.TabIndex = 29;
		this.nameSep_txt.Text = " ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::";
		this.ess_txt.AutoSize = true;
		this.ess_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.ess_txt.ForeColor = System.Drawing.Color.MediumBlue;
		this.ess_txt.Location = new System.Drawing.Point(15, 843);
		this.ess_txt.Name = "ess_txt";
		this.ess_txt.Size = new System.Drawing.Size(56, 15);
		this.ess_txt.TabIndex = 30;
		this.ess_txt.Text = "Age: 17";
		this.com_txt.AutoSize = true;
		this.com_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.com_txt.ForeColor = System.Drawing.Color.DarkTurquoise;
		this.com_txt.Location = new System.Drawing.Point(15, 858);
		this.com_txt.Name = "com_txt";
		this.com_txt.Size = new System.Drawing.Size(56, 15);
		this.com_txt.TabIndex = 31;
		this.com_txt.Text = "Age: 17";
		this.py_txt.AutoSize = true;
		this.py_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.py_txt.ForeColor = System.Drawing.Color.MediumBlue;
		this.py_txt.Location = new System.Drawing.Point(15, 873);
		this.py_txt.Name = "py_txt";
		this.py_txt.Size = new System.Drawing.Size(56, 15);
		this.py_txt.TabIndex = 32;
		this.py_txt.Text = "Age: 17";
		this.cy_txt.AutoSize = true;
		this.cy_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.cy_txt.ForeColor = System.Drawing.Color.LimeGreen;
		this.cy_txt.Location = new System.Drawing.Point(15, 888);
		this.cy_txt.Name = "cy_txt";
		this.cy_txt.Size = new System.Drawing.Size(56, 15);
		this.cy_txt.TabIndex = 33;
		this.cy_txt.Text = "Age: 17";
		this.trackBar1.Anchor = System.Windows.Forms.AnchorStyles.Bottom;
		this.trackBar1.LargeChange = 1;
		this.trackBar1.Location = new System.Drawing.Point(82, 73);
		this.trackBar1.Maximum = 150;
		this.trackBar1.Name = "trackBar1";
		this.trackBar1.Size = new System.Drawing.Size(652, 45);
		this.trackBar1.TabIndex = 9;
		this.trackBar1.Scroll += new System.EventHandler(trackBar1_Scroll);
		this.ageInd2_txt.AutoSize = true;
		this.ageInd2_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.ageInd2_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.ageInd2_txt.Location = new System.Drawing.Point(15, 903);
		this.ageInd2_txt.Name = "ageInd2_txt";
		this.ageInd2_txt.Size = new System.Drawing.Size(56, 15);
		this.ageInd2_txt.TabIndex = 35;
		this.ageInd2_txt.Text = "Age: 17";
		this.panel.Anchor = System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left | System.Windows.Forms.AnchorStyles.Right;
		this.panel.AutoScroll = true;
		this.panel.BackColor = System.Drawing.Color.White;
		this.panel.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
		this.panel.Controls.Add(this.ageind_big_txt);
		this.panel.Controls.Add(this.cy_big_txt);
		this.panel.Controls.Add(this.py_big_txt);
		this.panel.Controls.Add(this.com_big_txt);
		this.panel.Controls.Add(this.ess_big_txt);
		this.panel.Controls.Add(this.name9_big_txt);
		this.panel.Controls.Add(this.name8_big_txt);
		this.panel.Controls.Add(this.name7_big_txt);
		this.panel.Controls.Add(this.name6_big_txt);
		this.panel.Controls.Add(this.age1_big_txt);
		this.panel.Controls.Add(this.name5_big_txt);
		this.panel.Controls.Add(this.age10_big_txt);
		this.panel.Controls.Add(this.name4_big_txt);
		this.panel.Controls.Add(this.name1_big_txt);
		this.panel.Controls.Add(this.name3_big_txt);
		this.panel.Controls.Add(this.name2_big_txt);
		this.panel.Controls.Add(this.year3_txt);
		this.panel.Controls.Add(this.year2_txt);
		this.panel.Controls.Add(this.year1_txt);
		this.panel.Controls.Add(this.pym1_txt);
		this.panel.Controls.Add(this.label8);
		this.panel.Controls.Add(this.pm1_txt);
		this.panel.Controls.Add(this.mcom1_txt);
		this.panel.Controls.Add(this.pme1_txt);
		this.panel.Controls.Add(this.essm1_txt);
		this.panel.Controls.Add(this.pym2_txt);
		this.panel.Controls.Add(this.label2);
		this.panel.Controls.Add(this.pm2_txt);
		this.panel.Controls.Add(this.mcom2_txt);
		this.panel.Controls.Add(this.pme2_txt);
		this.panel.Controls.Add(this.essm2_txt);
		this.panel.Controls.Add(this.pym3_txt);
		this.panel.Controls.Add(this.cm_txt);
		this.panel.Controls.Add(this.pm3_txt);
		this.panel.Controls.Add(this.mcom3_txt);
		this.panel.Controls.Add(this.pme3_txt);
		this.panel.Controls.Add(this.essm3_txt);
		this.panel.Controls.Add(this.hdc_txt);
		this.panel.Controls.Add(this.ageInd2_txt);
		this.panel.Controls.Add(this.s4_txt);
		this.panel.Controls.Add(this.fullName_txt);
		this.panel.Controls.Add(this.s3_txt);
		this.panel.Controls.Add(this.fullLetters_txt);
		this.panel.Controls.Add(this.s2_txt);
		this.panel.Controls.Add(this.cy_txt);
		this.panel.Controls.Add(this.s1_txt);
		this.panel.Controls.Add(this.fullLettersPart_txt);
		this.panel.Controls.Add(this.ug_txt);
		this.panel.Controls.Add(this.cn_txt);
		this.panel.Controls.Add(this.py_txt);
		this.panel.Controls.Add(this.pn_txt);
		this.panel.Controls.Add(this.p_txt);
		this.panel.Controls.Add(this.bf_txt);
		this.panel.Controls.Add(this.com_txt);
		this.panel.Controls.Add(this.dob_txt);
		this.panel.Controls.Add(this.m_txt);
		this.panel.Controls.Add(this.ess_txt);
		this.panel.Controls.Add(this.e_txt);
		this.panel.Controls.Add(this.nameSep_txt);
		this.panel.Controls.Add(this.i_txt);
		this.panel.Controls.Add(this.name8_txt);
		this.panel.Controls.Add(this.age_txt);
		this.panel.Controls.Add(this.name7_txt);
		this.panel.Controls.Add(this.ageInd_txt);
		this.panel.Controls.Add(this.name6_txt);
		this.panel.Controls.Add(this.age10_txt);
		this.panel.Controls.Add(this.name5_txt);
		this.panel.Controls.Add(this.age1_txt);
		this.panel.Controls.Add(this.name4_txt);
		this.panel.Controls.Add(this.name1_txt);
		this.panel.Controls.Add(this.name3_txt);
		this.panel.Controls.Add(this.name2_txt);
		this.panel.Location = new System.Drawing.Point(12, 61);
		this.panel.Name = "panel";
		this.panel.Size = new System.Drawing.Size(796, 573);
		this.panel.TabIndex = 36;
		this.ageind_big_txt.AutoSize = true;
		this.ageind_big_txt.Font = new System.Drawing.Font("Consolas", 12f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.ageind_big_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.ageind_big_txt.Location = new System.Drawing.Point(25, 500);
		this.ageind_big_txt.Name = "ageind_big_txt";
		this.ageind_big_txt.Size = new System.Drawing.Size(72, 19);
		this.ageind_big_txt.TabIndex = 73;
		this.ageind_big_txt.Text = "Age: 17";
		this.cy_big_txt.AutoSize = true;
		this.cy_big_txt.Font = new System.Drawing.Font("Consolas", 12f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.cy_big_txt.ForeColor = System.Drawing.Color.LimeGreen;
		this.cy_big_txt.Location = new System.Drawing.Point(25, 479);
		this.cy_big_txt.Name = "cy_big_txt";
		this.cy_big_txt.Size = new System.Drawing.Size(72, 19);
		this.cy_big_txt.TabIndex = 72;
		this.cy_big_txt.Text = "Age: 17";
		this.py_big_txt.AutoSize = true;
		this.py_big_txt.Font = new System.Drawing.Font("Consolas", 12f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.py_big_txt.ForeColor = System.Drawing.Color.MediumBlue;
		this.py_big_txt.Location = new System.Drawing.Point(25, 458);
		this.py_big_txt.Name = "py_big_txt";
		this.py_big_txt.Size = new System.Drawing.Size(72, 19);
		this.py_big_txt.TabIndex = 71;
		this.py_big_txt.Text = "Age: 17";
		this.com_big_txt.AutoSize = true;
		this.com_big_txt.Font = new System.Drawing.Font("Consolas", 12f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.com_big_txt.ForeColor = System.Drawing.Color.DarkTurquoise;
		this.com_big_txt.Location = new System.Drawing.Point(25, 437);
		this.com_big_txt.Name = "com_big_txt";
		this.com_big_txt.Size = new System.Drawing.Size(72, 19);
		this.com_big_txt.TabIndex = 70;
		this.com_big_txt.Text = "Age: 17";
		this.ess_big_txt.AutoSize = true;
		this.ess_big_txt.Font = new System.Drawing.Font("Consolas", 12f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.ess_big_txt.ForeColor = System.Drawing.Color.MediumBlue;
		this.ess_big_txt.Location = new System.Drawing.Point(25, 416);
		this.ess_big_txt.Name = "ess_big_txt";
		this.ess_big_txt.Size = new System.Drawing.Size(72, 19);
		this.ess_big_txt.TabIndex = 69;
		this.ess_big_txt.Text = "Age: 17";
		this.name9_big_txt.AutoSize = true;
		this.name9_big_txt.Font = new System.Drawing.Font("Consolas", 12f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.name9_big_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.name9_big_txt.Location = new System.Drawing.Point(25, 394);
		this.name9_big_txt.Name = "name9_big_txt";
		this.name9_big_txt.Size = new System.Drawing.Size(378, 19);
		this.name9_big_txt.TabIndex = 68;
		this.name9_big_txt.Text = " ::::::::::::::::::::::::::::::::::::::::";
		this.name8_big_txt.AutoSize = true;
		this.name8_big_txt.Font = new System.Drawing.Font("Consolas", 12f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.name8_big_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.name8_big_txt.Location = new System.Drawing.Point(25, 373);
		this.name8_big_txt.Name = "name8_big_txt";
		this.name8_big_txt.Size = new System.Drawing.Size(72, 19);
		this.name8_big_txt.TabIndex = 67;
		this.name8_big_txt.Text = "Age: 17";
		this.name7_big_txt.AutoSize = true;
		this.name7_big_txt.Font = new System.Drawing.Font("Consolas", 12f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.name7_big_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.name7_big_txt.Location = new System.Drawing.Point(25, 352);
		this.name7_big_txt.Name = "name7_big_txt";
		this.name7_big_txt.Size = new System.Drawing.Size(72, 19);
		this.name7_big_txt.TabIndex = 66;
		this.name7_big_txt.Text = "Age: 17";
		this.name6_big_txt.AutoSize = true;
		this.name6_big_txt.Font = new System.Drawing.Font("Consolas", 12f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.name6_big_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.name6_big_txt.Location = new System.Drawing.Point(25, 331);
		this.name6_big_txt.Name = "name6_big_txt";
		this.name6_big_txt.Size = new System.Drawing.Size(72, 19);
		this.name6_big_txt.TabIndex = 65;
		this.name6_big_txt.Text = "Age: 17";
		this.age1_big_txt.AutoSize = true;
		this.age1_big_txt.Font = new System.Drawing.Font("Consolas", 12f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.age1_big_txt.ForeColor = System.Drawing.SystemColors.ActiveCaptionText;
		this.age1_big_txt.Location = new System.Drawing.Point(25, 184);
		this.age1_big_txt.Name = "age1_big_txt";
		this.age1_big_txt.Size = new System.Drawing.Size(378, 19);
		this.age1_big_txt.TabIndex = 58;
		this.age1_big_txt.Text = "0                   1                   2";
		this.name5_big_txt.AutoSize = true;
		this.name5_big_txt.Font = new System.Drawing.Font("Consolas", 12f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.name5_big_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.name5_big_txt.Location = new System.Drawing.Point(25, 310);
		this.name5_big_txt.Name = "name5_big_txt";
		this.name5_big_txt.Size = new System.Drawing.Size(72, 19);
		this.name5_big_txt.TabIndex = 64;
		this.name5_big_txt.Text = "Age: 17";
		this.age10_big_txt.AutoSize = true;
		this.age10_big_txt.Font = new System.Drawing.Font("Consolas", 12f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.age10_big_txt.ForeColor = System.Drawing.SystemColors.ActiveCaptionText;
		this.age10_big_txt.Location = new System.Drawing.Point(25, 205);
		this.age10_big_txt.Name = "age10_big_txt";
		this.age10_big_txt.Size = new System.Drawing.Size(378, 19);
		this.age10_big_txt.TabIndex = 59;
		this.age10_big_txt.Text = "0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0";
		this.name4_big_txt.AutoSize = true;
		this.name4_big_txt.Font = new System.Drawing.Font("Consolas", 12f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.name4_big_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.name4_big_txt.Location = new System.Drawing.Point(25, 289);
		this.name4_big_txt.Name = "name4_big_txt";
		this.name4_big_txt.Size = new System.Drawing.Size(72, 19);
		this.name4_big_txt.TabIndex = 63;
		this.name4_big_txt.Text = "Age: 17";
		this.name1_big_txt.AutoSize = true;
		this.name1_big_txt.Font = new System.Drawing.Font("Consolas", 12f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.name1_big_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.name1_big_txt.Location = new System.Drawing.Point(25, 226);
		this.name1_big_txt.Name = "name1_big_txt";
		this.name1_big_txt.Size = new System.Drawing.Size(72, 19);
		this.name1_big_txt.TabIndex = 60;
		this.name1_big_txt.Text = "Age: 17";
		this.name3_big_txt.AutoSize = true;
		this.name3_big_txt.Font = new System.Drawing.Font("Consolas", 12f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.name3_big_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.name3_big_txt.Location = new System.Drawing.Point(25, 268);
		this.name3_big_txt.Name = "name3_big_txt";
		this.name3_big_txt.Size = new System.Drawing.Size(72, 19);
		this.name3_big_txt.TabIndex = 62;
		this.name3_big_txt.Text = "Age: 17";
		this.name2_big_txt.AutoSize = true;
		this.name2_big_txt.Font = new System.Drawing.Font("Consolas", 12f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.name2_big_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.name2_big_txt.Location = new System.Drawing.Point(25, 247);
		this.name2_big_txt.Name = "name2_big_txt";
		this.name2_big_txt.Size = new System.Drawing.Size(72, 19);
		this.name2_big_txt.TabIndex = 61;
		this.name2_big_txt.Text = "Age: 17";
		this.year3_txt.AutoSize = true;
		this.year3_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.year3_txt.ForeColor = System.Drawing.SystemColors.ActiveCaptionText;
		this.year3_txt.Location = new System.Drawing.Point(525, 632);
		this.year3_txt.Name = "year3_txt";
		this.year3_txt.Size = new System.Drawing.Size(35, 15);
		this.year3_txt.TabIndex = 56;
		this.year3_txt.Text = "2009";
		this.year2_txt.AutoSize = true;
		this.year2_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.year2_txt.ForeColor = System.Drawing.SystemColors.ActiveCaptionText;
		this.year2_txt.Location = new System.Drawing.Point(352, 632);
		this.year2_txt.Name = "year2_txt";
		this.year2_txt.Size = new System.Drawing.Size(35, 15);
		this.year2_txt.TabIndex = 55;
		this.year2_txt.Text = "2009";
		this.year1_txt.AutoSize = true;
		this.year1_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.year1_txt.ForeColor = System.Drawing.SystemColors.ActiveCaptionText;
		this.year1_txt.Location = new System.Drawing.Point(178, 632);
		this.year1_txt.Name = "year1_txt";
		this.year1_txt.Size = new System.Drawing.Size(35, 15);
		this.year1_txt.TabIndex = 54;
		this.year1_txt.Text = "2009";
		this.pym1_txt.AutoSize = true;
		this.pym1_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.pym1_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.pym1_txt.Location = new System.Drawing.Point(461, 607);
		this.pym1_txt.Name = "pym1_txt";
		this.pym1_txt.Size = new System.Drawing.Size(168, 15);
		this.pym1_txt.TabIndex = 53;
		this.pym1_txt.Text = "J F M A M J J A S O N D";
		this.label8.AutoSize = true;
		this.label8.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.label8.ForeColor = System.Drawing.Color.LimeGreen;
		this.label8.Location = new System.Drawing.Point(461, 592);
		this.label8.Name = "label8";
		this.label8.Size = new System.Drawing.Size(168, 15);
		this.label8.TabIndex = 52;
		this.label8.Text = "J F M A M J J A S O N D";
		this.pm1_txt.AutoSize = true;
		this.pm1_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.pm1_txt.ForeColor = System.Drawing.Color.MediumBlue;
		this.pm1_txt.Location = new System.Drawing.Point(461, 577);
		this.pm1_txt.Name = "pm1_txt";
		this.pm1_txt.Size = new System.Drawing.Size(168, 15);
		this.pm1_txt.TabIndex = 51;
		this.pm1_txt.Text = "J F M A M J J A S O N D";
		this.mcom1_txt.AutoSize = true;
		this.mcom1_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.mcom1_txt.ForeColor = System.Drawing.Color.DarkTurquoise;
		this.mcom1_txt.Location = new System.Drawing.Point(461, 562);
		this.mcom1_txt.Name = "mcom1_txt";
		this.mcom1_txt.Size = new System.Drawing.Size(168, 15);
		this.mcom1_txt.TabIndex = 50;
		this.mcom1_txt.Text = "J F M A M J J A S O N D";
		this.pme1_txt.AutoSize = true;
		this.pme1_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.pme1_txt.ForeColor = System.Drawing.Color.MediumBlue;
		this.pme1_txt.Location = new System.Drawing.Point(461, 547);
		this.pme1_txt.Name = "pme1_txt";
		this.pme1_txt.Size = new System.Drawing.Size(168, 15);
		this.pme1_txt.TabIndex = 49;
		this.pme1_txt.Text = "J F M A M J J A S O N D";
		this.essm1_txt.AutoSize = true;
		this.essm1_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.essm1_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.essm1_txt.Location = new System.Drawing.Point(461, 532);
		this.essm1_txt.Name = "essm1_txt";
		this.essm1_txt.Size = new System.Drawing.Size(168, 15);
		this.essm1_txt.TabIndex = 48;
		this.essm1_txt.Text = "J F M A M J J A S O N D";
		this.pym2_txt.AutoSize = true;
		this.pym2_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.pym2_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.pym2_txt.Location = new System.Drawing.Point(287, 607);
		this.pym2_txt.Name = "pym2_txt";
		this.pym2_txt.Size = new System.Drawing.Size(168, 15);
		this.pym2_txt.TabIndex = 47;
		this.pym2_txt.Text = "J F M A M J J A S O N D";
		this.label2.AutoSize = true;
		this.label2.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.label2.ForeColor = System.Drawing.Color.LimeGreen;
		this.label2.Location = new System.Drawing.Point(287, 592);
		this.label2.Name = "label2";
		this.label2.Size = new System.Drawing.Size(168, 15);
		this.label2.TabIndex = 46;
		this.label2.Text = "J F M A M J J A S O N D";
		this.pm2_txt.AutoSize = true;
		this.pm2_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.pm2_txt.ForeColor = System.Drawing.Color.MediumBlue;
		this.pm2_txt.Location = new System.Drawing.Point(287, 577);
		this.pm2_txt.Name = "pm2_txt";
		this.pm2_txt.Size = new System.Drawing.Size(168, 15);
		this.pm2_txt.TabIndex = 45;
		this.pm2_txt.Text = "J F M A M J J A S O N D";
		this.mcom2_txt.AutoSize = true;
		this.mcom2_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.mcom2_txt.ForeColor = System.Drawing.Color.DarkTurquoise;
		this.mcom2_txt.Location = new System.Drawing.Point(287, 562);
		this.mcom2_txt.Name = "mcom2_txt";
		this.mcom2_txt.Size = new System.Drawing.Size(168, 15);
		this.mcom2_txt.TabIndex = 44;
		this.mcom2_txt.Text = "J F M A M J J A S O N D";
		this.pme2_txt.AutoSize = true;
		this.pme2_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.pme2_txt.ForeColor = System.Drawing.Color.MediumBlue;
		this.pme2_txt.Location = new System.Drawing.Point(287, 547);
		this.pme2_txt.Name = "pme2_txt";
		this.pme2_txt.Size = new System.Drawing.Size(168, 15);
		this.pme2_txt.TabIndex = 43;
		this.pme2_txt.Text = "J F M A M J J A S O N D";
		this.essm2_txt.AutoSize = true;
		this.essm2_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.essm2_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.essm2_txt.Location = new System.Drawing.Point(287, 532);
		this.essm2_txt.Name = "essm2_txt";
		this.essm2_txt.Size = new System.Drawing.Size(168, 15);
		this.essm2_txt.TabIndex = 42;
		this.essm2_txt.Text = "J F M A M J J A S O N D";
		this.pym3_txt.AutoSize = true;
		this.pym3_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.pym3_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.pym3_txt.Location = new System.Drawing.Point(110, 607);
		this.pym3_txt.Name = "pym3_txt";
		this.pym3_txt.Size = new System.Drawing.Size(168, 15);
		this.pym3_txt.TabIndex = 41;
		this.pym3_txt.Text = "J F M A M J J A S O N D";
		this.cm_txt.AutoSize = true;
		this.cm_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.cm_txt.ForeColor = System.Drawing.Color.LimeGreen;
		this.cm_txt.Location = new System.Drawing.Point(110, 592);
		this.cm_txt.Name = "cm_txt";
		this.cm_txt.Size = new System.Drawing.Size(168, 15);
		this.cm_txt.TabIndex = 40;
		this.cm_txt.Text = "J F M A M J J A S O N D";
		this.pm3_txt.AutoSize = true;
		this.pm3_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.pm3_txt.ForeColor = System.Drawing.Color.MediumBlue;
		this.pm3_txt.Location = new System.Drawing.Point(110, 577);
		this.pm3_txt.Name = "pm3_txt";
		this.pm3_txt.Size = new System.Drawing.Size(168, 15);
		this.pm3_txt.TabIndex = 39;
		this.pm3_txt.Text = "J F M A M J J A S O N D";
		this.mcom3_txt.AutoSize = true;
		this.mcom3_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.mcom3_txt.ForeColor = System.Drawing.Color.DarkTurquoise;
		this.mcom3_txt.Location = new System.Drawing.Point(110, 562);
		this.mcom3_txt.Name = "mcom3_txt";
		this.mcom3_txt.Size = new System.Drawing.Size(168, 15);
		this.mcom3_txt.TabIndex = 38;
		this.mcom3_txt.Text = "J F M A M J J A S O N D";
		this.pme3_txt.AutoSize = true;
		this.pme3_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.pme3_txt.ForeColor = System.Drawing.Color.MediumBlue;
		this.pme3_txt.Location = new System.Drawing.Point(110, 547);
		this.pme3_txt.Name = "pme3_txt";
		this.pme3_txt.Size = new System.Drawing.Size(168, 15);
		this.pme3_txt.TabIndex = 37;
		this.pme3_txt.Text = "J F M A M J J A S O N D";
		this.essm3_txt.AutoSize = true;
		this.essm3_txt.Font = new System.Drawing.Font("Consolas", 9.75f, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, 0);
		this.essm3_txt.ForeColor = System.Drawing.Color.OrangeRed;
		this.essm3_txt.Location = new System.Drawing.Point(110, 532);
		this.essm3_txt.Name = "essm3_txt";
		this.essm3_txt.Size = new System.Drawing.Size(168, 15);
		this.essm3_txt.TabIndex = 36;
		this.essm3_txt.Text = "J F M A M J J A S O N D";
		this.trackBar2.Anchor = System.Windows.Forms.AnchorStyles.Bottom;
		this.trackBar2.LargeChange = 1;
		this.trackBar2.Location = new System.Drawing.Point(82, 37);
		this.trackBar2.Maximum = 150;
		this.trackBar2.Minimum = 1;
		this.trackBar2.Name = "trackBar2";
		this.trackBar2.Size = new System.Drawing.Size(656, 45);
		this.trackBar2.TabIndex = 8;
		this.trackBar2.Value = 17;
		this.trackBar2.Scroll += new System.EventHandler(trackBar2_Scroll);
		this.button1.Location = new System.Drawing.Point(730, 32);
		this.button1.Name = "button1";
		this.button1.Size = new System.Drawing.Size(75, 23);
		this.button1.TabIndex = 6;
		this.button1.Text = "Print";
		this.button1.UseVisualStyleBackColor = true;
		this.button1.Click += new System.EventHandler(PrintBtn_Click);
		this.trackBar3.Anchor = System.Windows.Forms.AnchorStyles.Bottom;
		this.trackBar3.LargeChange = 1;
		this.trackBar3.Location = new System.Drawing.Point(82, 7);
		this.trackBar3.Maximum = 150;
		this.trackBar3.Name = "trackBar3";
		this.trackBar3.Size = new System.Drawing.Size(656, 45);
		this.trackBar3.TabIndex = 7;
		this.trackBar3.Value = 17;
		this.trackBar3.Scroll += new System.EventHandler(trackBar3_Scroll);
		this.label1.AutoSize = true;
		this.label1.Location = new System.Drawing.Point(12, 9);
		this.label1.Name = "label1";
		this.label1.Size = new System.Drawing.Size(57, 13);
		this.label1.TabIndex = 41;
		this.label1.Text = "Full Name:";
		this.input_name_txt.Location = new System.Drawing.Point(75, 6);
		this.input_name_txt.Name = "input_name_txt";
		this.input_name_txt.Size = new System.Drawing.Size(369, 20);
		this.input_name_txt.TabIndex = 1;
		this.input_name_txt.KeyPress += new System.Windows.Forms.KeyPressEventHandler(input_name_txt_KeyPress);
		this.gen_btn.Location = new System.Drawing.Point(369, 32);
		this.gen_btn.Name = "gen_btn";
		this.gen_btn.Size = new System.Drawing.Size(75, 23);
		this.gen_btn.TabIndex = 3;
		this.gen_btn.Text = "Generate";
		this.gen_btn.UseVisualStyleBackColor = true;
		this.gen_btn.Click += new System.EventHandler(gen_btn_Click);
		this.input_dob_txt.Location = new System.Drawing.Point(75, 32);
		this.input_dob_txt.Name = "input_dob_txt";
		this.input_dob_txt.Size = new System.Drawing.Size(110, 20);
		this.input_dob_txt.TabIndex = 2;
		this.input_dob_txt.KeyPress += new System.Windows.Forms.KeyPressEventHandler(input_name_txt_KeyPress);
		this.label3.AutoSize = true;
		this.label3.Location = new System.Drawing.Point(0, 35);
		this.label3.Name = "label3";
		this.label3.Size = new System.Drawing.Size(69, 13);
		this.label3.TabIndex = 44;
		this.label3.Text = "Date of Birth:";
		this.panel1.Controls.Add(this.SlidersStop);
		this.panel1.Controls.Add(this.trackBar1);
		this.panel1.Controls.Add(this.trackBar2);
		this.panel1.Controls.Add(this.SlidersStart);
		this.panel1.Controls.Add(this.trackBar3);
		this.panel1.Dock = System.Windows.Forms.DockStyle.Bottom;
		this.panel1.Location = new System.Drawing.Point(0, 640);
		this.panel1.Name = "panel1";
		this.panel1.Size = new System.Drawing.Size(820, 110);
		this.panel1.TabIndex = 46;
		this.SlidersStop.Anchor = System.Windows.Forms.AnchorStyles.Bottom;
		this.SlidersStop.Location = new System.Drawing.Point(744, 37);
		this.SlidersStop.Maximum = new decimal(new int[4] { 2147483647, 0, 0, 0 });
		this.SlidersStop.Name = "SlidersStop";
		this.SlidersStop.Size = new System.Drawing.Size(64, 20);
		this.SlidersStop.TabIndex = 11;
		this.SlidersStop.Value = new decimal(new int[4] { 150, 0, 0, 0 });
		this.SlidersStop.ValueChanged += new System.EventHandler(SlidersStop_ValueChanged);
		this.SlidersStart.Anchor = System.Windows.Forms.AnchorStyles.Bottom;
		this.SlidersStart.Location = new System.Drawing.Point(12, 37);
		this.SlidersStart.Maximum = new decimal(new int[4] { 2147483647, 0, 0, 0 });
		this.SlidersStart.Name = "SlidersStart";
		this.SlidersStart.Size = new System.Drawing.Size(64, 20);
		this.SlidersStart.TabIndex = 10;
		this.SlidersStart.ValueChanged += new System.EventHandler(SlidersStart_ValueChanged);
		this.YearNumber.Location = new System.Drawing.Point(525, 35);
		this.YearNumber.Maximum = new decimal(new int[4] { 2147483647, 0, 0, 0 });
		this.YearNumber.Minimum = new decimal(new int[4] { -2147483648, 0, 0, -2147483648 });
		this.YearNumber.Name = "YearNumber";
		this.YearNumber.Size = new System.Drawing.Size(64, 20);
		this.YearNumber.TabIndex = 4;
		this.YearNumber.Value = new decimal(new int[4] { 2011, 0, 0, 0 });
		this.YearNumber.ValueChanged += new System.EventHandler(numericUpDown1_ValueChanged);
		this.label4.AutoSize = true;
		this.label4.Location = new System.Drawing.Point(539, 19);
		this.label4.Name = "label4";
		this.label4.Size = new System.Drawing.Size(29, 13);
		this.label4.TabIndex = 48;
		this.label4.Text = "Year";
		this.AgeNumber.Location = new System.Drawing.Point(595, 35);
		this.AgeNumber.Maximum = new decimal(new int[4] { 2147483647, 0, 0, 0 });
		this.AgeNumber.Name = "AgeNumber";
		this.AgeNumber.Size = new System.Drawing.Size(64, 20);
		this.AgeNumber.TabIndex = 5;
		this.AgeNumber.ValueChanged += new System.EventHandler(AgeNumber_ValueChanged);
		this.label5.AutoSize = true;
		this.label5.Location = new System.Drawing.Point(609, 19);
		this.label5.Name = "label5";
		this.label5.Size = new System.Drawing.Size(26, 13);
		this.label5.TabIndex = 48;
		this.label5.Text = "Age";
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		this.BackColor = System.Drawing.SystemColors.Control;
		base.ClientSize = new System.Drawing.Size(820, 750);
		base.Controls.Add(this.label5);
		base.Controls.Add(this.label4);
		base.Controls.Add(this.AgeNumber);
		base.Controls.Add(this.YearNumber);
		base.Controls.Add(this.panel1);
		base.Controls.Add(this.input_dob_txt);
		base.Controls.Add(this.label3);
		base.Controls.Add(this.button1);
		base.Controls.Add(this.gen_btn);
		base.Controls.Add(this.input_name_txt);
		base.Controls.Add(this.label1);
		base.Controls.Add(this.panel);
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.MaximizeBox = false;
		base.Name = "QuickForm";
		this.Text = "Pass 7";
		base.Load += new System.EventHandler(pass_quickchart_Load);
		((System.ComponentModel.ISupportInitialize)this.trackBar1).EndInit();
		this.panel.ResumeLayout(false);
		this.panel.PerformLayout();
		((System.ComponentModel.ISupportInitialize)this.trackBar2).EndInit();
		((System.ComponentModel.ISupportInitialize)this.trackBar3).EndInit();
		this.panel1.ResumeLayout(false);
		this.panel1.PerformLayout();
		((System.ComponentModel.ISupportInitialize)this.SlidersStop).EndInit();
		((System.ComponentModel.ISupportInitialize)this.SlidersStart).EndInit();
		((System.ComponentModel.ISupportInitialize)this.YearNumber).EndInit();
		((System.ComponentModel.ISupportInitialize)this.AgeNumber).EndInit();
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
