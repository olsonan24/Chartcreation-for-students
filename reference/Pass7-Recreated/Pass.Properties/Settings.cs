using System.CodeDom.Compiler;
using System.Configuration;
using System.Diagnostics;
using System.Runtime.CompilerServices;

namespace Pass.Properties;

[CompilerGenerated]
[GeneratedCode("Microsoft.VisualStudio.Editors.SettingsDesigner.SettingsSingleFileGenerator", "14.0.0.0")]
internal sealed class Settings : ApplicationSettingsBase
{
	private static Settings defaultInstance = (Settings)SettingsBase.Synchronized(new Settings());

	public static Settings Default => defaultInstance;

	[ApplicationScopedSetting]
	[DebuggerNonUserCode]
	[SpecialSetting(SpecialSetting.ConnectionString)]
	[DefaultSettingValue("Data Source=roman-pc\\sqlexpress;Initial Catalog=pass2;Integrated Security=True")]
	public string pass2ConnectionString => (string)this["pass2ConnectionString"];

	[UserScopedSetting]
	[DebuggerNonUserCode]
	[DefaultSettingValue("Roman-PC\\sqlexpress|toshiba\\toshiba")]
	public string serverList
	{
		get
		{
			return (string)this["serverList"];
		}
		set
		{
			this["serverList"] = value;
		}
	}

	[UserScopedSetting]
	[DebuggerNonUserCode]
	[DefaultSettingValue("0")]
	public int LastDB
	{
		get
		{
			return (int)this["LastDB"];
		}
		set
		{
			this["LastDB"] = value;
		}
	}
}
