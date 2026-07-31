using System;
using System.Collections.Generic;
using System.Linq;

namespace Pass;

internal static class Numerology
{
	private static readonly char[] Seperators = new char[4] { ' ', '-', '/', '\\' };

	public static int Calc(string input, bool singleRound = false)
	{
		int num = 0;
		input = input.ToUpper();
		foreach (char c in input)
		{
			if (c >= 'A' && c <= 'Z')
			{
				num += c - 64;
			}
			else if (c >= '0' && c <= '9')
			{
				num += c - 48;
			}
		}
		if (singleRound || num <= 9)
		{
			return num;
		}
		num %= 9;
		if (num != 0)
		{
			return num;
		}
		return 9;
	}

	public static int Calc(char input, bool singleRound = false)
	{
		int num = 0;
		if (input >= 'A' && input <= 'Z')
		{
			num = input - 65 + 1;
		}
		else if (input >= 'a' && input <= 'z')
		{
			num = input - 97 + 1;
		}
		else
		{
			if (input < '0' || input > '9')
			{
				return 0;
			}
			num = input - 48;
		}
		if (singleRound || num <= 9)
		{
			return num;
		}
		num %= 9;
		if (num != 0)
		{
			return num;
		}
		return 9;
	}

	public static int Calc(int input, bool singleRound = false)
	{
		int num = input;
		if (input <= 0)
		{
			return 0;
		}
		if (singleRound)
		{
			input = num;
			num = 0;
			do
			{
				num += input % 10;
				input /= 10;
			}
			while (input > 0);
			return num;
		}
		num %= 9;
		if (num != 0)
		{
			return num;
		}
		return 9;
	}

	public static string Full(string input, int length = 0)
	{
		string text = Calc(input, singleRound: true).ToString();
		string text2 = "";
		while (text.Length > 1)
		{
			text2 = text2 + text + "/";
			text = Calc(text, singleRound: true).ToString();
		}
		text2 += text;
		if (length != 0)
		{
			while (text2.Length > length)
			{
				text2 = text2.TrimStart('/');
				if (text2.Length > length)
				{
					text2 = text2.Remove(0, text2.IndexOf('/'));
				}
			}
		}
		if (text2 != "0")
		{
			return text2;
		}
		return "";
	}

	public static string MultiFull(string input, char[] split = null)
	{
		List<string> list = new List<string>();
		if (split == null)
		{
			split = Seperators;
		}
		string[] array = input.Split(split);
		string text = "";
		for (int i = 0; i < array.Length; i++)
		{
			text = Full(array[i], array[i].Length);
			list.Add(text + new string(' ', array[i].Length - text.Length));
		}
		return string.Join(" ", list);
	}

	public static string Hdc(string input, int returnType)
	{
		string text = "";
		char[] source = new char[10] { 'a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U' };
		for (int i = 0; i < input.Length; i++)
		{
			char c = input.ToUpper()[i];
			text = ((!source.Contains(c)) ? (text + " ") : ((returnType != 3) ? (text + c) : (text + Calc(c))));
		}
		switch (returnType)
		{
		case 0:
		case 3:
			return text;
		case 1:
			return Full(text);
		default:
			return Calc(text).ToString();
		}
	}

	public static string Letters(string input)
	{
		input = input.ToUpper();
		string text = "";
		for (int i = 0; i < input.Length; i++)
		{
			char c = input.ToUpper()[i];
			if (!int.TryParse(c.ToString(), out var result))
			{
				result = c - 64;
				text = ((result < 1 || result > 26) ? (text + " ") : (text + Calc(result.ToString())));
			}
			else
			{
				text += result;
			}
		}
		return text;
	}

	public static int CountWords(string input)
	{
		return input.Split(Seperators).Length;
	}

	public static string GetWord(string input, int which)
	{
		string[] array = input.Split(Seperators);
		if (which <= array.Length)
		{
			return array[which - 1];
		}
		return "";
	}

	public static string PinCha(string input, PinChaType returnType)
	{
		if (CountWords(input) != 3)
		{
			return "";
		}
		int num = Calc(GetWord(input, 2));
		int num2 = Calc(GetWord(input, 1));
		int num3 = Calc(GetWord(input, 3));
		int num4 = Calc(num + num2);
		int num5 = Calc(num2 + num3);
		int num6 = Calc(num4 + num5);
		int num7 = Calc(num + num3);
		int num8 = Math.Abs(num - num2);
		int num9 = Math.Abs(num2 - num3);
		int num10 = Math.Abs(num8 - num9);
		int num11 = Math.Abs(num - num3);
		return returnType switch
		{
			PinChaType.P1 => num4.ToString(), 
			PinChaType.P2 => num5.ToString(), 
			PinChaType.P3 => num6.ToString(), 
			PinChaType.P4 => num7.ToString(), 
			PinChaType.C1 => num8.ToString(), 
			PinChaType.C2 => num9.ToString(), 
			PinChaType.C3 => num10.ToString(), 
			PinChaType.C4 => num11.ToString(), 
			PinChaType.PPP_P => $"{num4}{num5}{num6}-{num7}", 
			PinChaType.CCC_C => $"{num8}{num9}{num10}-{num11}", 
			PinChaType.PPPP => $"{num4}{num5}{num6}{num7}", 
			PinChaType.CCCC => $"{num8}{num9}{num10}{num11}", 
			PinChaType.PPPP_CCCC => $"{num4}{num5}{num6}{num7}-{num8}{num9}{num10}{num11}", 
			_ => "", 
		};
	}

	public static string Repeat(char letter)
	{
		string text = "";
		for (int num = Calc(letter.ToString()); num > 0; num--)
		{
			text += letter;
		}
		return text;
	}

	public static string Repeat(string word)
	{
		string text = "";
		for (int i = 0; i < word.Length; i++)
		{
			for (int num = Calc(word[i]); num > 0; num--)
			{
				text += word[i];
			}
		}
		return text;
	}

	public static string Combine(string inputA, string inputB)
	{
		int num = Math.Min(inputA.Length, inputB.Length);
		char[] array = new char[num];
		for (int i = 0; i < num; i++)
		{
			int num2 = (Calc(inputA[i]) + Calc(inputB[i])) % 9;
			array[i] = (char)(48 + ((num2 == 0) ? 9 : num2));
		}
		return new string(array);
	}

	public static string[] Seasons(string DOB)
	{
		string[] array = new string[4];
		int num = 36 - Calc(DOB);
		array[0] = "0 ~ " + num;
		array[1] = num + 1 + " ~ " + (num + 9);
		array[2] = num + 10 + " ~ " + (num + 18);
		array[3] = num + 19 + " ~~";
		return array;
	}

	public static string SeasonFinder(string DOB)
	{
		DateTime now = DateTime.Now;
		int num = 36 - Calc(DOB);
		int num2 = now.Year - int.Parse(GetWord(DOB, 3));
		string result = "1";
		if (num2 > num)
		{
			result = "2";
		}
		if (num2 > num + 9)
		{
			result = "3";
		}
		if (num2 > num + 18)
		{
			result = "4";
		}
		return result;
	}

	public static int AgeFinder(string DOB)
	{
		object word = GetWord(DOB, 3);
		word = int.Parse((string)word);
		return DateTime.Now.Year - (int)word;
	}

	public static string SpaceOutString(string input, bool skipSpace, int spaces = 1)
	{
		string text = "";
		for (int i = 0; i < input.Length; i++)
		{
			if (!skipSpace || input[i] != ' ')
			{
				text = text + input[i] + new string(' ', spaces);
			}
		}
		return text;
	}
}
