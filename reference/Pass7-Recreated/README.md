# Pass 7 Numerology Chart Creator

This is the recovered, editable source project for Peter Vaughan's original Pass 7 Windows application.

## Run the finished application

Open `release\Pass7` and double-click `Pass.exe`.

The program starts with the original client list. Add a person using a full name, called name, and date of birth in `DD/MM/YYYY` format. Select a person to open the individual chart, or check two or more people to use Multi Chart.

## Preserved behavior

- Original Windows Forms screens and controls
- Original name and date-of-birth calculation engine
- Individual 20-year and 50-year chart windows
- Three-year monthly chart section
- Multi-person year and month comparison views
- Original colors, logo, icon, labels, and version text
- A4 PDF generation through PDFsharp
- Legacy SQL Server client/database classes retained in source

The active client list intentionally behaves like the recovered executable: clients are kept in memory and are cleared when the application closes.

## Edit or rebuild

Open `Pass7.sln` in Visual Studio, or run `BUILD_RELEASE.cmd` from this folder. The project targets .NET Framework 4.6.1 and builds on current .NET SDKs using Microsoft reference assemblies supplied through NuGet.

The finished application is placed in `release\Pass7`.

## Important source areas

- `Pass\Numerology.cs` - core reduction and name/DOB formulas
- `Pass\Report.cs` - complete chart data model
- `Pass.Forms\QuickForm.cs` - individual chart window
- `Pass.Forms\MultiChart.cs` - multi-person comparison window
- `Pass.Controls\MultichartCtrl.cs` - comparison chart renderer
- `Pass\PdfDocument.cs` - A4 PDF layout and printing
- `Pass\Database.cs` - retained legacy SQL Server support

## Recovery note

The source was reconstructed from the original `pass.exe` and its matching `pass.pdb`. The original application folder was not modified. The only compatibility adjustment is targeting .NET Framework 4.6.1 instead of 4.6 so the recovered WinForms resources build reliably with current tooling; the numerology calculations and visible behavior are unchanged.
