using System;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Drawing;
using System.Windows.Forms;
using Pass.Properties;

namespace Pass.Dialogs;

public class ServerManager : Form
{
	private bool hasChanged;

	private bool loaded;

	private int currentIndex = -1;

	private bool isFinished;

	private IContainer components;

	private Label label1;

	private Label label2;

	private ListBox serverList_lst;

	private TextBox serverAddress_txt;

	private Button ok_btn;

	private TextBox serverName_txt;

	private Label label5;

	private Button apply_btn;

	private Button new_btn;

	private Button delete_btn;

	public ServerManager()
	{
		InitializeComponent();
		base.FormClosed += pass_serverManager_FormClosed;
	}

	public static void ManageServers()
	{
		ServerManager serverManager = new ServerManager();
		serverManager.Show();
		while (!serverManager.isFinished)
		{
			Application.DoEvents();
		}
	}

	private void pass_serverManager_FormClosed(object sender, FormClosedEventArgs e)
	{
		servers.Default.Save();
		isFinished = true;
	}

	private void button1_Click(object sender, EventArgs e)
	{
		Close();
	}

	private void pass_serverManager_Load(object sender, EventArgs e)
	{
		updateList();
	}

	private void updateList()
	{
		serverList_lst.Items.Clear();
		StringEnumerator enumerator = servers.Default.ServerName.GetEnumerator();
		try
		{
			while (enumerator.MoveNext())
			{
				string current = enumerator.Current;
				serverList_lst.Items.Add(current);
			}
		}
		finally
		{
			if (enumerator is IDisposable disposable)
			{
				disposable.Dispose();
			}
		}
	}

	private void serverList_lst_SelectedIndexChanged(object sender, EventArgs e)
	{
		if (hasChanged && !loaded)
		{
			MessageBox.Show("Changes where not saved!");
			hasChanged = false;
			apply_btn.Enabled = false;
			while ((string)serverList_lst.Items[serverList_lst.Items.Count - 1] == "Unamed")
			{
				serverList_lst.Items.RemoveAt(serverList_lst.Items.Count - 1);
				hasChanged = false;
				apply_btn.Enabled = false;
			}
		}
		if (!loaded && serverList_lst.SelectedIndex > -1)
		{
			currentIndex = serverList_lst.SelectedIndex;
			loaded = true;
			serverName_txt.Text = servers.Default.ServerName[currentIndex];
			serverAddress_txt.Text = servers.Default.ServerAddress[currentIndex];
			loaded = false;
		}
	}

	private void serverTextChanged(object sender, EventArgs e)
	{
		if (!loaded)
		{
			hasChanged = true;
			apply_btn.Enabled = true;
		}
	}

	private void apply_btn_Click(object sender, EventArgs e)
	{
		if (serverAddress_txt.Text != "" && serverName_txt.Text != "")
		{
			if (currentIndex + 1 > servers.Default.ServerAddress.Count)
			{
				servers.Default.ServerAddress.Add("adas");
				servers.Default.ServerName.Add("asdas");
			}
			servers.Default.ServerAddress[currentIndex] = serverAddress_txt.Text;
			servers.Default.ServerName[currentIndex] = serverName_txt.Text;
			hasChanged = false;
			apply_btn.Enabled = false;
		}
		else
		{
			MessageBox.Show("'Database Name' and 'Database Address' can not be empty");
		}
		updateList();
	}

	private void new_btn_Click(object sender, EventArgs e)
	{
		loaded = true;
		hasChanged = true;
		apply_btn.Enabled = true;
		serverList_lst.Items.Add("Unamed");
		serverList_lst.SelectedIndex = serverList_lst.Items.Count - 1;
		currentIndex = serverList_lst.SelectedIndex;
		loaded = false;
	}

