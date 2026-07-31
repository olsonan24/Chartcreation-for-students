using System.CodeDom.Compiler;
using System.Collections.Specialized;
using System.Configuration;
using System.Diagnostics;
using System.Runtime.CompilerServices;

namespace Pass.Properties;

[CompilerGenerated]
[GeneratedCode("Microsoft.VisualStudio.Editors.SettingsDesigner.SettingsSingleFileGenerator", "14.0.0.0")]
internal sealed class servers : ApplicationSettingsBase
{
	private static servers defaultInstance = (servers)SettingsBase.Synchronized(new servers());

	public static servers Default => defaultInstance;

	[UserScopedSetting]
	[DebuggerNonUserCode]
	[DefaultSettingValue("<?xml version=\"1.0\" encoding=\"utf-16\"?>\r\n<ArrayOfString xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\">\r\n  <string>Roman-PC</string>\r\n  <string>Toshiba</string>\r\n  <string>Pythag</string>\r\n</ArrayOfString>")]
	public StringCollection ServerName
	{
		get
		{
			return (StringCollection)this["ServerName"];
		}
		set
		{
			this["ServerName"] = value;
		}
	}

	[UserScopedSetting]
	[DebuggerNonUserCode]
	[DefaultSettingValue("<?xml version=\"1.0\" encoding=\"utf-16\"?>\r\n<ArrayOfString xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\">\r\n  <string>Roman-PC\\sqlexpress</string>\r\n  <string>Toshiba\\Toshiba</string>\r\n  <string>Pythag</string>\r\n</ArrayOfString>")]
	public StringCollection ServerAddress
	{
		get
		{
			return (StringCollection)this["ServerAddress"];
		}
		set
		{
			this["ServerAddress"] = value;
		}
	}
}
