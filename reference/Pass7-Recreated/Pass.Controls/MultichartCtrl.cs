using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Windows.Forms;

namespace Pass.Controls;

public class MultichartCtrl : Control, ISupportInitialize
{
	private string[] line = new string[6];

	private ChartType type;

	private int _offset = 20;

	private Report _report;

	private SolidBrush[] col = new SolidBrush[6];

	private Bitmap Display;

	private string age1 = "";

	private string age10 = "";

	private string nameSep = " ";

	private bool _hasChanged;

	private bool isInitializing;

	private IContainer components;

	public ChartType Type
	{
		get
		{
			return type;
		}
		set
		{
			type = value;
			_hasChanged = true;
			Invalidate();
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
			_hasChanged = true;
			Invalidate();
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
			if (value != null)
			{
				_report = value;
				_offset = _report.Age;
				_hasChanged = true;
				Invalidate();
			}
		}
	}

	[Browsable(true)]
	[Category("Appearance")]
	public Color Color1
	{
		get
		{
			return col[0].Color;
		}
		set
		{
			col[0].Color = value;
			_hasChanged = true;
			Invalidate();
		}
	}

	[Browsable(true)]
	[Category("Appearance")]
	public Color Color2
	{
		get
		{
			return col[1].Color;
		}
		set
		{
			col[1].Color = value;
			_hasChanged = true;
			Invalidate();
		}
	}

	[Browsable(true)]
	[Category("Appearance")]
	public Color Color3
	{
		get
		{
			return col[2].Color;
		}
		set
		{
			_hasChanged = true;
			col[2].Color = value;
			Invalidate();
		}
	}

	[Browsable(true)]
	[Category("Appearance")]
	public Color Color4
	{
		get
		{
			return col[3].Color;
		}
		set
		{
			col[3].Color = value;
			_hasChanged = true;
			Invalidate();
		}
	}

	[Browsable(true)]
	[Category("Appearance")]
	public Color Color5
	{
		get
		{
			return col[4].Color;
		}
		set
		{
			col[4].Color = value;
			_hasChanged = true;
			Invalidate();
		}
	}

	[Browsable(true)]
	[Category("Appearance")]
	public Color Color6
	{
		get
		{
			return col[5].Color;
		}
		set
		{
			col[5].Color = value;
			_hasChanged = true;
			Invalidate();
		}
	}

	public override Color BackColor
	{
		get
		{
			return base.BackColor;
		}
		set
		{
			base.BackColor = value;
			_hasChanged = true;
			Invalidate();
		}
	}

	public override Font Font
	{
		get
		{
			return base.Font;
		}
		set
		{
			base.Font = value;
			_hasChanged = true;
			Invalidate();
		}
	}

	public MultichartCtrl()
	{
		SetStyle(ControlStyles.UserPaint | ControlStyles.ResizeRedraw | ControlStyles.SupportsTransparentBackColor | ControlStyles.AllPaintingInWmPaint | ControlStyles.DoubleBuffer, value: true);
		col[0] = new SolidBrush(Color.OrangeRed);
		col[1] = new SolidBrush(Color.OrangeRed);
		col[2] = new SolidBrush(Color.Blue);
		col[3] = new SolidBrush(Color.Turquoise);
		col[4] = new SolidBrush(Color.Blue);
		col[5] = new SolidBrush(Color.Green);
		int num = 0;
		int num2 = 0;
		for (int i = 0; i < 3000; i++)
		{
			nameSep += ":";
			age1 += num;
			if (num == 0)
			{
				age10 += num2;
				num2++;
			}
			else if ((num2 <= 10 || num != 1) && (num2 <= 100 || num != 2))
			{
				age10 += " ";
			}
			num++;
			if (num > 9)
			{
				num = 0;
			}
		}
		InitializeComponent();
	}

	public void SetDetails(string Name, string DOB)
	{
		_report = new Report(Name, DOB);
		_offset = _report.Age;
		Invalidate();
	}

