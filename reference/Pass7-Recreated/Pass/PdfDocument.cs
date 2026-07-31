using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Windows.Forms;
using PdfSharp;
using PdfSharp.Drawing;
using PdfSharp.Drawing.Layout;
using PdfSharp.Pdf;

namespace Pass;

internal class PdfDocument
{
	private Stream _image;

	private DateTime _today;

	private int _month;

	private int _focus1;

	private int _focus2;

	public DocumentType ChartType;

	public DocumentPart ChartPart;

	private int _shortLength;

	private int _longLength;

	private IList<thingy> _clientList = new List<thingy>();

	private int _fontSize;

	private int[] _years1;

	private int[] _years2;

	private int[] _months;

	private PdfSharp.Pdf.PdfDocument _pdf;

	private string _ageMarkerOnes = "";

	private string _ageMarkerTens = "";

	private string _nameSeperator = " ";

	private readonly Report.MonthsSet _blankMonthSet = new Report.MonthsSet
	{
		Combined = "............",
		Essence = "............",
		PersonalMonth = "............",
		PersonalMonthEssence = "............",
		PersonalYear = "............"
	};

	public PdfDocument()
	{
		_image = Assembly.GetExecutingAssembly().GetManifestResourceStream("Pass.Media.logo.jpg");
		ChartType = DocumentType.QuickChart;
		ChartPart = DocumentPart.Years;
		_today = DateTime.Now;
		_shortLength = 20;
		_longLength = 50;
		_fontSize = 10;
		_years1 = new int[3] { 20, 210, 12 };
		_years2 = new int[3] { 30, 600, 9 };
		_months = new int[3] { 45, 490, 12 };
		int num = 0;
		int num2 = 0;
		for (int i = 0; i < 3000; i++)
		{
			_nameSeperator += ":";
			_ageMarkerOnes += num;
			if (num == 0)
			{
				_ageMarkerTens += num2;
				num2++;
			}
			else if ((num2 <= 10 || num != 1) && (num2 <= 100 || num != 2))
			{
				_ageMarkerTens += " ";
			}
			num++;
			if (num > 9)
			{
				num = 0;
			}
		}
	}

	public void addClient(string Name, string Dob)
	{
		_clientList.Add(new thingy
		{
			FullName = Name,
			DOB = Dob
		});
	}

	public void setOffsets(int yearBig, int yearSmall, int month)
	{
		_focus1 = yearBig;
		_focus2 = yearSmall;
		_month = month;
	}

	private int fp(int line, int start = 220, int fontSize = 9)
	{
		return start + (fontSize + 1) * line;
	}

	private string atAge(string input, int age)
	{
		input = ((age - 21 >= 0) ? input.Substring(age - 21, 100) : input.PadLeft(input.Length - (age - 21), '.'));
		return input;
	}