	private void delete_btn_Click(object sender, EventArgs e)
	{
		if (currentIndex > -1)
		{
			servers.Default.ServerAddress.RemoveAt(currentIndex);
			servers.Default.ServerName.RemoveAt(currentIndex);
			updateList();
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
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Pass.Dialogs.ServerManager));
		this.label1 = new System.Windows.Forms.Label();
		this.label2 = new System.Windows.Forms.Label();
		this.serverList_lst = new System.Windows.Forms.ListBox();
		this.serverAddress_txt = new System.Windows.Forms.TextBox();
		this.ok_btn = new System.Windows.Forms.Button();
		this.serverName_txt = new System.Windows.Forms.TextBox();
		this.label5 = new System.Windows.Forms.Label();
		this.apply_btn = new System.Windows.Forms.Button();
		this.new_btn = new System.Windows.Forms.Button();
		this.delete_btn = new System.Windows.Forms.Button();
		base.SuspendLayout();
		this.label1.AutoSize = true;
		this.label1.Location = new System.Drawing.Point(12, 9);
		this.label1.Name = "label1";
		this.label1.Size = new System.Drawing.Size(38, 13);
		this.label1.TabIndex = 0;
		this.label1.Text = "Server";
		this.label2.AutoSize = true;
		this.label2.Location = new System.Drawing.Point(181, 48);
		this.label2.Name = "label2";
		this.label2.Size = new System.Drawing.Size(79, 13);
		this.label2.TabIndex = 1;
		this.label2.Text = "Server Address";
		this.serverList_lst.FormattingEnabled = true;
		this.serverList_lst.Location = new System.Drawing.Point(12, 25);
		this.serverList_lst.Name = "serverList_lst";
		this.serverList_lst.Size = new System.Drawing.Size(166, 121);
		this.serverList_lst.TabIndex = 2;
		this.serverList_lst.SelectedIndexChanged += new System.EventHandler(serverList_lst_SelectedIndexChanged);
		this.serverAddress_txt.Location = new System.Drawing.Point(184, 64);
		this.serverAddress_txt.Name = "serverAddress_txt";
		this.serverAddress_txt.Size = new System.Drawing.Size(219, 20);
		this.serverAddress_txt.TabIndex = 3;
		this.serverAddress_txt.TextChanged += new System.EventHandler(serverTextChanged);
		this.ok_btn.Location = new System.Drawing.Point(328, 152);
		this.ok_btn.Name = "ok_btn";
		this.ok_btn.Size = new System.Drawing.Size(75, 23);
		this.ok_btn.TabIndex = 4;
		this.ok_btn.Text = "OK";
		this.ok_btn.UseVisualStyleBackColor = true;
		this.ok_btn.Click += new System.EventHandler(button1_Click);
		this.serverName_txt.Location = new System.Drawing.Point(184, 25);
		this.serverName_txt.Name = "serverName_txt";
		this.serverName_txt.Size = new System.Drawing.Size(219, 20);
		this.serverName_txt.TabIndex = 8;
		this.serverName_txt.TextChanged += new System.EventHandler(serverTextChanged);
		this.label5.AutoSize = true;
		this.label5.Location = new System.Drawing.Point(181, 9);
		this.label5.Name = "label5";
		this.label5.Size = new System.Drawing.Size(69, 13);
		this.label5.TabIndex = 7;
		this.label5.Text = "Server Name";
		this.apply_btn.Enabled = false;
		this.apply_btn.Location = new System.Drawing.Point(328, 90);
		this.apply_btn.Name = "apply_btn";
		this.apply_btn.Size = new System.Drawing.Size(75, 23);
		this.apply_btn.TabIndex = 9;
		this.apply_btn.Text = "Apply";
		this.apply_btn.UseVisualStyleBackColor = true;
		this.apply_btn.Click += new System.EventHandler(apply_btn_Click);
		this.new_btn.Location = new System.Drawing.Point(12, 152);
		this.new_btn.Name = "new_btn";
		this.new_btn.Size = new System.Drawing.Size(75, 23);
		this.new_btn.TabIndex = 10;
		this.new_btn.Text = "New";
		this.new_btn.UseVisualStyleBackColor = true;
		this.new_btn.Click += new System.EventHandler(new_btn_Click);
		this.delete_btn.Location = new System.Drawing.Point(103, 152);
		this.delete_btn.Name = "delete_btn";
		this.delete_btn.Size = new System.Drawing.Size(75, 23);
		this.delete_btn.TabIndex = 11;
		this.delete_btn.Text = "Delete";
		this.delete_btn.UseVisualStyleBackColor = true;
		this.delete_btn.Click += new System.EventHandler(delete_btn_Click);
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(410, 184);
		base.Controls.Add(this.delete_btn);
		base.Controls.Add(this.new_btn);
		base.Controls.Add(this.apply_btn);
		base.Controls.Add(this.serverName_txt);
		base.Controls.Add(this.label5);
		base.Controls.Add(this.ok_btn);
		base.Controls.Add(this.serverAddress_txt);
		base.Controls.Add(this.serverList_lst);
		base.Controls.Add(this.label2);
		base.Controls.Add(this.label1);
		base.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.MaximizeBox = false;
		base.MinimizeBox = false;
		base.Name = "pass_serverManager";
		base.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
		this.Text = "Server Manager - Pass 3";
		base.Load += new System.EventHandler(pass_serverManager_Load);
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