	private string UndershootPadding(string input, int offset, int length)
	{
		int num = length / 2;
		string text = new string('.', length);
		string text2 = "";
		if (offset <= -num)
		{
			return text;
		}
		if (offset < num)
		{
			text2 = text.Substring(0, num - offset);
			if (input.Length >= length - text2.Length)
			{
				return text2 + input.Substring(0, length - text2.Length);
			}
			return (text2 + input).PadRight(length);
		}
		if (input.Length < length)
		{
			return input.PadRight(length);
		}
		return input.Substring(0, length);
	}

	protected override void OnPaint(PaintEventArgs pe)
	{
		Pen pen = new Pen(Brushes.Black, 1f);
		pen.DashPattern = new float[2] { 5f, 2f };
		_ = base.Width / 2;
		int num = 0;
		int[] array = new int[300];
		int[] array2 = new int[300];
		if (Display == null || _hasChanged)
		{
			_hasChanged = false;
			Display = new Bitmap(base.Width, base.Height);
			using Graphics graphics = Graphics.FromImage(Display);
			float num2 = graphics.MeasureString("abcdefghijklmnopqrstuvwxyz", Font).Width / 26f;
			_ = (float)base.Width / num2;
			int num3 = 0;
			int num4 = (int)((float)base.Width / num2 / 2f);
			if (num4 % 2 == 0)
			{
				num4++;
			}
			for (int i = 0; i < num4; i++)
			{
				array[i] = (int)(num2 * (float)i * 2f);
				array2[i] = i * 13;
			}
			graphics.FillRectangle(new SolidBrush(base.BackColor), new Rectangle(0, 0, base.Width, base.Height));
			if (type == ChartType.Years)
			{
				num3 = 0;
				int num5 = ((_offset >= num4 / 2) ? (_offset - num4 / 2) : 0);
				Report.YearsSet yearSet = _report.GetYearSet((num5 >= 0) ? num5 : 0, num4);
				age10 = (age1 = "");
				for (int j = ((num5 >= 0) ? num5 : 0); j < num5 + num4; j++)
				{
					age1 += j % 10;
					if (j % 10 == 0)
					{
						age10 = age10.PadRight(age1.Length - 1) + j / 10;
					}
				}
				string text = UndershootPadding(age10, _offset, num4);
				num = (int)((float)base.Width - num2 * (float)text.Length * 2f + num2) / 2;
				for (int k = 0; k < num4; k++)
				{
					graphics.DrawString(text[k].ToString(), Font, col[num3], array[k] + num, array2[num3]);
				}
				num3++;
				text = UndershootPadding(age1, _offset, num4);
				for (int l = 0; l < num4; l++)
				{
					graphics.DrawString(text[l].ToString(), Font, col[num3], array[l] + num, array2[num3]);
				}
				num3++;
				text = UndershootPadding(yearSet.Essence, _offset, num4);
				for (int m = 0; m < num4; m++)
				{
					graphics.DrawString(text[m].ToString(), Font, col[num3], array[m] + num, array2[num3]);
				}
				num3++;
				text = UndershootPadding(yearSet.Combined, _offset, num4);
				for (int n = 0; n < num4; n++)
				{
					graphics.DrawString(text[n].ToString(), Font, col[num3], array[n] + num, array2[num3]);
				}
				num3++;
				text = UndershootPadding(yearSet.PersonalYear, _offset, num4);
				for (int num6 = 0; num6 < num4; num6++)
				{
					graphics.DrawString(text[num6].ToString(), Font, col[num3], array[num6] + num, array2[num3]);
				}
				num3++;
				text = UndershootPadding(yearSet.CalanderYear, _offset, num4);
				for (int num7 = 0; num7 < num4; num7++)
				{
					graphics.DrawString(text[num7].ToString(), Font, col[num3], array[num7] + num, array2[num3]);
				}
				int num8 = base.Width / 2;
				graphics.DrawLine(pen, new Point((int)((float)num8 - num2), 0), new Point((int)((float)num8 - num2), base.Height));
				graphics.DrawLine(pen, new Point((int)((float)num8 + num2), 0), new Point((int)((float)num8 + num2), base.Height));
			}
			else if (type == ChartType.Months)
			{
				Report.MonthsSet monthsSet = new Report.MonthsSet
				{
					Combined = "............",
					Essence = "............",
					PersonalMonth = "............",
					PersonalMonthEssence = "............",
					PersonalYear = "............"
				};
				List<Report.MonthsSet> list = new List<Report.MonthsSet>
				{
					(_offset < 1) ? monthsSet : _report.GetMonthSet(_offset - 1),
					(_offset < 0) ? monthsSet : _report.GetMonthSet(_offset),
					(_offset < -1) ? monthsSet : _report.GetMonthSet(_offset + 1)
				};
				List<string> list2 = new List<string>();
				list2.Add(list[0].Essence + " " + list[1].Essence + " " + list[2].Essence);
				list2.Add(list[0].PersonalMonthEssence + " " + list[1].PersonalMonthEssence + " " + list[2].PersonalMonthEssence);
				list2.Add(list[0].Combined + " " + list[1].Combined + " " + list[2].Combined);
				list2.Add(list[0].PersonalMonth + " " + list[1].PersonalMonth + " " + list[2].PersonalMonth);
				list2.Add("JFMAMJJASOND JFMAMJJASOND JFMAMJJASOND");
				list2.Add(list[0].PersonalYear + " " + list[1].PersonalYear + " " + list[2].PersonalYear);
				List<string> list3 = list2;
				List<SolidBrush> list4 = new List<SolidBrush>
				{
					col[0],
					col[2],
					col[3],
					col[4],
					col[5],
					col[1]
				};
				for (num3 = 0; num3 < list3.Count; num3++)
				{
					string text = list3[num3];
					num = (int)((float)base.Width - num2 * (float)text.Length * 2f + num2) / 2;
					for (int num9 = 0; num9 < text.Length; num9++)
					{
						graphics.DrawString(text[num9].ToString(), Font, list4[num3], new PointF(num2 * (float)num9 * 2f + (float)num, num3 * 13));
					}
				}
			}
			else
			{
				SizeF sizeF = graphics.MeasureString("This mode is not supported yet...", Font);
				graphics.DrawString("This mode is not supported yet...", Font, new SolidBrush(Color.Black), new PointF(((float)base.Width - sizeF.Width) / 2f, ((float)base.Height - sizeF.Height) / 2f));
			}
		}
		Rectangle srcRect = new Rectangle(0, 0, base.Width, base.Height);
		pe.Graphics.DrawImage(Display, 0, 0, srcRect, GraphicsUnit.Pixel);
		base.OnPaint(pe);
		pen.Dispose();
	}