	public void GenerateChart()
	{
		try
		{
			Report report = new Report(_clientList[0].FullName, _clientList[0].DOB);
			int start = 80;
			if (_clientList.Count < 1)
			{
				MessageBox.Show("Can not generate a PDF without a name and Date of Birth", "Pdf Generation Error! - Pass", MessageBoxButtons.OK, MessageBoxIcon.Hand);
				return;
			}
			_pdf = new PdfSharp.Pdf.PdfDocument();
			PdfPage pdfPage = _pdf.AddPage();
			pdfPage.Size = PageSize.A4;
			XGraphics xGraphics = XGraphics.FromPdfPage(pdfPage);
			_pdf.Info.Title = "Profile for " + _clientList[0].FullName + " - Pass 3";
			XFont font = new XFont("Courier New", _fontSize, XFontStyle.Bold);
			XFont font2 = new XFont("Courier New", 12.0, XFontStyle.Regular);
			XFont xFont = new XFont("Courier New", _years2[2], XFontStyle.Bold);
			XFont font3 = new XFont("Verdana", 6.0, XFontStyle.Regular);
			XImage image = XImage.FromGdiPlusImage(Image.FromStream(_image));
			xGraphics.DrawImage(image, 10, 10);
			xGraphics.DrawString(DateTime.Now.ToLongDateString(), font, XBrushes.Black, 420.0, 20.0);
			xFont = new XFont("Arial", 9.0, XFontStyle.Regular);
			xGraphics.DrawString("All mapped data contained within is the property of Peter Vaughan, of vaughan Limited", font3, XBrushes.Red, 180.0, 809.0);
			xGraphics.DrawString("No unautherised distrubution or commercial use is permitted.", font3, XBrushes.Red, 220.0, 816.0);
			xGraphics.DrawString("All proprietary information on this sheet must be displayed at all times in electronic and printed formats.", font3, XBrushes.Red, 150.0, 823.0);
			xGraphics.DrawString("Copyright 2011 Vaughan Limited peter@petervaughan.net", font3, XBrushes.Red, 220.0, 830.0);
			xFont = new XFont("Courier New", _years2[2], XFontStyle.Bold);
			if (ChartType == DocumentType.QuickChart)
			{
				xGraphics.DrawString(report.HDC + "  " + report.HDCTotal, font, XBrushes.Black, 20.0, fp(0, start, 12));
				xGraphics.DrawString(report.FullName, font, XBrushes.Black, 20.0, fp(1, start, 12));
				xGraphics.DrawString(report.FullLetters + "  " + report.FullLettersTotal, font, XBrushes.Black, 20.0, fp(2, start, 12));
				xGraphics.DrawString(report.FullLettersTotalPart, font, XBrushes.Black, 20.0, fp(3, start, 12));
				xGraphics.DrawString("P " + report.PMEI[0], font, XBrushes.Black, 20.0, fp(5, start, 12));
				xGraphics.DrawString("M " + report.PMEI[1], font, XBrushes.Black, 20.0, fp(6, start, 12));
				xGraphics.DrawString("E " + report.PMEI[2], font, XBrushes.Black, 20.0, fp(7, start, 12));
				xGraphics.DrawString("I " + report.PMEI[3], font, XBrushes.Black, 20.0, fp(8, start, 12));
				xGraphics.DrawString("Age: " + report.Age, font, XBrushes.Black, 20.0, fp(10, start, 12));
				xGraphics.DrawString(report.Seasons[0], font, XBrushes.Black, 168.0, fp(10, start, 12));
				xGraphics.DrawString(report.Seasons[1], font, XBrushes.Black, 248.0, fp(10, start, 12));
				xGraphics.DrawString(report.Seasons[2], font, XBrushes.Black, 338.0, fp(10, start, 12));
				xGraphics.DrawString(report.Seasons[3], font, XBrushes.Black, 428.0, fp(10, start, 12));
				xGraphics.DrawString(report.DOB, font, XBrushes.Black, 160.0, fp(6, start, 12));
				xGraphics.DrawString(report.BirthForce, font, XBrushes.Black, 160.0, fp(7, start, 12));
				xGraphics.DrawString("P: " + report.Pin, font, XBrushes.Black, 338.0, fp(6, start, 12));
				xGraphics.DrawString("C: " + report.Cha, font, XBrushes.Black, 338.0, fp(7, start, 12));
				xGraphics.DrawString("UG: " + report.UltamateGoal, font, XBrushes.Black, 490.0, fp(-1, start, 12));
				if (_focus1 <= report.Age && _focus1 + _shortLength > report.Age)
				{
					xGraphics.DrawString(Numerology.SpaceOutString(new string(' ', report.Age - _focus1) + "*", skipSpace: false, 3), font2, XBrushes.Red, _years1[0], _years1[1] + (_years1[2] + 1));
				}
				xGraphics.DrawString(Numerology.SpaceOutString(_ageMarkerTens.Substring(_focus1, _shortLength), skipSpace: false, 3), font2, XBrushes.Black, _years1[0], _years1[1] + (_years1[2] + 1) * 2);
				xGraphics.DrawString(Numerology.SpaceOutString(_ageMarkerOnes.Substring(_focus1, _shortLength), skipSpace: false, 3), font2, XBrushes.Black, _years1[0], _years1[1] + (_years1[2] + 1) * 3);
				Report.YearsSet yearSet = report.GetYearSet(_focus1, _shortLength);
				for (int i = 0; i < 8; i++)
				{
					if (yearSet.Names.Count > i)
					{
						xGraphics.DrawString(Numerology.SpaceOutString(yearSet.Names[i], skipSpace: false, 3), font2, XBrushes.Red, _years1[0], _years1[1] + (_years1[2] + 1) * (i + 4));
					}
					else
					{
						xGraphics.DrawString(Numerology.SpaceOutString(_nameSeperator.Substring(_focus1, _shortLength), skipSpace: false, 3), font2, XBrushes.Red, _years1[0], _years1[1] + (_years1[2] + 1) * (i + 4));
					}
				}
				xGraphics.DrawString(Numerology.SpaceOutString(_nameSeperator.Substring(_focus1, _shortLength), skipSpace: false, 3), font2, XBrushes.Red, _years1[0], _years1[1] + (_years1[2] + 1) * 12);
				xGraphics.DrawString(Numerology.SpaceOutString(yearSet.Essence, skipSpace: false, 3), font2, XBrushes.Blue, _years1[0], _years1[1] + (_years1[2] + 1) * 13);
				xGraphics.DrawString(Numerology.SpaceOutString(yearSet.Combined, skipSpace: false, 3), font2, XBrushes.Turquoise, _years1[0], _years1[1] + (_years1[2] + 1) * 14);
				xGraphics.DrawString(Numerology.SpaceOutString(yearSet.PersonalYear, skipSpace: false, 3), font2, XBrushes.Blue, _years1[0], _years1[1] + (_years1[2] + 1) * 15);
				xGraphics.DrawString(Numerology.SpaceOutString(yearSet.CalanderYear, skipSpace: false, 3), font2, XBrushes.Green, _years1[0], _years1[1] + (_years1[2] + 1) * 16);
				if (_focus1 <= report.Age && _focus1 + _shortLength > report.Age)
				{
					xGraphics.DrawString(Numerology.SpaceOutString(new string(' ', report.Age - _focus1) + "*", skipSpace: false, 3), font2, XBrushes.Red, _years1[0], _years1[1] + (_years1[2] + 1) * 17);
				}
				List<Report.MonthsSet> list = new List<Report.MonthsSet>
				{
					report.GetMonthSet(_month - 1),
					report.GetMonthSet(_month),
					report.GetMonthSet(_month + 1)
				};
				xGraphics.DrawString(Numerology.SpaceOutString(list[0].Essence + "   " + list[1].Essence + "   " + list[2].Essence, skipSpace: false), font, XBrushes.Red, _months[0], _months[1]);
				xGraphics.DrawString(Numerology.SpaceOutString(list[0].PersonalMonthEssence + "   " + list[1].PersonalMonthEssence + "   " + list[2].PersonalMonthEssence, skipSpace: false), font, XBrushes.Blue, _months[0], _months[1] + (_months[2] + 1));
				xGraphics.DrawString(Numerology.SpaceOutString(list[0].Combined + "   " + list[1].Combined + "   " + list[2].Combined, skipSpace: false), font, XBrushes.Turquoise, _months[0], _months[1] + (_months[2] + 1) * 2);
				xGraphics.DrawString(Numerology.SpaceOutString(list[0].PersonalMonth + "   " + list[1].PersonalMonth + "   " + list[2].PersonalMonth, skipSpace: false), font, XBrushes.Blue, _months[0], _months[1] + (_months[2] + 1) * 3);
				xGraphics.DrawString(Numerology.SpaceOutString("JFMAMJJASOND   JFMAMJJASOND   JFMAMJJASOND", skipSpace: false), font, XBrushes.Green, _months[0], _months[1] + (_months[2] + 1) * 4);
				xGraphics.DrawString(Numerology.SpaceOutString(list[0].PersonalYear + "   " + list[1].PersonalYear + "   " + list[2].PersonalYear, skipSpace: false), font, XBrushes.Red, _months[0], _months[1] + (_months[2] + 1) * 5);
				xGraphics.DrawString(Numerology.SpaceOutString("    " + (DateTime.Now.Year - report.Age + _month - 1) + "           " + (DateTime.Now.Year + _month - report.Age) + "           " + (DateTime.Now.Year + 1 + _month - report.Age) + "    ", skipSpace: false), font, XBrushes.Black, _months[0], _months[1] + (_months[2] + 1) * 6);
				xGraphics.DrawString(Numerology.SpaceOutString(_ageMarkerTens.Substring(_focus2, _longLength), skipSpace: false), xFont, XBrushes.Black, _years2[0], _years2[1] + (_years2[2] + 1));
				xGraphics.DrawString(Numerology.SpaceOutString(_ageMarkerOnes.Substring(_focus2, _longLength), skipSpace: false), xFont, XBrushes.Black, _years2[0], _years2[1] + (_years2[2] + 1) * 2);
				yearSet = report.GetYearSet(_focus2, _longLength);
				for (int j = 0; j < 8; j++)
				{
					if (yearSet.Names.Count > j)
					{
						xGraphics.DrawString(Numerology.SpaceOutString(yearSet.Names[j], skipSpace: false), xFont, XBrushes.Red, _years2[0], _years2[1] + (_years2[2] + 1) * (j + 3));
					}
					else
					{
						xGraphics.DrawString(Numerology.SpaceOutString(_nameSeperator.Substring(_focus2, _longLength), skipSpace: false), xFont, XBrushes.Red, _years2[0], _years2[1] + (_years2[2] + 1) * (j + 3));
					}
				}
				xGraphics.DrawString(Numerology.SpaceOutString(_nameSeperator.Substring(_focus2, _longLength), skipSpace: false), xFont, XBrushes.Red, _years2[0], _years2[1] + (_years2[2] + 1) * 11);
				xGraphics.DrawString(Numerology.SpaceOutString(yearSet.Essence, skipSpace: false), xFont, XBrushes.Blue, _years2[0], _years2[1] + (_years2[2] + 1) * 12);
				xGraphics.DrawString(Numerology.SpaceOutString(yearSet.Combined, skipSpace: false), xFont, XBrushes.Turquoise, _years2[0], _years2[1] + (_years2[2] + 1) * 13);
				xGraphics.DrawString(Numerology.SpaceOutString(yearSet.PersonalYear, skipSpace: false), xFont, XBrushes.Blue, _years2[0], _years2[1] + (_years2[2] + 1) * 14);
				xGraphics.DrawString(Numerology.SpaceOutString(yearSet.CalanderYear, skipSpace: false), xFont, XBrushes.Green, _years2[0], _years2[1] + (_years2[2] + 1) * 15);
				if (_focus2 <= report.Age && _focus2 + _longLength > report.Age)
				{
					xGraphics.DrawString(Numerology.SpaceOutString(new string(' ', report.Age - _focus2) + "*", skipSpace: false), xFont, XBrushes.Red, _years2[0], _years2[1] + (_years2[2] + 1) * 16);
				}
			}
			else if (ChartType == DocumentType.MultiChart)
			{
				font = new XFont("Consolas", 11.0);
				int num = 140;
				int start2 = 80;
				int num2 = 0;
				int num3 = 0;
				int num4 = 125;
				int num5 = 150;
				XPen xPen = new XPen(XColors.Gray, 1.0);
				xPen.LineCap = XLineCap.Round;
				xPen.DashStyle = XDashStyle.Dash;
				xPen.DashPattern = new double[2] { 2.0, 5.0 };
				new XTextFormatter(xGraphics);
				foreach (thingy client in _clientList)
				{
					new XTextFormatter(xGraphics).DrawString(client.FullName + "\r\n" + client.DOB, font, XBrushes.Black, new XRect(10.0, fp(num2 - 1, start2, 12), num4, num5));
					report = new Report(client.FullName, client.DOB);
					int num6 = _month + report.Age;
					List<Report.MonthsSet> list2 = new List<Report.MonthsSet>
					{
						(num6 < 1) ? _blankMonthSet : report.GetMonthSet(num6 - 1),
						(num6 < 0) ? _blankMonthSet : report.GetMonthSet(num6),
						(num6 < -1) ? _blankMonthSet : report.GetMonthSet(num6 + 1)
					};
					if (ChartPart == DocumentPart.Months)
					{
						xGraphics.DrawString(Numerology.SpaceOutString(list2[0].Essence + list2[1].Essence + list2[2].Essence, skipSpace: false), font, XBrushes.Red, num, fp(num2, start2, 12));
						xGraphics.DrawString(Numerology.SpaceOutString(list2[0].PersonalMonthEssence + list2[1].PersonalMonthEssence + list2[2].PersonalMonthEssence, skipSpace: false), font, XBrushes.Blue, num, fp(num2 + 1, start2, 12));
						xGraphics.DrawString(Numerology.SpaceOutString(list2[0].Combined + list2[1].Combined + list2[2].Combined, skipSpace: false), font, XBrushes.Turquoise, num, fp(num2 + 2, start2, 12));
						xGraphics.DrawString(Numerology.SpaceOutString(list2[0].PersonalMonth + list2[1].PersonalMonth + list2[2].PersonalMonth, skipSpace: false), font, XBrushes.Blue, num, fp(num2 + 3, start2, 12));
						xGraphics.DrawString(Numerology.SpaceOutString("JFMAMJJASONDJFMAMJJASONDJFMAMJJASOND", skipSpace: false), font, XBrushes.Green, num, fp(num2 + 4, start2, 12));
						xGraphics.DrawString(Numerology.SpaceOutString(list2[0].PersonalYear + list2[1].PersonalYear + list2[2].PersonalYear, skipSpace: false), font, XBrushes.Red, num, fp(num2 + 5, start2, 12));
						xGraphics.DrawLine(xPen, new XPoint(num + 142, fp(num2 - 1, start2, 12)), new XPoint(num + 142, fp(num2 + 6, start2, 12)));
						xGraphics.DrawLine(xPen, new XPoint(num + 287, fp(num2 - 1, start2, 12)), new XPoint(num + 287, fp(num2 + 6, start2, 12)));
						xGraphics.DrawLine(xPen, new XPoint(num, fp(num2 + 6, start2, 12) - 4), new XPoint(num + 440, fp(num2 + 6, start2, 12) - 4));
					}
					else
					{
						int num7 = 41;
						num3 = _focus1 + report.Age;
						int num8 = ((num3 >= num7 / 2) ? (num3 - num7 / 2) : 0);
						Report.YearsSet yearSet2 = report.GetYearSet((num8 >= 0) ? num8 : 0, num7);
						string text = "";
						string text2 = "";
						for (int k = ((num8 >= 0) ? num8 : 0); k < num8 + num7; k++)
						{
							text2 += k % 10;
							if (k % 10 == 0)
							{
								text = text.PadRight(text2.Length - 1) + k / 10;
							}
						}
						xGraphics.DrawString(Numerology.SpaceOutString(UndershootPadding(text, num3, num7), skipSpace: false), xFont, XBrushes.Red, num, fp(num2, start2, 12));
						xGraphics.DrawString(Numerology.SpaceOutString(UndershootPadding(text2, num3, num7), skipSpace: false), xFont, XBrushes.Red, num, fp(num2 + 1, start2, 12));
						xGraphics.DrawString(Numerology.SpaceOutString(UndershootPadding(yearSet2.Essence, num3, num7), skipSpace: false), xFont, XBrushes.Blue, num, fp(num2 + 2, start2, 12));
						xGraphics.DrawString(Numerology.SpaceOutString(UndershootPadding(yearSet2.Combined, num3, num7), skipSpace: false), xFont, XBrushes.Turquoise, num, fp(num2 + 3, start2, 12));
						xGraphics.DrawString(Numerology.SpaceOutString(UndershootPadding(yearSet2.PersonalYear, num3, num7), skipSpace: false), xFont, XBrushes.Blue, num, fp(num2 + 4, start2, 12));
						xGraphics.DrawString(Numerology.SpaceOutString(UndershootPadding(yearSet2.CalanderYear, num3, num7), skipSpace: false), xFont, XBrushes.Green, num, fp(num2 + 5, start2, 12));
						xGraphics.DrawLine(xPen, new XPoint(num + 213, fp(num2 - 1, start2, 12) - 4), new XPoint(num + 213, fp(num2 + 6, start2, 12) - 4));
						xGraphics.DrawLine(xPen, new XPoint(num + 224, fp(num2 - 1, start2, 12) - 4), new XPoint(num + 224, fp(num2 + 6, start2, 12) - 4));
						xGraphics.DrawLine(xPen, new XPoint(num, fp(num2 + 6, start2, 12) - 4), new XPoint(num + 440, fp(num2 + 6, start2, 12) - 4));
					}
					num2 += 7;
					if (num2 > 56)
					{
						PdfPage pdfPage2 = _pdf.AddPage();
						pdfPage2.Size = PageSize.A4;
						xGraphics = XGraphics.FromPdfPage(pdfPage2);
						xGraphics.DrawImage(image, 10, 10);
						xGraphics.DrawString(DateTime.Now.ToLongDateString(), font, XBrushes.Black, 440.0, 20.0);
						xFont = new XFont("Arial", 9.0, XFontStyle.Regular);
						xGraphics.DrawString("All mapped data contained within remains the property of Peter Vaughan.", xFont, XBrushes.Red, 145.0, 820.0);
						xGraphics.DrawString("No unauthorised distribution. Document is PRIVATE AND CONFIDENTIAL", xFont, XBrushes.Red, 140.0, 831.0);
						xFont = new XFont("Courier New", _years2[2], XFontStyle.Bold);
						num2 = 0;
					}
				}
			}
			string text3 = Path.Combine(Path.GetTempPath(), "pass7");
			string path = Path.GetRandomFileName() + ".pdf";
			if (!Directory.Exists(text3))
			{
				Directory.CreateDirectory(text3);
			}
			_pdf.Save(Path.Combine(text3, path));
			Process.Start(Path.Combine(text3, path));
		}
		catch (PdfSharpException ex)
		{
			MessageBox.Show(ex.Message);
		}
	}

	public void test()
	{
		PdfSharp.Pdf.PdfDocument pdfDocument = new PdfSharp.Pdf.PdfDocument();
		pdfDocument.Info.Title = "Profile for  - Pass 3";
		PdfPage pdfPage = pdfDocument.AddPage();
		XGraphics xGraphics = XGraphics.FromPdfPage(pdfPage);
		XFont font = new XFont("Verdana", 20.0, XFontStyle.Regular);
		xGraphics.DrawString("Hello, World!", font, XBrushes.Black, new XRect(0.0, 0.0, pdfPage.Width, pdfPage.Height), XStringFormats.Center);
		pdfDocument.Save("HelloWorld_tempfile.pdf");
		Process.Start("HelloWorld_tempfile.pdf");
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
}
