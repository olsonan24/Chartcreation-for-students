using System;
using System.Windows.Forms;
using Pass.Forms;

namespace Pass;

internal static class Program
{
	[STAThread]
	private static void Main()
	{
		Application.EnableVisualStyles();
		Application.SetCompatibleTextRenderingDefault(defaultValue: false);
		Application.Run(new SimpleList());
	}
}