	public static int MeasureDisplayStringWidth(Graphics graphics, string text, Font font)
	{
		Bitmap bitmap = new Bitmap(32, 1, graphics);
		SizeF sizeF = graphics.MeasureString(text, font);
		Graphics graphics2 = Graphics.FromImage(bitmap);
		int num = (int)Math.Floor(sizeF.Width);
		if (graphics2 != null)
		{
			graphics2.Clear(Color.White);
			graphics2.DrawString(text + "|", font, Brushes.Black, 32 - num, -font.Height / 2);
			for (int num2 = 31; num2 >= 0; num2--)
			{
				num--;
				if (bitmap.GetPixel(num2, 0).R != byte.MaxValue)
				{
					break;
				}
			}
		}
		return num;
	}

	protected override void OnResize(EventArgs e)
	{
		if (Display != null)
		{
			Display.Dispose();
			Display = null;
			_hasChanged = true;
		}
		base.OnResize(e);
	}

	protected override void OnBackColorChanged(EventArgs e)
	{
		if (Display != null)
		{
			Display.Dispose();
			Display = null;
			_hasChanged = true;
		}
		base.OnBackColorChanged(e);
	}

	void ISupportInitialize.BeginInit()
	{
		isInitializing = true;
	}

	void ISupportInitialize.EndInit()
	{
		isInitializing = false;
		Invalidate();
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
		this.components = new System.ComponentModel.Container();
	}
}
