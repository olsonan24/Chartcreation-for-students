using System;
using System.Collections.Generic;
using System.Linq;

namespace Pass;

public class Report
{
	public class MonthsSet
	{
		public string Essence;

		public string PersonalYear;

		public string PersonalMonthEssence;

		public string Combined;

		public string PersonalMonth;
	}

	public class YearsSet
	{
		public List<string> Names;

		public string Essence;

		public string Combined;

		public string PersonalYear;

		public string CalanderYear;
	}

	private string _name = "No Name Set";

	private List<string> _names;

	private string _dob = "00/00/00";

	private int _age;

	private string[] _pmei = new string[4];

	private string _hdc;

	private string _hdcTotal;

	private string _birthForce;

	private int _monthOffset;

	private List<string> _fullNameRepeated;

	private string _fullLetters;

	private string _fullLettersTotal;

	private string _fullLettersTotalPart;

	private string[] _seasons = new string[4];

	private string _pin;

	private string _cha;

	private string _ultamateGoal;

	public string FullName => _name;

	public string DOB => _dob;

	public int Age => _age;

	public List<string> FullNameRepeated => _fullNameRepeated;

	public string FullLetters => _fullLetters;

	public string HDC => _hdc;

	public string HDCTotal => _hdcTotal;

	public string FullLettersTotal => _fullLettersTotal;

	public string FullLettersTotalPart => _fullLettersTotalPart;

	public string[] PMEI => _pmei;

	public string BirthForce => _birthForce;

	public string[] Seasons => _seasons;

	public List<string> Names => _names;

	public string Pin => _pin;

	public string Cha => _cha;

	public string UltamateGoal => _ultamateGoal;

	public Report(string name, string dob)
	{
		_name = name;
		_dob = dob;
		GenerateReport();
	}

	public static Dictionary<char, int> CountOccurances(string source)
	{
		Dictionary<char, int> result = new Dictionary<char, int>
		{
			{ '1', 0 },
			{ '2', 0 },
			{ '3', 0 },
			{ '4', 0 },
			{ '5', 0 },
			{ '6', 0 },
			{ '7', 0 },
			{ '8', 0 },
			{ '9', 0 }
		};
		source.ToList().ForEach(delegate(char c)
		{
			if (result.ContainsKey(c))
			{
				result[c]++;
			}
			else
			{
				result.Add(c, 1);
			}
		});
		return result;
	}

	private void GenerateReport()
	{
		_hdc = Numerology.Hdc(_name, 3);
		_fullLetters = Numerology.Letters(_name);
		_hdcTotal = Numerology.Full(HDC);
		_fullLettersTotal = Numerology.Full(FullLetters);
		_fullLettersTotalPart = Numerology.MultiFull(FullLetters);
		Dictionary<char, int> dictionary = CountOccurances(FullLetters);
		_pmei[0] = $"{dictionary['4']}   {dictionary['5']} = {Numerology.Calc(dictionary['4'] + dictionary['5'])}";
		_pmei[1] = $"{dictionary['1']}   {dictionary['8']} = {Numerology.Calc(dictionary['1'] + dictionary['8'])}";
		_pmei[2] = $"{dictionary['2']} {dictionary['3']} {dictionary['6']} = {Numerology.Calc(dictionary['2'] + dictionary['3'] + dictionary['6'])}";
		_pmei[3] = $"{dictionary['7']}   {dictionary['9']} = {Numerology.Calc(dictionary['7'] + dictionary['9'])}";
		_birthForce = Numerology.MultiFull(DOB) + " " + Numerology.Full(DOB);
		_seasons = Numerology.Seasons(DOB);
		int num = Numerology.CountWords(FullName);
		_names = new List<string>();
		_fullNameRepeated = new List<string>();
		for (int i = 1; i <= num; i++)
		{
			string word = Numerology.GetWord(FullName, i);
			_names.Add(word);
			_fullNameRepeated.Add(Numerology.Repeat(word));
		}
		_pin = Numerology.PinCha(DOB, PinChaType.PPP_P);
		_cha = Numerology.PinCha(DOB, PinChaType.CCC_C);
		_ultamateGoal = Numerology.Full(FullLetters + DOB);
		_age = Numerology.AgeFinder(DOB);
	}

	public string GetEssence(int start, int length)
	{
		if (length < 0 || start < 0)
		{
			throw new ArgumentException();
		}
		int[] array = new int[length];
		int num = 0;
		if (start == 0)
		{
			num++;
			start++;
		}
		for (int i = 0; i < FullNameRepeated.Count; i++)
		{
			int[] array2 = FullNameRepeated[i].Select((char d) => Numerology.Calc(d)).ToArray();
			int num2 = start - 1;
			for (int num3 = num; num3 < length; num3++)
			{
				array[num3] += array2[num2++ % array2.Length];
			}
		}
		return string.Join("", array.Select((int d) => Numerology.Calc(d).ToString()));
	}

	public string GetPersonalYear(int start, int length)
	{
		if (length < 0 || start < 0)
		{
			throw new ArgumentException();
		}
		int num = Numerology.Calc(Numerology.Calc(DOB) + start);
		string text = "";
		for (int i = 0; i < length; i++)
		{
			text += num++;
			if (num > 9)
			{
				num = 1;
			}
		}
		return text;
	}

	public string GetCalanderYear(int start, int length)
	{
		if (length < 0 || start < 0)
		{
			throw new ArgumentException();
		}
		int num = Numerology.Calc(Numerology.Calc(Numerology.GetWord(DOB, 3)) + start);
		string text = "";
		for (int i = 0; i < length; i++)
		{
			text += num++;
			if (num > 9)
			{
				num = 1;
			}
		}
		return text;
	}

	public YearsSet GetYearSet(int start, int length)
	{
		if (length < 0 || start < 0)
		{
			throw new ArgumentException();
		}
		YearsSet yearsSet = new YearsSet
		{
			Essence = GetEssence(start, length),
			PersonalYear = GetPersonalYear(start, length),
			CalanderYear = GetCalanderYear(start, length)
		};
		yearsSet.Names = new List<string>(_fullNameRepeated.Select(delegate(string repeatedName)
		{
			int num = start + ((start != 0) ? (-1) : 0);
			string text = ((start == 0) ? " " : "") + repeatedName.Substring(num % repeatedName.Length);
			while (text.Length <= length)
			{
				text += repeatedName;
			}
			return text.Substring(0, length).ToUpper();
		}));
		yearsSet.Combined = Numerology.Combine(yearsSet.Essence, yearsSet.PersonalYear);
		if (start == 0)
		{
			yearsSet.Combined = "/" + yearsSet.Combined.Substring(1);
		}
		return yearsSet;
	}

	public MonthsSet GetMonthSet(int offset)
	{
		if (offset < 0)
		{
			throw new ArgumentException();
		}
		string inputB = "123456789123";
		MonthsSet monthsSet = new MonthsSet
		{
			Essence = new string(GetEssence(offset, 1)[0], 12),
			PersonalYear = new string(GetPersonalYear(offset, 1)[0], 12)
		};
		monthsSet.PersonalMonth = Numerology.Combine(monthsSet.PersonalYear, inputB);
		monthsSet.PersonalMonthEssence = Numerology.Combine(monthsSet.PersonalMonth, monthsSet.Essence);
		monthsSet.Combined = Numerology.Combine(monthsSet.PersonalMonthEssence, monthsSet.PersonalMonth);
		return monthsSet;
	}
}
